// require libs
const trae = require('trae')
const { redisGet, redisSet } = require('../../../modules/redis')

// functions to request prices
const getPrices = async () => {
  try {
    const ripio = await trae.get('https://app.ripio.com/api/v3/rates/', {
      params: {
        country: 'AR'
      }
    })

    const ripioBTC = ripio.data.find(price => price.ticker === 'BTC_ARS')
    const ripioETH = ripio.data.find(price => price.ticker === 'ETH_ARS')
    const ripioDAI = ripio.data.find(price => price.ticker === 'DAI_ARS')

    const prices = {
      BTC_ARS: {
        ripio: {
          bid: ripioBTC.sell_rate * 0.99 * 0.995, // 1% sell fee + 0.5% bank fee
          ask: ripioBTC.buy_rate * 1.01 // 1% buy fee
        }
      },
      ETH_ARS: {
        ripio: {
          bid: ripioETH.sell_rate * 0.99 * 0.995,
          ask: ripioETH.buy_rate * 1.01
        }
      },
      DAI_ARS: {
        ripio: {
          bid: ripioDAI.sell_rate * 0.99 * 0.995,
          ask: ripioDAI.buy_rate * 1.01
        }
      }
    }

    return prices
  } catch (err) {
    console.error('Error ' + err)
    throw err
  }
}

// export api
module.exports = async (req, res) => {
  try {
    // check last time updated
    const lastUpdateTime = await redisGet('argentina:time')

    const ONE_MINUTE = 1 * 60 * 1000
    const currentTime = Date.now()

    // if argentina:time is empty, just run the prices update
    const keyTime = ((lastUpdateTime == null) ? (currentTime - ONE_MINUTE) : lastUpdateTime)

    // calc diff
    const timeDiff = currentTime - keyTime

    // if last time >= 1 minute, update it now
    if (timeDiff >= ONE_MINUTE) {
      // save time of the update
      const redisReplyArgentinaTimeSet = await redisSet('argentina:time', currentTime)
      console.log(redisReplyArgentinaTimeSet)

      // get last prices
      const prices = JSON.stringify(await getPrices())

      // save prices
      const redisReplyArgentinaSet = await redisSet('argentina', prices)
      console.log(redisReplyArgentinaSet)

      res.end('Updated ' + prices)
    } else {
      const timeRemaining = new Date(ONE_MINUTE - timeDiff)
      res.end(`Wait ${timeRemaining.getUTCMinutes()} minutes and ${timeRemaining.getUTCSeconds()} seconds`)
      return
    }
  } catch (err) {
    console.error('Error ' + err)
    res.end('Error.')
  }
}
