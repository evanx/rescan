
const clc = require('cli-color');

module.exports = async context => {
    let count = 0;
    let cursor;
    while (true) {
        const [result] = await multiExecAsync(client, multi => {
            multi.scan(cursor || 0, 'match', config.pattern);
        });
        cursor = parseInt(result[0]);
        const keys = result[1];
        if (config.action === 'del') {
            await multiExecAsync(client, multi => {
                keys.forEach(key => {
                    console.log(clc.red(key));
                    multi.del(key);
                });
            });
        } else if (config.field) {
            const types = await multiExecAsync(client, multi => {
                keys.forEach(key => multi.type(key));
            });
            const hashesKeys = keys.filter((key, index) => types[index] === 'hash');
            if (hashesKeys.length) {
                count += hashesKeys.length;
                const results = await multiExecAsync(client, multi => {
                    hashesKeys.forEach(key => multi.hget(key, config.field));
                });
                hashesKeys.forEach((key, index) => {
                    console.log(clc.cyan(key), results[index]);
                });
            }
        } else if (config.action === 'hkeys') {
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
                    const hkeys = results[index];
                    if (hkeys.length > 10) {
                        console.log(clc.cyan(key), hkeys.length, hkeys.slice(0, 2).join(' '), '...');
                    } else {
                        console.log(clc.cyan(key), hkeys.length, hkeys.join(' '));
                    }
                });
            }
        } else if (config.action === 'hgetall') {
            const types = await multiExecAsync(client, multi => {
                keys.forEach(key => multi.type(key));
            });
            const hashesKeys = keys.filter((key, index) => types[index] === 'hash');
            if (hashesKeys.length) {
                count += hashesKeys.length;
                const results = await multiExecAsync(client, multi => {
                    hashesKeys.forEach(key => multi.hgetall(key));
                });
                hashesKeys.forEach((key, index) => {
                    const hgetall = results[index];
                    console.log(clc.cyan.bold(key));
                    Object.keys(hgetall).forEach(hkey => {
                        const hvalue = hgetall[hkey];
                        console.log(clc.cyan(hkey), hvalue);
                    });
                });
            }
        } else if (config.action === 'llen') {
            const types = await multiExecAsync(client, multi => {
                keys.forEach(key => multi.type(key));
            });
            const listKeys = keys.filter((key, index) => types[index] === 'list');
            if (listKeys.length) {
                count += listKeys.length;
                const results = await multiExecAsync(client, multi => {
                    listKeys.forEach(key => multi.llen(key));
                });
                listKeys.forEach((key, index) => {
                    const llen = results[index];
                    console.log(clc.cyan(key), llen);
                });
            }
        } else {
            await multiExecAsync(client, multi => {
                keys.forEach(key => {
                    console.log(clc.yellow(key));
                });
            });
        }
        if (config.limit > 0 && count > config.limit) {
            console.error(clc.yellow('Limit exceeded. Try: limit=0'));
            break;
        }
        if (cursor === 0) {
            break;
        }
    }
}
