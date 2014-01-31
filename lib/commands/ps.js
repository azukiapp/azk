//
// Ps
//
module.exports = function(commander) {
  commander.command('ps')
    .description('Displays a information about the application process')
    .action(function(cmd) {
      console.log(cmd);
      //var docker = require('docker.io')({ socketPath: false, host: 'http://127.0.0.42', port: '4243' })

      //console.log(docker);

      //docker.containers.list(function(err, res){
        //console.error(err, res)
        ////if (err) throw err;
        ////console.log(res);
      //});
      //require('commands.ps')
    })
}
