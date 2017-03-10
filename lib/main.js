
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
                if (hkeys.length > 20) {
                    console.log(`${clc.cyan(key)} ${hkeys.length} ${hkeys.slice(0, 2).join(' ')} ...`);
                } else {
                    console.log(`${clc.cyan(key)} ${hkeys.length} ${hkeys.join(' ')}`);
                }
            });
            if (config.limit > 0 && count > config.limit) {
                console.error(clc.yellow('Limit exceeded. Try: limit=0'));
                break;
            }
        }
        if (cursor === 0) {
            break;
        }
    }
}
