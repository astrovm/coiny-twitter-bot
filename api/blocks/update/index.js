// require libs
const trae = require('trae')
const { promisify } = require('util');

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
const redisGet = promisify(redisClient.get).bind(redisClient);
const redisSet = promisify(redisClient.set).bind(redisClient);

// request smartbit api
const getBlocks = async () => {
    try {
        const resTotals = await trae.get('https://api.smartbit.com.au/v1/blockchain/totals');
        const resBlockchainSize = await trae.get('https://api.smartbit.com.au/v1/blockchain/chart/block-size-total?from=2019-5-01');
        let blocks = {};
        blocks.lastBlockHeight = resTotals.data.totals.block_count - 1;
        blocks.size = (Number(resBlockchainSize.data.chart.data.slice(-1)[0].y) / 1000000000).toFixed(2);
        return blocks;
    } catch (err) {
        console.error(err);
        return err;
    };
};

// export api
module.exports = (req, res) => {
    // check last time updated
    redisClient.get('blocks:time', async (err, reply) => {
        if (err) {
            console.error('Error ' + err);
        }

        const TEN_MINUTES = 10 * 60 * 1000;
        const currentTime = Date.now();
        const keyTime = ((reply == null) ? (currentTime - TEN_MINUTES) : reply);

        // if last time >= one hour, update it now
        if ((currentTime - keyTime) >= TEN_MINUTES) {
            const blocks = JSON.stringify(await getBlocks());
            const currentTime = Date.now();

            redisClient.set('blocks', blocks, (err, reply) => {
                console.log(err, reply)
                redisClient.set('blocks:time', currentTime, (err, reply) => {
                    console.log(err, reply)
                    res.end('Updated ' + blocks);
                });
            });
        } else {
            res.end('Already updated ' + req.url);
        }
    });
};
