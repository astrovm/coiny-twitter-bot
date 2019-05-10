// require promisify
const { promisify } = require('util');

// require and config db libs
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

// export api
module.exports = async (req, res) => {
    try {
        const redisReplyBlocksGet = await redisGet('blocks');

        let respond = {};
        respond.blocks = redisReplyBlocksGet;
        respond.error = false;
        respond.path = req.url;

        res.end(JSON.stringify(respond));
    } catch (err) {
        console.error(err)

        let respond = {};
        respond.blocks = null;
        respond.error = true;
        respond.path = req.url;

        res.end(JSON.stringify(respond));
    };
};
