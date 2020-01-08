# Coiny

Bitcoin fee estimates and market info.

[@coinyfees@twitter.com](https://twitter.com/coinyfees) and [@coiny@bitcoinhackers.org](https://bitcoinhackers.org/@coiny) tweets/toots every hour the recommended fee to get a confirmation in x time using the estimates of BitGo and Blockstream.

## Specifications

It's written in Javascript using Now.sh serverless Node.js builder and the Redis database.

So you need to install Node and Redis and then install Now with npm:

`$ npm i -g now`

Install the dependencies, set up env vars, and run:

`$ npm i`

`$ touch .env`

`$ now dev`

## License

Coiny is licensed under the [MIT License](https://github.com/astrolince/coiny/blob/master/LICENSE).
