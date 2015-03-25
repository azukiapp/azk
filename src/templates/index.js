import { _, async, lazy_require } from 'azk';
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
  constructor(ui, msg) {
    super(ui);
    this.msg = msg;
  }

  run() {
    var question = {
      type    : 'confirm',
      name    : 'start',
      message : this.msg,
      default : 'Y'
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

  required: not_implemented,
  add_env: not_implemented,

  systems: not_implemented,
  pre: not_implemented,
  pos: not_implemented,
};

export class Template extends UIProxy {
  constructor(content, source, user_interface) {
    super(user_interface);
    this.content   = content;
    this.source    = source;
    this.questions = {};
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

  process() {
    return async(this, function* () {
      var question, answers = {};
      for (var name in this.questions) {
        if (this.questions.hasOwnProperty(name)) {
          question = this.questions[name];
          yield question.run();
        }
      }
      console.log(answers);
    });
  }
}
