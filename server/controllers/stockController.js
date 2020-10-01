const fetch = require('node-fetch');
const db = require("../models/models.js");

const stockController = {};

// Requesting Portfolio flow when user clicks assigned portfolio
  // 1. Client sending portfolio ID, username
  // 1.5 verify if the user is the same user using cookies
  // 2. Get portfolio ID from the client as parameter (req.params)
  // 3. Grab matching portfolio and assigned shares using join sql query (Assuming sold shares table and tag will be included here as well)
  // 3.5 Save it to database
  // 4. save those data to redis server
  // 5. send data back to the client as JSON

stockController.getSoldShares = (req, res, next) => {

  const username = req.cookies.user;

  let getSoldSharesQuery = `SELECT ss.portfolio_id, p.name, s.ticker_name, s.date_purchased, ss.shares_id, ss._id, ss.sell_price, ss.date_sold, ss.number_shares
                            FROM users AS u
                            FULL OUTER JOIN portfolio AS p ON u._id = p.user_id
                            FULL OUTER JOIN shares AS s ON p._id = s.portfolio_id
                            FULL OUTER JOIN soldshares AS ss ON ss.shares_id = s._id AND ss.portfolio_id = p._id
                            WHERE u.username = $1 AND ss._id > 0;`;

  let getSoldSharesQueryValue = [username];

  db.query(getSoldSharesQuery, getSoldSharesQueryValue)
  .then(data => {
    res.locals.soldShares = data.rows;
    return next();
  })
  .catch(err => {
    return next({
      log: `Error occurred with stockController.getSoldShares middleware: ${err}`,
      message: { err: "An error occurred when querying database for sold shares." }
    })
  })

}

stockController.getCurrentShares = (req, res, next) => {

  const username = req.cookies.user;

  const getCurrentSharesQuery = `SELECT p._id AS portfolio_id, p.name, s._id, s.ticker_name, s.date_purchased, s.price, s.number_shares
                                FROM users AS u
                                FULL OUTER JOIN portfolio AS p ON u._id = p.user_id
                                FULL OUTER JOIN shares AS s ON p._id = s.portfolio_id
                                WHERE u.username = $1;`;

  let getCurrentSharesQueryValue = [username];

  db.query(getCurrentSharesQuery, getCurrentSharesQueryValue)
  .then(data => {
    res.locals.currentShares = data.rows;
    return next();
  })
  .catch(err => {
    return next({
      log: `Error occurred with stockController.getCurrentShares middleware: ${err}`,
      message: { err: "An error occurred when querying database for current shares." }
    })
  })

}

stockController.getIEXData = (req, res, next) => {

  const currPortfolio = res.locals.currentShares;
  const soldPortfolio = res.locals.soldShares;

  const currentHoldings = {};

  for (const stockObj of currPortfolio) {
    const portfolioID = stockObj.portfolio_id;
    if (!currentHoldings[portfolioID]) {
      currentHoldings[portfolioID] = {};
      currentHoldings[portfolioID][stockObj.ticker_name] = stockObj.number_shares;
    } else {
      if (currentHoldings[portfolioID][stockObj.ticker_name]) {
        currentHoldings[portfolioID][stockObj.ticker_name] += stockObj.number_shares;
      } else {
        currentHoldings[portfolioID][stockObj.ticker_name] = stockObj.number_shares;
      }
    }
  }

  console.log(currentHoldings);

  for (const key in currentHoldings) {
    const portfolioID = Number(key);

    for (const soldObj of soldPortfolio) {
      if (soldObj.portfolio_id === portfolioID) {
        for (let [ticker, shares] of Object.entries(currentHoldings[key])) {
          if (ticker === soldObj.ticker_name) {
            if ((shares - soldObj.number_shares) < 0) {
              currentHoldings[key][ticker] = 0;
             } else {
              currentHoldings[key][ticker] -= soldObj.number_shares;
            }
          }
        }
      }
    }
  }

  console.log(currentHoldings);

  const stockArr = [];

  for(let key in currentHoldings) {
    for(let ticker in currentHoldings[key]) {
      if(!stockArr.includes(ticker) && currentHoldings[key][ticker] > 0) {
        stockArr.push(ticker);
      }
    }
  }

  const stockStr = stockArr.join(',');

  if (stockStr !== '') {

    const APIKey = 'pk_e3201d281b63472aa79bf9958474e707'
    const url = `https://cloud.iexapis.com/stable/stock/market/batch?symbols=${stockStr}&types=chart&chartCloseOnly=true&range=3m&token=${APIKey}`

    fetch(url, {
      method: 'GET',
    })
    .then(response => response.json())
    .then(response => {
      res.locals.rawPortfolio = response;
      return next();
    })
    .catch(err => {
      return next({
        log: `Error occurred with stockController.getIEXData middleware and the IEX API fetch: ${err}`,
        message: { err: "An error occurred when fetching porfolio statistics from external API." }
      })
    });

  } else {
    return next();
  }

}

stockController.packageIEXData = (req, res, next) => {

  if (res.locals.rawPortfolio) {
    const rawPortfolio = res.locals.rawPortfolio;

    // Container for historical share price information and holdings
    const sharePriceData = [];

    // Iterating through performance data of current portfolio holdings
    for (const key of Object.keys(rawPortfolio)) {

      const companyObj = {};
      companyObj.ticker = key;
      const dataContainer = [];

      rawPortfolio[key].chart.forEach(dailyObj => {
        const { date, close } = dailyObj
        const dailyContainer = {};
        dailyContainer.x = date;
        dailyContainer.y = close;
        dataContainer.push(dailyContainer);
      })

      companyObj.data = dataContainer;
      sharePriceData.push(companyObj);
    }

    res.locals.IEXData = sharePriceData;
    return next();

  } else {

    return next();

  }

}

stockController.finalizeData = (req, res, next) => {

  const currentPortfolio = res.locals.currentShares;

  // Isolating the unique portfolio IDs
  const portfolioIDs = [];

  currentPortfolio.forEach(obj => {
    if (!portfolioIDs.includes(obj.portfolio_id)) {
      portfolioIDs.push(obj.portfolio_id);
    }
  })

  const portfolioInfo = {};

  portfolioIDs.forEach(id => {

    const stockDetails = [];

    currentPortfolio.forEach(stock => {
      const eachStockObj = {};
      if (stock.portfolio_id === id) {
        eachStockObj.ticker = stock.ticker_name;
        eachStockObj.date_purchased = stock.date_purchased;
        eachStockObj.number_shares = stock.number_shares;
        stockDetails.push(eachStockObj);
      }
    })
    const portfolioName = 'portfolio' + id.toString();
    portfolioInfo[portfolioName] = stockDetails;

  })

  // Adjust the portfolioInfo object to reflect shares that have been sold

  for (const key in portfolioInfo) {
    const id = Number(key.slice(9));

    const soldShares = res.locals.soldShares;

    for (let i = 0; i < soldShares.length; i++) {
      if (soldShares[i].portfolio_id === id) {
        const ticker = soldShares[i].ticker_name;

        portfolioInfo[key].forEach(stockObj => {
          if (stockObj.ticker === ticker) {
            if ((stockObj.number_shares - soldShares[i].number_shares) < 0) {
              stockObj.number_shares = 0;
            } else {
              stockObj.number_shares -= soldShares[i].number_shares;
            }
          }
        })
      }
    }
  }

  // Adjusting IEX data for each unique portfolio

  const consolidatedInformation = [];
  const IEXData = res.locals.IEXData;

  for (const key in portfolioInfo) {

    const portfolioContainer = {};
    portfolioContainer.portfolio = key;

    // Figures out what the portfolio name is
    const portfolioID = Number(key.slice(9));
    const currShares = res.locals.currentShares;
    let portfolioName;

    for (let i = 0; i < currShares.length; i++) {
      if (currShares[i].portfolio_id === portfolioID) {
        portfolioName = currShares[i].name;
        break;
      }
    }

    portfolioContainer.portfolioName = portfolioName;

    if (portfolioInfo[key][0].ticker === null) {

      portfolioContainer.data = null

    } else {

      // Adjusting the IEX data for current shares held
      const stockData = [];

      portfolioInfo[key].forEach(stock => {
        const filteredIEX = IEXData.filter(IEXStock => IEXStock.ticker === stock.ticker);
        const stockPerformance = [];

        if (filteredIEX.length > 0) {

        filteredIEX[0].data.forEach(dailyData => {
          const dailyObj = {};
          dailyObj.x = dailyData.x;

          if (dailyData.x >= stock.date_purchased) {
            dailyObj.y = (dailyData.y * stock.number_shares);
            dailyObj.z = stock.number_shares;
          } else {
            dailyObj.y = 0;
            dailyObj.z = 0;
          }

          stockPerformance.push(dailyObj);
        })

        stockData.push(stockPerformance);
      }

      })

      // Combining stockData together into Portfolio1
      const consolidatedStockData = stockData.reduce((acc, stockArr) => {
        stockArr.forEach((dailyObj, i) => {
          if (!acc[i]) {
            const obj = {};
            obj.x = dailyObj.x;
            obj.y = dailyObj.y;
            obj.z = dailyObj.z;
            acc.push(obj);
          } else {
            acc[i].y += dailyObj.y;
            acc[i].z += dailyObj.z;
          }
        })
        return acc;
      }, [])

      portfolioContainer.data = consolidatedStockData;
    }

    consolidatedInformation.push(portfolioContainer);

  }

  const finalConsolidatedObj = {};
  finalConsolidatedObj.category = 'consolidated'
  const finalData = [];

  for(let i = 0; i < consolidatedInformation.length; i++) {

    if (consolidatedInformation[i].data) {

      for(let j = 0; j < consolidatedInformation[i].data.length; j++) {
        if (!finalData[j]) {
          const obj = {};
          obj.x = consolidatedInformation[i].data[j].x;
          obj.y = consolidatedInformation[i].data[j].y;
          obj.z = consolidatedInformation[i].data[j].z;
          finalData.push(obj);
        } else {
          finalData[j].y += consolidatedInformation[i].data[j].y;
          finalData[j].z += consolidatedInformation[i].data[j].z;
        }
      }

    }
  }

  finalConsolidatedObj.data = finalData;
  consolidatedInformation.unshift(finalConsolidatedObj);

  res.locals.chartData = consolidatedInformation;
  return next();
}

module.exports = stockController;

// SCRATCH NOTES

  //res.json() {
  // APINFO: {},
  // CurrentShares: [
    //               {portfolio:1, tickeranme: APPL, price: xx, date: xxx},
    //               {portfolio:1, tickername: UBER, price: xx, date: xxx},
    //               {portfolio:2, tickername: MSFT, price: xx, date: xxx}],
    //               ]
    // SoldShares: {tickername: CODESMITH, soldprice: xxx, date sold, numbershares: 10}, aggregatedInfo: [currentShares + soldShares]]

  /*
  APIInfo: [
    {
      category: consolidated
      data: [{ x: date, y: price, z: shares held across any companies}, {}]
    },
    {
      category: portfolio1
       data: [{ x: date, y: price, z: shares held across any companies}, {}]
    },
    {
      category: portfolio2
      data: [{x: date, y: price, z: shares held across any companies}, {}]
    }
  ]
  */

  // From IEX
  /*
    [
      {
        ticker: AAPL
        data: [3 months data]
      },
      {
        ticker: FB
        data: [3 months data]
      },
    ]
  */

  // create an object for each stock they own across all their portfolios, with dates as keys, and shares they own as of that date as the values

  // Logic to understand
  // let hasSold = false;
  // hasSold = true;
  // {
  //   '2020-08-31': 8,
  //   '2020-09-01': 1,
  //   '2020-09-02': 1,
  // }

  // Portfolio 1 data
  /*
    [
      {
        ticker: consolidated
        data: [{x: date, y: total values of all shareholdings, z: number of shares owned for all stock}]
      },
      {
        ticker: AAPL
        data: [filter this information for how long they have owned the stock; always going to have 3 months of data] [{x: 2020-09-10, y:200(number of shares * closed price on that day), z: No. of shares they own}]
      },
      {
        ticker: FB
        data: [filter this information for how long they have owned the stock; always going to have 3 months of data] [{x: 2020-09-10, y:200(number of shares * closed price on that day), z: No. of shares they own}]
      }
    ],
  */

 // [ {ticker: consolidated, data: [{}, {}, {}] }, { ticker: fb, data: [{x: date, y: price}, {}, {}] }, { ticker: aapl, data: [{}, {}, {}] }  ]
