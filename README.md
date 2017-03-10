# rescan

Scan Redis keys and pretty and colourfully print to console.

<img src='https://raw.githubusercontent.com/evanx/rescan/master/docs/readme/images/options.png'>


## Config

See `lib/spec.js`
```javascript
    pattern: {
        description: 'the matching pattern for Redis scan',
        example: '*'
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

See `app/index.js`
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
```

## Development

For development, you can run as follows:
```
git clone https://github.com/evanx/rescan.git
cat package.json
npm install
pattern='*' npm start
```

## Docker

```shell
docker build -t rescan https://github.com/evanx/rescan.git
```
where tagged as image `rescan`

```shell
docker run --network=host -e pattern='*' rescan
```
where `--network-host` connects the container to your `localhost` bridge. The default Redis host `localhost` works in that case.

Since the containerized app has access to the host's Redis instance, you should inspect the source.

See `Dockerfile`
```
FROM mhart/alpine
ADD package.json .
RUN npm install --silent
ADD lib lib
CMD ["node", "lib/index.js"]
```

<hr>

https://twitter.com/@evanxsummers
