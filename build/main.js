require('source-map-support/register')
module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 16);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(15);


/***/ },
/* 1 */
/***/ function(module, exports) {

module.exports = require("node-schedule");

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator__);


// require libs



var _this = this;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var trae = __webpack_require__(3);
var schedule = __webpack_require__(1);

// request bitstamp api price
var getPrice = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.mark(function _callee() {
    var res;
    return __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return trae.get('https://www.bitstamp.net/api/ticker/');

          case 3:
            res = _context.sent;

            price = res.data.last;
            return _context.abrupt('return', price);

          case 8:
            _context.prev = 8;
            _context.t0 = _context['catch'](0);

            console.error(_context.t0);

            if (!price) {
              _context.next = 13;
              break;
            }

            return _context.abrupt('return', price);

          case 13:
            return _context.abrupt('return', _context.t0);

          case 14:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, _this, [[0, 8]]);
  }));

  return function getPrice() {
    return _ref.apply(this, arguments);
  };
}();

// init price data
var price = 0;
getPrice();

// get bitstamp price every minute job
schedule.scheduleJob('*/3 * * * *', function () {
  getPrice();
});

// export price function
module.exports = function () {
  return price;
};

/***/ },
/* 3 */
/***/ function(module, exports) {

module.exports = require("trae");

/***/ },
/* 4 */
/***/ function(module, exports) {

module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'Coiny',
    meta: [{ charset: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }, { hid: 'description', name: 'description', content: 'Bitcoin fee estimates and market info.' }, { name: 'twitter:card', content: 'summary' }, { name: 'twitter:site', content: '@coinyfees' }, { name: 'twitter:creator', content: '@astrolince' }, { property: 'og:url', content: 'https://coiny.sh/' }, { property: 'og:title', content: 'Coiny' }, { property: 'og:description', content: 'Bitcoin fee estimates and market info.' }, { property: 'og:image', content: 'https://coiny.sh/apple-touch-icon.png' }, { name: 'apple-mobile-web-app-title', content: 'Coiny' }, { name: 'application-name', content: 'Coiny' }, { name: 'msapplication-TileColor', content: '#2d3436' }, { name: 'theme-color', content: '#2d3436' }],
    link: [{ rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }, { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }, { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }, { rel: 'manifest', href: '/site.webmanifest' }, { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#16a085' }]
  },
  /*
  ** Global CSS
  */
  css: [
  // SCSS file in the project
  '@/assets/css/main.scss'],
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#16a085' },
  /*
   ** Build configuration
   */
  build: {
    postcss: {
      plugins: {
        'postcss-custom-properties': false
      }
    },
    /*
     ** Run ESLINT on save
     */
    extend: function extend(config, ctx) {
      if (ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        });
      }
    }
  }
};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator__);


// conf libs



var _this = this;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var bitcoinCore = __webpack_require__(11);
var bitGo = __webpack_require__(12);
var price = __webpack_require__(2);
var redis = __webpack_require__(14);
var redisClient = redis.createClient(process.env.REDISCLOUD_URL).on('error', function (err) {
  return console.error('ERR:REDIS:', err);
});

// sort fees object
var sortFees = function sortFees(req) {
  var feesSorted = Object.keys(req).sort(function (a, b) {
    return req[b] - req[a];
  }); // sort fee numbers
  var blocksSorted = Object.keys(req).sort(function (a, b) {
    return a - b;
  }); // sort block target numbers
  // recreate fees object by matching sorted blocks with sorted fees
  var res = {};
  for (var i in feesSorted) {
    res[blocksSorted[i]] = req[feesSorted[i]];
  }
  return res;
};

// get min fee for x block target
var minFeeFor = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.mark(function _callee(blocks) {
    var getBitGo, getCore, sumValues, mean, tempFees, i, bitGoFee, coreFee, max, min, lvl, soft, err, coinyFees;
    return __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return bitGo.feeFor(blocks);

          case 2:
            getBitGo = _context.sent;
            _context.next = 5;
            return bitcoinCore.feeFor(blocks);

          case 5:
            getCore = _context.sent;

            sumValues = function sumValues(obj) {
              return Object.values(obj).reduce(function (a, b) {
                return a + b;
              });
            };

            mean = (sumValues(getBitGo) + sumValues(getCore)) / 18;
            tempFees = {};
            _context.t0 = __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.keys(blocks);

          case 10:
            if ((_context.t1 = _context.t0()).done) {
              _context.next = 37;
              break;
            }

            i = _context.t1.value;
            bitGoFee = getBitGo[blocks[i]];
            coreFee = getCore[blocks[i]];

            if (!(bitGoFee && coreFee)) {
              _context.next = 22;
              break;
            }

            max = Math.max(bitGoFee, coreFee);
            min = Math.min(bitGoFee, coreFee);
            // const mean = (bitGoFee + coreFee) / 2

            lvl = min / max * mean; // larger number = lower fees

            soft = (max + min * lvl) / (1 + lvl);

            tempFees[[blocks[i]]] = Math.ceil(soft);
            _context.next = 35;
            break;

          case 22:
            if (!bitGoFee) {
              _context.next = 27;
              break;
            }

            console.error(new Error('Undefined Bitcoin Core fee.'));
            tempFees[[blocks[i]]] = bitGoFee;
            _context.next = 35;
            break;

          case 27:
            if (!coreFee) {
              _context.next = 32;
              break;
            }

            console.error(new Error('Undefined BitGo fee.'));
            tempFees[[blocks[i]]] = coreFee;
            _context.next = 35;
            break;

          case 32:
            err = 'UNDEFINED FEES';

            console.error(new Error(err));
            return _context.abrupt('return', { 'error': err });

          case 35:
            _context.next = 10;
            break;

          case 37:
            _context.next = 39;
            return sortFees(tempFees);

          case 39:
            coinyFees = _context.sent;
            return _context.abrupt('return', { coiny: coinyFees, _bitGo: getBitGo, _bitcoinCore: getCore });

          case 41:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, _this);
  }));

  return function minFeeFor(_x) {
    return _ref.apply(this, arguments);
  };
}();

// build json
var buildJSON = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.mark(function _callee2(req) {
    var defaults, blocks, res;
    return __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            defaults = [2, 4, 6, 12, 24, 48, 144, 504, 1008];
            blocks = req ? defaults.concat(req.filter(function (i) {
              return defaults.indexOf(i) < 0;
            })) : defaults;
            _context2.next = 4;
            return minFeeFor(blocks);

          case 4:
            res = _context2.sent;
            return _context2.abrupt('return', res);

          case 6:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, _this);
  }));

  return function buildJSON(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

// compare new fees with last tweet fees
var lastTweetJson = {};
redisClient.get('lastTweetJson', function (err, reply) {
  err ? console.error('ERR:REDIS:', err) : lastTweetJson = JSON.parse(reply);
});

var checkDiff = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.mark(function _callee3() {
    var used = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : lastTweetJson;
    var getFees, fresh, i, diff;
    return __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return buildJSON();

          case 2:
            getFees = _context3.sent;

            if (!getFees.error) {
              _context3.next = 5;
              break;
            }

            return _context3.abrupt('return', null);

          case 5:
            fresh = getFees.coiny;

            if (used) {
              _context3.next = 8;
              break;
            }

            return _context3.abrupt('return', fresh);

          case 8:
            if (!(Object.keys(used).length === 0)) {
              _context3.next = 10;
              break;
            }

            return _context3.abrupt('return', fresh);

          case 10:
            if (!used.error) {
              _context3.next = 12;
              break;
            }

            return _context3.abrupt('return', fresh);

          case 12:
            _context3.t0 = __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.keys(used);

          case 13:
            if ((_context3.t1 = _context3.t0()).done) {
              _context3.next = 20;
              break;
            }

            i = _context3.t1.value;
            diff = used[i] / fresh[i];

            if (!(diff < 0.9 || diff > 1.1)) {
              _context3.next = 18;
              break;
            }

            return _context3.abrupt('return', fresh);

          case 18:
            _context3.next = 13;
            break;

          case 20:
            return _context3.abrupt('return', null);

          case 21:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, _this);
  }));

  return function checkDiff() {
    return _ref3.apply(this, arguments);
  };
}();

// build text
var buildText = function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.mark(function _callee4(fees) {
    var usd, text;
    return __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            usd = price() * 225 / Math.pow(10, 8);
            text = '20 min ' + fees[2] + ' sat/B ($' + (fees[2] * usd).toFixed(2) + ')';

            if (fees[4] < fees[2]) text = text + ('\n40 min ' + fees[4] + ' sat/B ($' + (fees[4] * usd).toFixed(2) + ')');
            if (fees[6] < fees[4]) text = text + ('\n60 min ' + fees[6] + ' sat/B ($' + (fees[6] * usd).toFixed(2) + ')');
            if (fees[12] < fees[6]) text = text + ('\n2 hours ' + fees[12] + ' sat/B ($' + (fees[12] * usd).toFixed(2) + ')');
            if (fees[24] < fees[12]) text = text + ('\n4 hours ' + fees[24] + ' sat/B ($' + (fees[24] * usd).toFixed(2) + ')');
            if (fees[48] < fees[24]) text = text + ('\n8 hours ' + fees[48] + ' sat/B ($' + (fees[48] * usd).toFixed(2) + ')');
            if (fees[144] < fees[48]) text = text + ('\n24 hours ' + fees[144] + ' sat/B ($' + (fees[144] * usd).toFixed(2) + ')');
            if (fees[504] < fees[144]) text = text + ('\n3 days ' + fees[504] + ' sat/B ($' + (fees[504] * usd).toFixed(2) + ')');
            if (fees[1008] < fees[504]) text = text + ('\n7 days ' + fees[1008] + ' sat/B ($' + (fees[1008] * usd).toFixed(2) + ')');
            return _context4.abrupt('return', text);

          case 11:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, _this);
  }));

  return function buildText(_x4) {
    return _ref4.apply(this, arguments);
  };
}();

// make tweet
var makeTweet = function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.mark(function _callee5(tw) {
    var json, tweet;
    return __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return checkDiff();

          case 2:
            json = _context5.sent;

            if (!(json !== null)) {
              _context5.next = 10;
              break;
            }

            _context5.next = 6;
            return buildText(json);

          case 6:
            tweet = _context5.sent;

            tw.post('statuses/update', { status: tweet }, function (err, tweet, res) {
              if (err) {
                console.error(err);
              } else {
                lastTweetJson = json;
                redisClient.set('lastTweetJson', JSON.stringify(json), redis.print);
                console.log('Tweet created at: ' + tweet.created_at);
              }
            });
            _context5.next = 11;
            break;

          case 10:
            console.log('The last tweet is already updated.');

          case 11:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, _this);
  }));

  return function makeTweet(_x5) {
    return _ref5.apply(this, arguments);
  };
}();

// export functions
exports.makeTweet = makeTweet;
exports.buildJSON = buildJSON;

/***/ },
/* 6 */
/***/ function(module, exports) {

module.exports = require("koa");

/***/ },
/* 7 */
/***/ function(module, exports) {

module.exports = require("koa-cors");

/***/ },
/* 8 */
/***/ function(module, exports) {

module.exports = require("koa-router");

/***/ },
/* 9 */
/***/ function(module, exports) {

module.exports = require("nuxt");

/***/ },
/* 10 */
/***/ function(module, exports) {

module.exports = require("twitter");

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator__);
Object.defineProperty(exports, "__esModule", { value: true });


// require libs



var _this = this;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var Bitcoin = __webpack_require__(13);
var schedule = __webpack_require__(1);

// conf bitcoin rpc
var rpc = new Bitcoin({
  network: 'mainnet',
  host: process.env.BITCOIN_CORE_HOST,
  port: process.env.BITCOIN_CORE_PORT,
  username: process.env.BITCOIN_CORE_USER,
  password: process.env.BITCOIN_CORE_PASS
});

// get info from bitcoin node
var getNodeInfo = function getNodeInfo() {
  var batch = [{ method: 'getblockchaininfo', parameters: [] }, { method: 'getnetworkinfo', parameters: [] }];
  rpc.command(batch).then(function (res) {
    console.log('Bitcoin ' + res[1].subversion);
    console.log('Blocks: ' + res[0].blocks + ' (' + (res[0].verificationprogress * 100).toFixed(2) + '%)');
    console.log('Connections: ' + res[1].connections);
  }).catch(function (err) {
    console.error(err);
  });
};

// request fees
var getFees = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.mark(function _callee() {
    var batch, res, feesObj, newFees;
    return __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            batch = [{ method: 'estimatesmartfee', parameters: [1] }, { method: 'estimatesmartfee', parameters: [2] }, { method: 'estimatesmartfee', parameters: [3] }, { method: 'estimatesmartfee', parameters: [4] }, { method: 'estimatesmartfee', parameters: [5] }, { method: 'estimatesmartfee', parameters: [6] }, { method: 'estimatesmartfee', parameters: [8] }, { method: 'estimatesmartfee', parameters: [12] }, { method: 'estimatesmartfee', parameters: [13] }, { method: 'estimatesmartfee', parameters: [21] }, { method: 'estimatesmartfee', parameters: [24] }, { method: 'estimatesmartfee', parameters: [34] }, { method: 'estimatesmartfee', parameters: [48] }, { method: 'estimatesmartfee', parameters: [55] }, { method: 'estimatesmartfee', parameters: [72] }, { method: 'estimatesmartfee', parameters: [89] }, { method: 'estimatesmartfee', parameters: [108] }, { method: 'estimatesmartfee', parameters: [144] }, { method: 'estimatesmartfee', parameters: [216] }, { method: 'estimatesmartfee', parameters: [233] }, { method: 'estimatesmartfee', parameters: [288] }, { method: 'estimatesmartfee', parameters: [360] }, { method: 'estimatesmartfee', parameters: [377] }, { method: 'estimatesmartfee', parameters: [432] }, { method: 'estimatesmartfee', parameters: [504] }, { method: 'estimatesmartfee', parameters: [610] }, { method: 'estimatesmartfee', parameters: [576] }, { method: 'estimatesmartfee', parameters: [648] }, { method: 'estimatesmartfee', parameters: [720] }, { method: 'estimatesmartfee', parameters: [792] }, { method: 'estimatesmartfee', parameters: [864] }, { method: 'estimatesmartfee', parameters: [936] }, { method: 'estimatesmartfee', parameters: [987] }, { method: 'estimatesmartfee', parameters: [1008] }];
            _context.next = 4;
            return rpc.command(batch);

          case 4:
            res = _context.sent;
            _context.next = 7;
            return buildFeesObj(res);

          case 7:
            feesObj = _context.sent;
            _context.next = 10;
            return sortFees(feesObj);

          case 10:
            newFees = _context.sent;

            fees = newFees;
            return _context.abrupt('return', newFees);

          case 15:
            _context.prev = 15;
            _context.t0 = _context['catch'](0);

            console.error(_context.t0);

            if (!fees) {
              _context.next = 20;
              break;
            }

            return _context.abrupt('return', fees);

          case 20:
            return _context.abrupt('return', _context.t0);

          case 21:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, _this, [[0, 15]]);
  }));

  return function getFees() {
    return _ref.apply(this, arguments);
  };
}();

// build fees obj
var buildFeesObj = function buildFeesObj(req) {
  var res = {};
  for (var i in req) {
    res[req[i].blocks] = req[i].feerate * Math.pow(10, 8);
  }
  return res;
};

// sort fees object
var sortFees = function sortFees(req) {
  var feesSorted = Object.keys(req).sort(function (a, b) {
    return req[b] - req[a];
  }); // sort fee numbers
  var blocksSorted = Object.keys(req).sort(function (a, b) {
    return a - b;
  }); // sort block target numbers
  // recreate fees object by matching sorted blocks with sorted fees
  var res = {};
  for (var i in feesSorted) {
    res[blocksSorted[i]] = Math.ceil(req[feesSorted[i]] / 1000);
  }
  return res;
};

// select fee for specific block target
var feeFor = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.mark(function _callee2(blocks) {
    var feeData, feeDataSorted, minBlock, res, b, target, i;
    return __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!(Object.keys(fees).length === 0)) {
              _context2.next = 6;
              break;
            }

            _context2.next = 3;
            return getFees();

          case 3:
            _context2.t0 = _context2.sent;
            _context2.next = 7;
            break;

          case 6:
            _context2.t0 = fees;

          case 7:
            feeData = _context2.t0;

            if (!(Object.keys(feeData).length === 0)) {
              _context2.next = 10;
              break;
            }

            return _context2.abrupt('return', { 0: 0 });

          case 10:
            feeDataSorted = Object.keys(feeData).sort(function (a, b) {
              return b - a;
            }); // sort block targets from highest to lowest

            minBlock = parseInt(feeDataSorted.slice(-1)[0]);
            res = {};
            _context2.t1 = __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.keys(blocks);

          case 14:
            if ((_context2.t2 = _context2.t1()).done) {
              _context2.next = 27;
              break;
            }

            b = _context2.t2.value;
            target = blocks[b] < minBlock ? minBlock : blocks[b];
            _context2.t3 = __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.keys(feeDataSorted);

          case 18:
            if ((_context2.t4 = _context2.t3()).done) {
              _context2.next = 25;
              break;
            }

            i = _context2.t4.value;

            if (!(target >= feeDataSorted[i])) {
              _context2.next = 23;
              break;
            }

            res[blocks[b]] = feeData[feeDataSorted[i]];
            return _context2.abrupt('break', 25);

          case 23:
            _context2.next = 18;
            break;

          case 25:
            _context2.next = 14;
            break;

          case 27:
            return _context2.abrupt('return', res);

          case 28:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, _this);
  }));

  return function feeFor(_x) {
    return _ref2.apply(this, arguments);
  };
}();

// init fees data, get node info
var fees = {};
getFees();
getNodeInfo();

// get core fees every 3 minutes
schedule.scheduleJob('*/3 * * * *', function () {
  getFees();
});

// get node info every 30 minutes
schedule.scheduleJob('*/30 * * * *', function () {
  getNodeInfo();
});

// export feeFor function
exports.feeFor = feeFor;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator__);
Object.defineProperty(exports, "__esModule", { value: true });


// require libs



var _this = this;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var trae = __webpack_require__(3);
var schedule = __webpack_require__(1);

// request bitgo api fees
var getFees = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.mark(function _callee() {
    var res, newFees;
    return __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return trae.get('https://www.bitgo.com/api/v1/tx/fee');

          case 3:
            res = _context.sent;
            _context.next = 6;
            return sortFees(res.data.feeByBlockTarget);

          case 6:
            newFees = _context.sent;

            fees = newFees;
            return _context.abrupt('return', newFees);

          case 11:
            _context.prev = 11;
            _context.t0 = _context['catch'](0);

            console.error(_context.t0);

            if (!fees) {
              _context.next = 16;
              break;
            }

            return _context.abrupt('return', fees);

          case 16:
            return _context.abrupt('return', _context.t0);

          case 17:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, _this, [[0, 11]]);
  }));

  return function getFees() {
    return _ref.apply(this, arguments);
  };
}();

// sort fees object
var sortFees = function sortFees(req) {
  var feesSorted = Object.keys(req).sort(function (a, b) {
    return req[b] - req[a];
  }); // sort fee numbers
  var blocksSorted = Object.keys(req).sort(function (a, b) {
    return a - b;
  }); // sort block target numbers
  // recreate fees object by matching sorted blocks with sorted fees
  var res = {};
  for (var i in feesSorted) {
    res[blocksSorted[i]] = Math.ceil(req[feesSorted[i]] / 1000);
  }
  return res;
};

// select fee for specific block target
var feeFor = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.mark(function _callee2(blocks) {
    var feeData, feeDataSorted, minBlock, res, b, target, i;
    return __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!(Object.keys(fees).length === 0)) {
              _context2.next = 6;
              break;
            }

            _context2.next = 3;
            return getFees();

          case 3:
            _context2.t0 = _context2.sent;
            _context2.next = 7;
            break;

          case 6:
            _context2.t0 = fees;

          case 7:
            feeData = _context2.t0;

            if (!(Object.keys(feeData).length === 0)) {
              _context2.next = 10;
              break;
            }

            return _context2.abrupt('return', { 0: 0 });

          case 10:
            feeDataSorted = Object.keys(feeData).sort(function (a, b) {
              return b - a;
            }); // sort block targets from highest to lowest

            minBlock = parseInt(feeDataSorted.slice(-1)[0]);
            res = {};
            _context2.t1 = __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.keys(blocks);

          case 14:
            if ((_context2.t2 = _context2.t1()).done) {
              _context2.next = 27;
              break;
            }

            b = _context2.t2.value;
            target = blocks[b] < minBlock ? minBlock : blocks[b];
            _context2.t3 = __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.keys(feeDataSorted);

          case 18:
            if ((_context2.t4 = _context2.t3()).done) {
              _context2.next = 25;
              break;
            }

            i = _context2.t4.value;

            if (!(target >= feeDataSorted[i])) {
              _context2.next = 23;
              break;
            }

            res[blocks[b]] = feeData[feeDataSorted[i]];
            return _context2.abrupt('break', 25);

          case 23:
            _context2.next = 18;
            break;

          case 25:
            _context2.next = 14;
            break;

          case 27:
            return _context2.abrupt('return', res);

          case 28:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, _this);
  }));

  return function feeFor(_x) {
    return _ref2.apply(this, arguments);
  };
}();

// init fees data
var fees = {};
getFees();

// get bitgo fees every 3 minutes job
schedule.scheduleJob('*/3 * * * *', function () {
  getFees();
});

// export feeFor function
exports.feeFor = feeFor;

/***/ },
/* 13 */
/***/ function(module, exports) {

module.exports = require("bitcoin-core");

/***/ },
/* 14 */
/***/ function(module, exports) {

module.exports = require("redis");

/***/ },
/* 15 */
/***/ function(module, exports) {

module.exports = require("regenerator-runtime");

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_koa__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_koa___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_koa__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_nuxt__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_nuxt___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_nuxt__);


var start = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.mark(function _callee4() {
    var _this = this;

    var app, host, port, config, nuxt, builder, cors, Router, fees, _price, Twitter, schedule, router, tw, api;

    return __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            app = new __WEBPACK_IMPORTED_MODULE_1_koa___default.a();
            host = process.env.HOST || '127.0.0.1';
            port = process.env.PORT || 3000;

            // Import and Set Nuxt.js options

            config = __webpack_require__(4);

            config.dev = !(app.env === 'production');

            // Instantiate nuxt.js
            nuxt = new __WEBPACK_IMPORTED_MODULE_2_nuxt__["Nuxt"](config);

            // Build in development

            if (!config.dev) {
              _context4.next = 10;
              break;
            }

            builder = new __WEBPACK_IMPORTED_MODULE_2_nuxt__["Builder"](nuxt);
            _context4.next = 10;
            return builder.build();

          case 10:

            //WIP
            // require libs
            cors = __webpack_require__(7);
            Router = __webpack_require__(8);
            fees = __webpack_require__(5);
            _price = __webpack_require__(2);
            Twitter = __webpack_require__(10);
            schedule = __webpack_require__(1);
            router = new Router();

            // conf twitter

            tw = new Twitter({
              consumer_key: process.env.TW_CONSUMER_KEY,
              consumer_secret: process.env.TW_CONSUMER_SECRET,
              access_token_key: process.env.TW_ACCESS_TOKEN_KEY,
              access_token_secret: process.env.TW_ACCESS_TOKEN_SECRET
            });

            // hourly tweet

            schedule.scheduleJob('0 * * * *', function () {
              fees.makeTweet(tw);
            });

            // show fees in web sv, handle api requests
            api = {
              fee: function () {
                var _ref2 = _asyncToGenerator( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.mark(function _callee(ctx) {
                  var block, _fee, _fee2;

                  return __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          block = parseInt(ctx.request.query.numBlocks);

                          ctx.type = 'application/json';

                          if (!(block > 0 && block < Math.pow(10, 4))) {
                            _context.next = 11;
                            break;
                          }

                          _context.t0 = JSON;
                          _context.next = 6;
                          return fees.buildJSON([block]);

                        case 6:
                          _context.t1 = _context.sent;
                          _fee = _context.t0.stringify.call(_context.t0, _context.t1);

                          ctx.body = _fee;
                          _context.next = 17;
                          break;

                        case 11:
                          _context.t2 = JSON;
                          _context.next = 14;
                          return fees.buildJSON();

                        case 14:
                          _context.t3 = _context.sent;
                          _fee2 = _context.t2.stringify.call(_context.t2, _context.t3);

                          ctx.body = _fee2;

                        case 17:
                        case 'end':
                          return _context.stop();
                      }
                    }
                  }, _callee, _this);
                }));

                function fee(_x) {
                  return _ref2.apply(this, arguments);
                }

                return fee;
              }(),
              price: function () {
                var _ref3 = _asyncToGenerator( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.mark(function _callee2(ctx) {
                  return __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          ctx.type = 'application/json';
                          ctx.body = { last: _price() };

                        case 2:
                        case 'end':
                          return _context2.stop();
                      }
                    }
                  }, _callee2, _this);
                }));

                function price(_x2) {
                  return _ref3.apply(this, arguments);
                }

                return price;
              }()
            };


            router.get('/api/v1/tx/fee', api.fee);
            router.get('/api/v1/price/btcusd', api.price);

            app.use(cors());
            app.use(router.routes());
            //WIP

            app.use(function () {
              var _ref4 = _asyncToGenerator( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.mark(function _callee3(ctx, next) {
                return __WEBPACK_IMPORTED_MODULE_0__Users_astrolince_dev_coiny_node_modules_babel_runtime_regenerator___default.a.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        _context3.next = 2;
                        return next();

                      case 2:
                        ctx.status = 200; // koa defaults to 404 when it sees that status is unset
                        return _context3.abrupt('return', new Promise(function (resolve, reject) {
                          ctx.res.on('close', resolve);
                          ctx.res.on('finish', resolve);
                          nuxt.render(ctx.req, ctx.res, function (promise) {
                            // nuxt.render passes a rejected promise into callback on error.
                            promise.then(resolve).catch(reject);
                          });
                        }));

                      case 4:
                      case 'end':
                        return _context3.stop();
                    }
                  }
                }, _callee3, _this);
              }));

              return function (_x3, _x4) {
                return _ref4.apply(this, arguments);
              };
            }());

            app.listen(port, host);
            console.log('Server listening on ' + host + ':' + port); // eslint-disable-line no-console

          case 27:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function start() {
    return _ref.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }




start();

/***/ }
/******/ ]);
//# sourceMappingURL=main.map