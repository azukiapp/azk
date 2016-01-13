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
  writeKey : "e2c70b3dd3ed3003a09a1bc7d8622ad9220fe33069d81" +
             "164f0fafa13baf11458e48736f6cbcc995a8346183b29" +
             "0597504feb4bef06f71350f4859df5eb271a1d845f7cf" +
             "f5c9dfddf2f03de1e39760c6e51a06fb9e347c2e1fb98" +
             "d3c6d370e6916e5db8810ddd9c0d5d83540386ccfe2e",
});

function sendToKeen(event_name, data) {
  return new BB(function (resolve, reject) {
    client.addEvent(event_name, data, function(err, res) {
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
// Check for errors
//
function checkErrors() {
  return globAsync('BENCHMARKS_RESULTS/*.time')
  .then(function (files) {
    return BB.map(files, function (file) {
      return fs.readFileAsync(file)
        .then(function (content) {
          var error_found = typeof getFirstGroupRegex(content.toString(), /(error)/) !== 'undefined';
          if (error_found) {
            return 'Error string found on: ' +
              file                           +
              '\n----------->>\n'            +
              content.toString()             +
              '\n<<-----------\n';
          }
          return null;
        });
    });
  })
}

//
// RUN
//
BB.props({
  errors_list: checkErrors(),
  macId: getMacAsync(),
  allResults: globAsync('BENCHMARKS_RESULTS/*.time')
  .then(function (files) {
    // map each file
    return BB.map(files, function (file) {
      // get content
      return fs.readFileAsync(file)
      .then(function (content) {

        // get command from filename
        var command = file.replace(/BENCHMARKS_RESULTS\//gm, '').replace(/\.time/gm, '');

        // get time from content
        content = content.toString();
        var real = getFirstGroupRegex(content, /real\s+(.+)/);
        var user = getFirstGroupRegex(content, /user\s+(.+)/);
        var sys = getFirstGroupRegex(content, /sys\s+(.+)/);

        return {
          command : command,
          real    : Number(real.replace(/m/gm, '').replace(/s/gm, '')),
          user    : Number(user.replace(/m/gm, '').replace(/s/gm, '')),
          sys     : Number(sys.replace(/m/gm , '').replace(/s/gm, '')),
        };

      });
    });
  }),
}).then(function(propsResults) {

  // if have erros, do not sent any data
  var has_errors = false;
  propsResults.errors_list.forEach(function(item) {
    if (item !== null) {
      console.error(item);
      has_errors = true;
    }
  })
  if (has_errors) {
    process.exit(1);
  }

  // send each result to keen.io
  return BB.map(propsResults.allResults, function (resultItem) {

    var profile_event = {
      command: resultItem.command,
      real: resultItem.real,
      user: resultItem.user,
      sys: resultItem.sys,
      git: require('git-repo-info')(),
      macId: propsResults.macId,
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
