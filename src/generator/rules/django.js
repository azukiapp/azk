import { Rule as PythonRule } from 'azk/generator/rules/python';

export class Rule extends PythonRule {
  constructor(ui) {
    super(ui);
    this.type      = 'framework';
    this.name      = "python_django";
    this.rule_name = "python_django";
    this.replaces  = ['python'];

    // Suggest a docker image
    // http://images.azk.io/#/python
    /*
      What Python version can I use with Django?
      (https://docs.djangoproject.com/en/dev/faq/install/)

      Django version       Python versions
      1.4                  2.5, 2.6, 2.7
      1.5                  2.6, 2.7 and 3.2, 3.3 (experimental)
      1.6                  2.6, 2.7 and 3.2, 3.3
      1.7, 1.8             2.7 and 3.2, 3.3, 3.4
    */
    this.version_rules = {
      'python_django-2.7': '<1.7.0',
      'python_django-3.4': '>=1.7.0',
    };
  }

  relevantsFiles () {
    return ['requirements.txt'];
  }

  getFrameworkVersion(content) {
    // http://regex101.com/r/kI9wQ3/1
    var gemDjangoRegex = /^\s*Django==(\d+\.\d+(\.\d+)?)\s*$/gm;

    var capture = gemDjangoRegex.exec(content);
    var djangoVersion = capture && capture.length >= 1 && capture[1];
    if (!djangoVersion) {
      return false;
    }
    var djangoVersionLastPart = capture && capture.length >= 2 && capture[2];
    if (!djangoVersionLastPart) {
      djangoVersion = djangoVersion + '.0';
    }

    return this.semver.clean(djangoVersion);
  }
}
