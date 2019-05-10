// conf libs
const Twitter = require('twitter');
const Masto = require('mastodon');
const trae = require('trae');

// require and config db
const redis = require('redis');
const redisPort = process.env.REDIS_PORT;
const redisHost = process.env.REDIS_HOST;
const redisPass = process.env.REDIS_PASS;
const redisClient = redis.createClient(redisPort, redisHost);
redisClient.auth(redisPass);

redisClient.on('error', function (err) {
    console.error('Error ' + err);
});

// conf twitter
const tw = new Twitter({
    consumer_key: process.env.TW_CONSUMER_KEY,
    consumer_secret: process.env.TW_CONSUMER_SECRET,
    access_token_key: process.env.TW_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TW_ACCESS_TOKEN_SECRET
})

// conf mastodon
const mastodon = new Masto({
    access_token: process.env.MASTODON_ACCESS_TOKEN,
    timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
    api_url: 'https://bitcoinhackers.org/api/v1/', // optional, defaults to https://mastodon.social/api/v1/
})

const checkDiff = async () => {
    const getFees = await trae.get('https://coiny.astrolince.now.sh/api/fees');
    const getTweet = await trae.get('https://coiny.astrolince.now.sh/api/tweet');
    const fresh = JSON.parse(getFees.data)
    const used = JSON.parse(getTweet.data)

    if (fresh.error !== false) return null;
    if (!used.tweet) return fresh.fees;
    if (used.tweet == "undefined") return fresh.fees;
    if (Object.keys(used.tweet).length === 0) return fresh.fees;
    if (used.error) return fresh.fees;

    for (let i in used.tweet) {
        const diff = used.tweet[i] / fresh.fees[i];
        if (diff < 0.9 || diff > 1.1) return fresh.fees;
    };
    return null;
}

// build text
const buildText = async (fees) => {
    const getPrice = await trae.get('https://coiny.astrolince.now.sh/api/price')
    const { price } = JSON.parse(getPrice.data)

    const usdtobtc = (1 / price).toFixed(8)
    const usdtosats = (usdtobtc * 10 ** 8).toFixed()
    const feetousd = 178 / usdtosats

    const getBlocks = await trae.get('https://coiny.astrolince.now.sh/api/blocks')
    const { blocks } = JSON.parse(getBlocks.data)
    const { lastBlockHeight } = JSON.parse(blocks)

    let text = `${fees[2]} sat/B ($${(fees[2] * feetousd).toFixed(2)}) - 20m`
    if (fees[4] < fees[2]) text = text + `\n${fees[4]} sat/B ($${(fees[4] * feetousd).toFixed(2)}) - 40m`
    if (fees[6] < fees[4]) text = text + `\n${fees[6]} sat/B ($${(fees[6] * feetousd).toFixed(2)}) - 60m`
    if (fees[12] < fees[6]) text = text + `\n${fees[12]} sat/B ($${(fees[12] * feetousd).toFixed(2)}) - 2h`
    if (fees[24] < fees[12]) text = text + `\n${fees[24]} sat/B ($${(fees[24] * feetousd).toFixed(2)}) - 4h`
    if (fees[48] < fees[24]) text = text + `\n${fees[48]} sat/B ($${(fees[48] * feetousd).toFixed(2)}) - 8h`
    if (fees[144] < fees[48]) text = text + `\n${fees[144]} sat/B ($${(fees[144] * feetousd).toFixed(2)}) - 24h`
    if (fees[504] < fees[144]) text = text + `\n${fees[504]} sat/B ($${(fees[504] * feetousd).toFixed(2)}) - 3d`
    if (fees[1008] < fees[504]) text = text + `\n${fees[1008]} sat/B ($${(fees[1008] * feetousd).toFixed(2)}) - 7d`
    text = text + `\n\nheight ${lastBlockHeight}`
    text = text + `\nprice $${price} (1 usd = ${usdtosats} sats)`
    return text
}

// make tweet
const makeTweet = async () => {
    const json = await checkDiff();
    if (json !== null) {
        const tweet = await buildText(json);
        try {
            const doTweet = await tw.post('statuses/update', { status: tweet })
            console.log(`Tweet created at: ${doTweet.created_at}`)

            const doMast = await mastodon.post('statuses', { status: tweet })
            console.log(`Toot created at: ${doMast.data.created_at}`);

            return json;
        } catch (err) {
            console.error(err);
        };
    } else {
        console.log('The last tweet is already updated.');
    };
    return null;
};

// export api
module.exports = async (req, res) => {
    // check last time updated
    redisClient.get('tweet:time', async (err, reply) => {
        if (err) {
            console.error('Error ' + err);
        }

        const ONE_HOUR = 60 * 60 * 1000;
        const currentTime = Date.now();
        const keyTime = ((reply == null) ? (currentTime - ONE_HOUR) : reply);

        // if last time >= one hour, update it now
        if ((currentTime - keyTime) >= ONE_HOUR) {
            const getTweet = await makeTweet();
            if (!getTweet) {
                res.end('Already tweeted ' + req.url);
                return;
            }
            const tweet = JSON.stringify(getTweet);
            const currentTime = Date.now();

            redisClient.set('tweet', tweet, (err, reply) => {
                console.log(err, reply)
                redisClient.set('tweet:time', currentTime, (err, reply) => {
                    console.log(err, reply)
                    res.end('Updated ' + tweet);
                });
            });
        } else {
            res.end('Already updated ' + req.url);
        }
    });
};
