var BB = require('bluebird');
var Keen = require('keen-js');
var os = require('os');
var osName = require('os-name');

var fs = BB.promisifyAll(require("fs"));

var glob = require('glob');
var globAsync = BB.promisify(glob);

var getMac = require('getmac').getMac;
var getMacAsync = BB.promisify(getMac);

// configure keen-io
var client = new Keen({
  // prod
  projectId: "552818c790e4bd7f7bd8baba",
  writeKey: "e2c70b3dd3ed3003a09a1bc7d8622ad9220fe33069d81164f0fafa13baf11458e48736f6cbcc995a8346183b290597504feb4bef06f71350f4859df5eb271a1d845f7cff5c9dfddf2f03de1e39760c6e51a06fb9e347c2e1fb98d3c6d370e6916e5db8810ddd9c0d5d83540386ccfe2e",

  // test
  // projectId: "5526968d672e6c5a0d0ebec6",
  // writeKey: "5dbce13e376070e36eec0c7dd1e7f42e49f39b4db041f208054617863832309c14a797409e12d976630c3a4b479004f26b362506e82a46dd54df0c977a7378da280c05ae733c97abb445f58abb56ae15f561ac9ad774cea12c3ad8628d896c39f6e702f6b035541fc1a562997cb05768",
});

function sendToKeen(event_name, data) {
  return new BB(function (resolve, reject) {
    client.addEvent(event_name, data, function(err, res){
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

function getFirstGroupRegex (content, regex) {
  var re = regex;
  var match;

  if ((match = re.exec(content)) !== null) {
    if (match.index === re.lastIndex) {
        re.lastIndex++;
    }
    return match[1];
  }
}

// global info
var now = new Date().toISOString();
var device_info = {
  os           : osName(),
  proc_arch    : os.arch(),
  total_memory : Math.floor(os.totalmem() / 1024 / 1024),
  cpu_info     : os.cpus()[0].model,
  cpu_count    : os.cpus().length
};


//
// RUN
//
BB.props({
  macId: getMacAsync(),
  allResults: globAsync('SIMPLE/*.time').then(function (files) {

    // map each file
    return BB.map(files, function (file) {
      // get content
      return fs.readFileAsync(file)
      .then(function (content) {

        // get command from filename
        var command = file.replace(/SIMPLE\//gm,'').replace(/\.time/gm,'');

        // get time from content
        content = content.toString();
        var real = getFirstGroupRegex(content, /real\s+(.+)/);
        var user = getFirstGroupRegex(content, /user\s+(.+)/);
        var sys = getFirstGroupRegex(content, /sys\s+(.+)/);

        return {
          command : command,
          real    : Number(real.replace(/m/gm,'').replace(/s/gm,'')),
          user    : Number(user.replace(/m/gm,'').replace(/s/gm,'')),
          sys     : Number(sys.replace(/m/gm,'').replace(/s/gm,'')),
        };

      });
    });
  }),
}).then(function(twoResults) {

  return BB.map(twoResults.allResults, function (resultItem) {

    var profile_event = {
      command: resultItem.command,
      real: resultItem.real,
      user: resultItem.user,
      sys: resultItem.sys,
      git: require('git-repo-info')(),
      macId: twoResults.macId,
      device_info: device_info,
      keen: {
        timestamp: now
      },
    };

    return sendToKeen('profiling', profile_event);
  });
})
.then(function (result) {
  console.log(result);
});
