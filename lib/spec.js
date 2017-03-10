
module.exports = pkg => ({
    description: pkg.description,
    env: {
        pattern: {
            description: 'the matching pattern for Redis scan',
            example: '*'
        },
        field: {
            description: 'the field name for hashes',
            required: false
        },
        format: {
            description: 'the format to print the key and optional details',
            required: false,
            options: ['verbose', 'terse'],
            default: 'verbose',
        },
        action: {
            description: 'the action to perform e.g. print or delete',
            options: ['print', 'del', 'hkeys', 'hgetall', 'llen'],
            default: 'print'
        },
        limit: {
            description: 'the maximum number of keys to print',
            note: 'zero means unlimited',
            default: 30
        },
        port: {
            description: 'the Redis host port',
            default: 6379
        },
        host: {
            description: 'the Redis host address',
            default: 'localhost'
        },
        password: {
            description: 'the Redis host password',
            required: false
        },
        logging: {
            description: 'the logging level',
            default: 'info'
        }
    },
    development: {
        logging: 'debug'
    }
});
