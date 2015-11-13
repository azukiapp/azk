import { Suggestion as DefaultSuggestion } from 'azk/generator/suggestions';

export class Suggestion extends DefaultSuggestion {
  constructor(...args) {
    super(...args);

    var name    = 'python';
    // Readable name for this suggestion
    this.name = `${name}`;

    // Which rules they suggestion is valid
    this.ruleNamesList = [`${name}`];

    // Initial Azkfile.js suggestion
    this.suggestion = this.extend(this.suggestion, {
      __type   : `${name}`,
      image    : { docker: `azukiapp/${name}` },
      provision: [
        'pip install --user --allow-all-external -r requirements.txt',
      ],
      http    : true,
      scalable: { default: 1 },
      command : ["python", "server.py"],
      mounts  : {
        "/azk/#{app.dir}"    : {type: 'sync', value: '.'},
        '/azk/pythonuserbase': {type: 'persistent', value: 'pythonuserbase'},
      },
      envs    : {
        PATH : '/azk/pythonuserbase/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
        PYTHONUSERBASE: '/azk/pythonuserbase',
      }
    });
  }
}
