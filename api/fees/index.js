// require and config db libs
const redis = require('redis');
const redisPort = process.env.REDIS_PORT;
const redisHost = process.env.REDIS_HOST;
const redisPass = process.env.REDIS_PASS;
const redisClient = redis.createClient(redisPort, redisHost);
redisClient.auth(redisPass);

redisClient.on('error', function (err) {
    console.error('Error ' + err);
});

// select fee for specific block target
const feeFor = async (blocks, feeData) => {
    const feeDataSorted = Object.keys(feeData).sort((a, b) => b - a) // sort block targets from highest to lowest
    const minBlock = parseInt(feeDataSorted.slice(-1)[0])

    let res = {}
    for (let b in blocks) {
        const target = (blocks[b] < minBlock) ? minBlock : blocks[b]
        for (let i in feeDataSorted) {
            if (target >= feeDataSorted[i]) {
                res[blocks[b]] = feeData[feeDataSorted[i]]
                break
            }
        }
    }
    return res
}

// export api
module.exports = (req, res) => {
    redisClient.get('fees', (err, reply) => {
        const defaults = [2, 4, 6, 12, 24, 48, 144, 504, 1008];
        //const blocks = (req) ? defaults.concat(req.filter((i) => defaults.indexOf(i) < 0)) : defaults;
        const blocks = defaults
        console.log(req)
        const resFees = feeFor(blocks, reply);

        let respond = {};
        respond.fees = resFees;
        respond.error = err;
        respond.path = req.url;

        res.end(JSON.stringify(respond));
    });
};
