import { _, config } from 'azk';

module.change_code = 1;
module.exports = function(app) {
  // Return configs from set by Configure
  app.get('/configs', (req, res) => {
    var keys = config('agent:config_keys');
    res.json(_.reduce(keys, (acc, key) => {
      acc[key] = config(key);
      return acc;
    }, {}));
  });
};
