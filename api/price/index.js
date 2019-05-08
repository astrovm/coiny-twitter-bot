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

// export aoi
module.exports = (req, res) => {
    redisClient.get('price', (err, reply) => {
        let respond = {};
        respond.price = reply;
        respond.error = err;
        respond.path = req.url;

        res.end(JSON.stringify(respond));
    });
};
