import h from 'spec/spec_helper';
import { _, t, lazy_require } from 'azk';
import { UIProxy } from 'azk/cli/ui';
import { AskSendErrorView } from 'azk/cli/views/ask_send_error_view';
import { all } from 'azk/utils/promises';
import { promiseResolve } from 'azk/utils/promises';

var lazy = lazy_require({
  Configuration: ['azk/configuration'],
});

describe("Azk cli view, ask send error", function() {
  var outputs = [];
  var ui      = h.mockUI(beforeEach, outputs);

  it("should as a extends of UIProxy", function() {
    let view = new AskSendErrorView(ui);
    view.fail('fail msg');
    h.expect(view).to.instanceof(UIProxy);
    h.expect(outputs[0]).to.match(/fail msg/);
  });

  it("should return crash report always if not in interfactive mode", function() {
    let view = new AskSendErrorView(ui);
    return all([
      h.expect(view.askToSend({ always_send: false })).to.eventually.false,
      h.expect(view.askToSend({ always_send: true })).to.eventually.ok,
    ]);
  });

  describe("call askToSend in a interactive session", function() {
    let n_ui = _.clone(ui);
    n_ui.isInteractive = () => true;
    let configuration = new lazy.Configuration({ namespace: 'test.ask_send_error_view' });

    beforeEach(() => {
      configuration.resetAll();
    });

    it("should return false if crash report always is disable", function() {
      let view = new AskSendErrorView(n_ui, configuration);
      return h.expect(view.askToSend({ always_send: false })).to.eventually.false;
    });

    it("should return false if always_ask_email is false", function() {
      // Setting ask status
      configuration.save('user.email_always_ask', false);

      let view = new AskSendErrorView(n_ui, configuration);
      return h.expect(view.askToSend()).to.eventually.ok;
    });

    it("should ask e-mail, save it and return true", function() {
      let email = "foobar@azk.dev.azk.io";
      let ui    = _.clone(n_ui);
      ui.prompt = (opts) => {
        ui.opts = opts;
        return promiseResolve({result: email});
      };

      let view   = new AskSendErrorView(ui, configuration);
      let result = view.askToSend().then((result) => {
        let email = configuration.load('user.email');
        return { result, email, prompt_opts: ui.opts, outputs };
      });

      return h.expect(result).to.eventually
        .containSubset({
          result: true,
          email : email,
          prompt_opts: {
            type    : 'input',
            name    : 'result',
            message : 'crashReport.email.question',
            default : undefined,
          }
        })
        .and.have.deep.property('outputs[1]').match(/foobar/);
    });

    it("should ask e-mail with validate and support blank e-mail", function() {
      let ui = _.clone(n_ui);

      // Test valid
      ui.prompt = (opts) => {
        let email = "foobar@azk.dev.azk.io";
        h.expect(opts.validate("")).to.be.true;
        h.expect(opts.validate(email)).to.be.true;
        h.expect(opts.validate(124)).to.match(/124/);
        h.expect(opts.validate("foobar")).to.match(/foobar/);
        return promiseResolve({result: ""});
      };

      let view = new AskSendErrorView(ui, configuration);
      let result = view.askToSend().then((result) => {
        let email = configuration.load('user.email');
        return { result, email, prompt_opts: ui.opts, outputs };
      });

      let msg_regex = new RegExp(h.escapeRegExp(t('commands.config.email_reset-to-null')));

      return h.expect(result).to.eventually
        .containSubset({
          result: true,
          email : undefined,
        })
        .and.have.deep.property('outputs[1]').match(msg_regex);
    });

    it("should inquirer if ask email aigan after not provide e-mail", function() {
      let ui     = _.clone(n_ui);
      let called = 0;
      ui.prompt  = (opts) => {
        called++;
        return promiseResolve({result: opts.type === "confirm" ? false : ""});
      };

      let view   = new AskSendErrorView(ui, configuration);
      let result = view.askToSend()
      .then(() => {
        return view.askToSend();
      })
      .then(() => {
        return view.askToSend();
      })
      .then((result) => {
        let count  = configuration.load('user.email_ask_count');
        let always = configuration.load('user.email_always_ask');
        return { result, count, called, always, outputs };
      });

      return h.expect(result).to.eventually
        .containSubset({
          result: true,
          count : 2,
          called: 3,
          always: false,
        });
    });
  });
});
