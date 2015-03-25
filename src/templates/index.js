import { _, Q, async, utils, lazy_require, path } from 'azk';
import { UIProxy } from 'azk/cli/ui';
import { ManifestError } from 'azk/utils/errors';

var qfs   = require('q-io/fs');
var check = require('syntax-error');

/* global runInNewContext */
lazy_require(this, {
  runInNewContext: ['vm'],
});

var not_implemented = function() {
  throw new Error('questions not implemented');
};

class Question extends UIProxy {
  constructor(ui, msg, options, validate) {
    super(ui);
    this.msg = msg;
    if (_.isFunction(options)) {
      this.validate = options;
    } else {
      this.options = options || {};
      this.validate = validate || function() { };
    }
  }

  run() {
    console.log(this.options);
    var question = {
      message : this.msg,
      type    : this.options.type || 'input',
      name    : this.options.name || 'answer',
      default : this.options.default
    };

    return this.prompt(question);
  }
}

var TemplateDsl = {
  question(...args) {
    return new Question(this, ...args);
  },

  questions(questions) {
    _.each(questions, (data, name) => {
      this.addQuestion(name, data);
    });
  },

  add_env(k, v) {
    this.envs[k] = v;
  },

  required: not_implemented,

  systems(systems) {
    this.systems = systems;
  },
  pre(func) {
    this.pre = func;
  },
  pos(func) {
    this.pos = func;
  },
};

export class Template extends UIProxy {
  constructor(content, source, user_interface) {
    super(user_interface);
    this.content   = content;
    this.source    = source;
    this.questions = {};
    this.answers = {};
    this.systems = {};
    this.envs = {};
    this.parse();
  }

  addQuestion(name, data) {
    this.questions[name] = data;
  }

  static fetch(source, user_interface) {
    return qfs.read(source)
      .then((content) => {
        return new this(content, source, user_interface);
      });
  }

  parse() {
    var err = check(this.content, this.source);
    if (err) {
      throw new ManifestError(this.source, err);
    } else {
      try {
        runInNewContext(this.content, Template.createDslContext(this), this.source);
      } catch (e) {
        if (!(e instanceof ManifestError)) {
          var stack = e.stack.split('\n');
          var msg   = stack[0] + "\n" + stack[1];
          throw new ManifestError(this.source, msg);
        }
        throw e;
      }
    }
  }

  static createDslContext(target) {
    return _.reduce(TemplateDsl, (context, func, name) => {
      if (_.isFunction(func)) {
        context[name] = func.bind(target);
      } else {
        context[name] = func;
      }
      return context;
    }, { });
  }

  _processQuestions() {
    return async(this, function* () {
      var question, answers = {};
      for (var name in this.questions) {
        if (this.questions.hasOwnProperty(name)) {
          question = this.questions[name];
          answers[name] = (yield question.run()).answer;
        }
      }
      return answers;
    });
  }

  _replace_keep_keys(template) {
    // TODO: improve regexp to: except question
    var regex = /(?:(?:[#|$]{|<%)[=|-]?)\s*((?:system|net|manifest|azk|envs)\.[\S]+?)\s*(?:}|%>)/g;
    return template.replace(regex, "#{_keep_key('$1')}");
  }

  _processSystems(answers) {
    var template = this._replace_keep_keys(JSON.stringify(this.systems));
    var data = {
      _keep_key(key) {
        return "#{" + key + "}";
      },
      question: answers,
    };
    return JSON.parse(utils.template(template, data));
  }

  context(manifest) {
    var self = this;
    return {
      Azkfile: {
        get files() {
          // TODO: Load files and from manifest path
          return [];
        },
        get systems() {
          return manifest.systems;
        }
      },
      get question() {
        return self.answers;
      },
      get files() {
        // TODO Load template files
        return [];
      },
      get systems() { return self.systems; },
    };
  }

  _processPre(context) {
    return this._callOrResolve(this.pre, context);
  }

  _processPos(context) {
    return this._callOrResolve(this.pos, context);
  }

  _callOrResolve(func, context) {
    if (_.isFunction(func)) {
      return Q.nfcall(func, context);
    } else {
      return Q();
    }
  }

  _persistEnvs(manifest) {
    return async(this, function* () {
      var envs_str = '';
      _.each(this.envs, (v, k) => {
        return envs_str += `${k}=${v}\r\n`;
      });
      return yield qfs.append(path.join(manifest.manifestPath, '.env'), envs_str);
    });
  }

  process(manifest) {
    return async(this, function* () {
      var context = this.context(manifest);
      yield this._processPre(context);
      this.answers = yield this._processQuestions();
      var systems = yield this._processSystems(this.answers);
      yield this._processPos(context);
      yield this._persistEnvs(manifest);
      return systems;
    });
  }
}
