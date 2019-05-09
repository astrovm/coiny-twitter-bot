// require and config bitcoinaverage libs
const { promisify } = require('util');
const ba = require('bitcoinaverage');
const baPublicKey = process.env.BITCOINAVERAGE_PUBLIC;
const baSecretKey = process.env.BITCOINAVERAGE_SECRET;
const baRestClient = ba.restfulClient(baPublicKey, baSecretKey);
const getTickerDataPerSymbol = promisify(baRestClient.getTickerDataPerSymbol).bind(baRestClient);

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

// request bitcoin average price
const getPrice = async () => {
    try {
        const symbol_set = 'global';
        const symbol = 'BTCUSD';
        try {
            const getPrice = await getTickerDataPerSymbol(symbol_set, symbol);
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
module.exports = (req, res) => {
    // check last time updated
    redisClient.get('price:time', async (err, reply) => {
        if (err) {
            console.error('Error ' + err);
            res.end('Error in redis get price:time');
            return;
        }

        const TEN_MINUTES = 10 * 60 * 1000;
        const currentTime = Date.now();
        const keyTime = ((reply == null) ? (currentTime - TEN_MINUTES) : reply);

        // if last time >= one hour, update it now
        if ((currentTime - keyTime) >= TEN_MINUTES) {
            try {
                const price = Number(await getPrice());
                if (price > 0) {
                    const currentTime = Date.now();
                    redisClient.set('price', price, (err, reply) => {
                        console.log(err, reply)
                        redisClient.set('price:time', currentTime, (err, reply) => {
                            console.log(err, reply)
                            res.end('Updated ' + price);
                        });
                    });
                } else {
                    throw price;
                }
            } catch (err) {
                console.error('Error ' + err);
                res.end('Error in getPrice');
                return;
            };
        } else {
            res.end('Already updated ' + req.url);
            return;
        };
    });
};
