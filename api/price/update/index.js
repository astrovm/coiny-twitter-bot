// require and config bitcoinaverage libs
const { promisify } = require('util');
const ba = require('bitcoinaverage');
const baPublicKey = process.env.BITCOINAVERAGE_PUBLIC;
const baSecretKey = process.env.BITCOINAVERAGE_SECRET;
const baRestClient = ba.restfulClient(baPublicKey, baSecretKey);
const baGetTickerDataPerSymbol = promisify(baRestClient.getTickerDataPerSymbol).bind(baRestClient);

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
const redisSet = promisify(redisClient.set).bind(redisClient);

// request bitcoin average price
const getPrice = async () => {
    try {
        const symbol_set = 'global';
        const symbol = 'BTCUSD';
        try {
            const getPrice = await baGetTickerDataPerSymbol(symbol_set, symbol);
            return getPrice;
        } catch (result) {
            price = JSON.parse(result).last;
            return price;
        }
    } catch (err) {
        console.error('Error ' + err);
        throw err;
    };
};

// export api
module.exports = async (req, res) => {
    // check last time updated
    try {
        const redisReplyPriceTimeGet = await redisGet('price:time');

        const TEN_MINUTES = 10 * 60 * 1000;
        const currentTime = Date.now();
        const keyTime = ((redisReplyPriceTimeGet == null) ? (currentTime - TEN_MINUTES) : redisReplyPriceTimeGet);

        // if last time >= one hour, update it now
        if ((currentTime - keyTime) >= TEN_MINUTES) {
            const price = Number(await getPrice());
            if (price > 0) {
                const currentTime = Date.now();

                const redisReplyPriceSet = await redisSet('price', price);
                console.log(redisReplyPriceSet);

                const redisReplyPriceTimeSet = await redisSet('price:time', currentTime);
                console.log(redisReplyPriceTimeSet);

                res.end('Updated ' + price);
            } else {
                throw price;
            };
        } else {
            res.end('Already updated ' + req.url);
            return;
        };
    } catch (err) {
        console.error('Error ' + err);
        res.end('Error.');
        return;
    };
};
