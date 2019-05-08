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

// export api
module.exports = (req, res) => {
    redisClient.get('tweet', (err, reply) => {
        let respond = {};
        respond.tweet = reply;
        respond.error = err;
        respond.path = req.url;

        res.end(JSON.stringify(respond));
    });
};
