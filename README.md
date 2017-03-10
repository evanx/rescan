# rescan

Scan Redis keys and pretty and colourfully print to console.

<img src='https://raw.githubusercontent.com/evanx/rescan/master/docs/readme/images/main.png'>


## Installation

See https://github.com/evanx/rescan/blob/master/bin/rescan.sh

You can install into your `~/node_modules`
```
cd
npm install rescan
```

It will install `rescan` binary into `node_modules/.bin`
```
pattern='*' node_modules/.bin/rescan
```
where this is a `bash` script to run the following command
```
node7 ~/node_modules/rescan/lib/index.js
```
where e.g. `/usr/local/bin/node7` should be symlinked to Node v7
```
ln -s /usr/local/n/versions/node/7.7.1/bin/node /usr/local/bin/node7
```
where this is installed via `n`
```
sudo npm install -g n
sudo n latest
```

In your `~/.bashrc` you can append your $HOME/node_modules/.bin` to your `PATH`
```
export PATH=$PATH:$HOME/node_modules/.bin
```

## Config

See `lib/spec.js` https://github.com/evanx/rescan/blob/master/lib/spec.js
```javascript
    pattern: {
        description: 'the matching pattern for Redis scan',
        example: '*'
    },
    action: {
        description: 'the action to perform e.g. print or delete',
        options: ['print', 'delete'],
        default: 'print'
    },    
    field: {
        description: 'the field name for hashes',
        required: false
    },
    format: {
        description: 'the format',
        options: ['terse', 'verbose'],
        default: 'terse'
    },    
    port: {
        description: 'the Redis port',
        default: 6379
    },
    host: {
        description: 'the Redis host',
        default: 'localhost'
    },
```
where the default Redis `host` is `localhost`

## Implementation

See `lib/main.js` https://github.com/evanx/rescan/blob/master/lib/main.js
```javascript
    let cursor;
    while (true) {
        const [result] = await multiExecAsync(client, multi => {
            multi.scan(cursor || 0, 'match', config.pattern);
        });
        cursor = parseInt(result[0]);
        const keys = result[1];
        const types = await multiExecAsync(client, multi => {
            keys.forEach(key => multi.type(key));
        });
        const hashesKeys = keys.filter((key, index) => types[index] === 'hash');
        if (hashesKeys.length) {
            count += hashesKeys.length;
            const results = await multiExecAsync(client, multi => {
                hashesKeys.forEach(key => multi.hkeys(key));
            });
            hashesKeys.forEach((key, index) => {
                const result = results[index];
                console.log(`${clc.cyan(key)} ${result.join(' ')}`);
            });
        }
    }
```

### Application archetype

Uses application archetype: https://github.com/evanx/redis-app

See `lib/index.js` https://github.com/evanx/rescan/blob/master/lib/index.js
```javascript
require('redis-app')(
    require('../package'),
    require('./spec'),
    () => require('./main')
).catch(err => {
    console.error(err);
});
```
where the `config` is extracted from the `spec` defaults and `process.env` overrides. It is set on `global` before `main` is invoked. Similarly other typical application dependencies including `logger` and `lodash`


## Development

See `package.json` https://github.com/evanx/rescan/blob/master/package.json

For development, you can run as follows:
```
git clone https://github.com/evanx/rescan.git
cat package.json
npm install
pattern='*' npm start
```

## Docker

See `Dockerfile` https://github.com/evanx/rescan/blob/master/Dockerfile
```
FROM mhart/alpine
ADD package.json .
RUN npm install --silent
ADD lib lib
CMD ["node", "lib/index.js"]
```

We can build as follows:
```shell
docker build -t rescan https://github.com/evanx/rescan.git
```
where tagged as image `rescan`

Then for example, we can run on the host's Redis as follows:
```shell
docker run --network=host -e pattern='*' rescan
```
where `--network-host` connects the container to your `localhost` bridge. The default Redis host `localhost` works in that case.

Since the containerized app has access to the host's Redis instance, you should inspect the source.

<hr>

https://twitter.com/@evanxsummers
