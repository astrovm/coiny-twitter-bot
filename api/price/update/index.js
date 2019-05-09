// require and config bitcoinaverage libs
const ba = require('bitcoinaverage');
const baPublicKey = process.env.BITCOINAVERAGE_PUBLIC;
const baSecretKey = process.env.BITCOINAVERAGE_SECRET;
const baRestClient = ba.restfulClient(baPublicKey, baSecretKey);

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

// export api
module.exports = (req, res) => {
    // check last time updated
    redisClient.get('price:time', (err, reply) => {
        if (err) {
            console.error('Error ' + err);
        }

        const TEN_MINUTES = 10 * 60 * 1000;
        const currentTime = Date.now();
        const keyTime = ((reply == null) ? (currentTime - TEN_MINUTES) : reply);

        // if last time >= one hour, update it now
        if ((currentTime - keyTime) >= TEN_MINUTES) {
            const symbol_set = 'global';
            const symbol = 'BTCUSD';

            baRestClient.getTickerDataPerSymbol(symbol_set, symbol, (reply) => {
                const price = JSON.parse(reply).last;
                const currentTime = Date.now();

                redisClient.set('price', price, (err, reply) => {
                    console.log(err, reply)
                    redisClient.set('price:time', currentTime, (err, reply) => {
                        console.log(err, reply)
                        res.end('Updated ' + price);
                    });
                });
            }, (err) => {
                console.error('Error ' + err);
                res.end('Error ' + err);
            });
        } else {
            res.end('Already updated ' + req.url);
        }
    });
};
