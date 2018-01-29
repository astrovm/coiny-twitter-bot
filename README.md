# bitfees
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![Twitter Follow](https://img.shields.io/twitter/follow/bitfees.svg?style=social&label=Follow)](https://twitter.com/bitfees)

Bitcoin fees bot tweets every hour the minimum fee to get a confirmation in x time using the estimates of my Bitcoin Core node and the BitGo API.

## API
You can also request fees through the API:

> GET https://coiny.sh/api/v1/tx/fee?numBlocks={target}

Example: https://coiny.sh/api/v1/tx/fee?numBlocks=144 for 144 blocks confirmation target (24 hours)

## Deploy
[![Deploy to now](https://deploy.now.sh/static/button.svg)](https://deploy.now.sh/?repo=https://github.com/astrolince/coiny&env=TW_CONSUMER_KEY&env=TW_CONSUMER_SECRET&env=TW_ACCESS_TOKEN_KEY&env=TW_ACCESS_TOKEN_SECRET&env=BITCOIN_CORE_HOST&env=BITCOIN_CORE_PORT&env=BITCOIN_CORE_USER&env=BITCOIN_CORE_PASS&env=REDIS_URL&env=REDIS_PASS)

## License
coiny is licensed under [Mozilla Public License 2.0](https://github.com/astrolince/coiny/blob/master/LICENSE)
