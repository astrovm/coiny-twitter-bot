// require libs
const trae = require('trae')

// require and config db
const redis = require('redis');
const redisPort = process.env.REDIS_PORT;
const redisHost = process.env.REDIS_HOST;
const redisPass = process.env.REDIS_PASS;
const redisClient = redis.createClient(redisPort, redisHost);
redisClient.auth(redisPass);

redisClient.on('error', (err) => {
    console.error('Error ' + err);
});

// request bitgo api fees
const getFees = async () => {
    try {
        const res = await trae.get('https://www.bitgo.com/api/v1/tx/fee')
        const newFees = await sortFees(res.data.feeByBlockTarget)
        return newFees
    } catch (err) {
        console.error(err)
        return err
    }
}

// sort fees object
const sortFees = (req) => {
    const feesSorted = Object.keys(req).sort((a, b) => req[b] - req[a]) // sort fee numbers
    const blocksSorted = Object.keys(req).sort((a, b) => a - b) // sort block target numbers
    // recreate fees object by matching sorted blocks with sorted fees
    let res = {}
    for (let i in feesSorted) {
        res[blocksSorted[i]] = Math.ceil(req[feesSorted[i]] / 1000)
    }
    return res
}

// export api
module.exports = (req, res) => {
    // check last time updated
    redisClient.get('fees:time', async (err, reply) => {
        if (err) {
            console.error('Error ' + err);
        }

        const ONE_HOUR = 60 * 60 * 1000;
        const currentTime = Date.now();
        const keyTime = ((reply == null) ? (currentTime - ONE_HOUR) : reply);

        // if last time >= one hour, update it now
        if ((currentTime - keyTime) >= ONE_HOUR) {
            const fees = JSON.stringify(await getFees());
            const currentTime = Date.now();

            redisClient.set('fees', fees, (err, reply) => {
                console.log(err, reply)
                redisClient.set('fees:time', currentTime, (err, reply) => {
                    console.log(err, reply)
                    res.end('Updated ' + fees);
                });
            });
        } else {
            res.end('Already updated ' + req.url);
        }
    });
};
