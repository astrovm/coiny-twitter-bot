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

// request smartbit api
const getBlockchain = async () => {
    try {
        const resTotals = await trae.get('https://api.smartbit.com.au/v1/blockchain/totals');
        const resBlockchainSize = await trae.get('https://api.smartbit.com.au/v1/blockchain/chart/block-size-total?from=2019-5-01');
        blockchain.lastBlockHeight = resTotals.data.totals.block_count - 1;
        blockchain.size = (Number(resBlockchainSize.data.chart.data.slice(-1)[0].y) / 1000000000).toFixed(2);
    } catch (err) {
        console.error(err);
        return err;
    };
};

// export api
module.exports = (req, res) => {
    // check last time updated
    redisClient.get('blockchain:time', async (err, reply) => {
        if (err) {
            console.error('Error ' + err);
        }

        const ONE_HOUR = 60 * 60 * 1000;
        const currentTime = Date.now();
        const keyTime = ((reply == null) ? (currentTime - ONE_HOUR) : reply);

        // if last time >= one hour, update it now
        if ((currentTime - keyTime) >= ONE_HOUR) {
            const blockchain = await getBlockchain();
            const currentTime = Date.now();

            redisClient.set('blockchain', blockchain, (err, reply) => {
                console.log(err, reply)
                redisClient.set('blockchain:time', currentTime, (err, reply) => {
                    console.log(err, reply)
                    res.end('Updated ' + blockchain);
                });
            });
        } else {
            res.end('Already updated ' + req.url);
        }
    });
};
