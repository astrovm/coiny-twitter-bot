# [Coiny](https://coiny.sh/)

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Greenkeeper badge](https://badges.greenkeeper.io/astrolince/coiny.svg)](https://greenkeeper.io/)
[![Twitter Follow](https://img.shields.io/twitter/follow/coinyfees.svg?style=social&label=Follow)](https://twitter.com/coinyfees)

Bitcoin fee estimates and market info.

[@coinyfees](https://twitter.com/coinyfees) tweets every hour the minimum fee to get a confirmation in x time using the estimates of my Bitcoin Core node and the BitGo API.

## API
You can also request fees through the API:

> GET https://coiny.sh/api/v1/tx/fee?numBlocks={target}

Example: https://coiny.sh/api/v1/tx/fee?numBlocks=288 for 288 blocks confirmation target (48 hours).

## License
Coiny source code is licensed under [Mozilla Public License 2.0](https://github.com/astrolince/coiny/blob/master/LICENSE).
Coiny website content is licensed under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).
