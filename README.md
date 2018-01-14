# bitfees
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![Twitter Follow](https://img.shields.io/twitter/follow/bitfees.svg?style=social&label=Follow)](https://twitter.com/bitfees)

Bitcoin fees bot tweets every hour the minimum fee to get a confirmation in x time using the estimates of my Bitcoin Core node and the BitGo API.

## API
You can also request fees through the API:

> GET https://bitfees.now.sh/api/v1/tx/fee?numBlocks={target}

Example: https://bitfees.now.sh/api/v1/tx/fee?numBlocks=144 for 144 blocks confirmation target (24 hours)

## Deploy
[![Deploy to now](https://deploy.now.sh/static/button.svg)](https://deploy.now.sh/?repo=https://github.com/astrolince/bitfees&env=BITFEES_TW_CONSUMER_KEY&env=BITFEES_TW_CONSUMER_SECRET&env=BITFEES_TW_ACCESS_TOKEN_KEY&env=BITFEES_TW_ACCESS_TOKEN_SECRET&env=BITCOIN_CORE_HOST&env=BITCOIN_CORE_PORT&env=BITCOIN_CORE_USER&env=BITCOIN_CORE_PASS)

> $ now -e BITFEES_TW_CONSUMER_KEY=@bitfees_tw_consumer_key -e BITFEES_TW_CONSUMER_SECRET=@bitfees_tw_consumer_secret -e BITFEES_TW_ACCESS_TOKEN_KEY=@bitfees_tw_access_token_key -e BITFEES_TW_ACCESS_TOKEN_SECRET=@bitfees_tw_access_token_secret -e BITCOIN_CORE_HOST=@bitcoin_core_host -e BITCOIN_CORE_PORT=@bitcoin_core_port -e BITCOIN_CORE_USER=@bitcoin_core_user -e BITCOIN_CORE_PASS=@bitcoin_core_pass

## License
bitfees is licensed under [Mozilla Public License 2.0](https://github.com/astrolince/bitfees/blob/master/LICENSE)
