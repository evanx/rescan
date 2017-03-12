
require('redis-app')(
    require('../package'),
    require('./spec'),
    async redisApp => Object.assign(global, redisApp),
    () => require('./main')
).catch(err => {
    console.error(err);
});
