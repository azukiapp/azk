var InitCommand = function(program) {
  program
  .command('init [project]')
  .description('start your project')
  .option('-b, --box <box>')
  .action(function(project, options) {
    console.log('init command with: ', {project: project, box: options.box});
  });
};

module.exports = InitCommand
