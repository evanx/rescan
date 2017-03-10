
require('redis-app')(
    require('../package'),
    require('./spec'),
    () => require('./main')
).catch(err => {
    console.error(err);
});
