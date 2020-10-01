const db = require("../models/models.js");

const portfolioController = {}

portfolioController.create = (req,res, next) => {
  const { name } = req.body;
  const username = req.cookies.user;

  const createPortfolioQuery = `INSERT INTO portfolio (user_id, name)
                                SELECT _id, $1 FROM users
                                WHERE username = $2 RETURNING _id, name;`;

  const createPortfolioValues = [name, username]

  db.query(createPortfolioQuery, createPortfolioValues)
  .then(data => {
    res.locals.newPortfolio = data.rows;
    return next();
  })
  .catch(err => {
    return next({
        log: `Error occurred with portfolioController.create middleware: ${err}`,
        message: { err: "An error occurred when creating a new portfolio in the database." }
      })
  })
}

portfolioController.updatePortfolioName = (req,res,next) => {

  const { id, name } = req.body;

  const updatePortfolioQuery = `UPDATE portfolio
                                SET name=$1
                                WHERE _id=$2
                                RETURNING _id, name;`;

  const updatePortfolioValues = [name, id];

  db.query(updatePortfolioQuery, updatePortfolioValues)
  .then(data => {
    res.locals.updatedPortfolio = data.rows;
    return next();
  })
  .catch(err => {
    return next({
      log: `Error occurred with portfolioController.updatePortfolioName middleware: ${err}`,
      message: { err: "An error occurred when modifying a portfolio name in the database." }
    })
  })

}

portfolioController.addSharesToPortfolio = (req, res, next) => {
  //ADD -> portfolio id, name, date, price, num shares (send 200 status code )
  const { portfolio_id, ticker_name, date_purchased, price, number_shares } = req.body;

  const addSharesQuery = `INSERT INTO shares (portfolio_id, ticker_name, date_purchased, price, number_shares)
                          VALUES($1, $2, $3, $4, $5) RETURNING portfolio_id, _id, ticker_name, date_purchased, price, number_shares`;

  const addSharesQueryValues = [portfolio_id, ticker_name, date_purchased, price, number_shares]

  db.query(addSharesQuery, addSharesQueryValues)
  .then(data => {
    res.locals.newShare = data.rows[0];
    return next();
  })
  .catch(err => {
   return next({
     log: `Error occurred with portfolioController.addSharesToPortfolio middleware: ${err}`,
     message: { err: "An error occurred when adding a new share purchase in the database." }
   })
 })

}

portfolioController.addSoldSharesToPortfolio = (req, res, next) => {
  //ADD -> portfolio id, name, date, price, num shares (send 200 status code )
  const { portfolio_id, shares_id, date_sold, sell_price, number_shares } = req.body;

  const addSoldsharesQuery = `INSERT INTO soldshares (portfolio_id, shares_id, date_sold, sell_price, number_shares)
                              VALUES($1, $2, $3, $4, $5)`;

  const addSoldsharesValues = [portfolio_id, shares_id, date_sold, sell_price, number_shares];

  db.query(addSoldsharesQuery, addSoldsharesValues)
  .then(() => {
    return next();
  })
  .catch(err => {
    return next({
      log: `Error occurred with portfolioController.addSharesToPortfolio middleware: ${err}`,
      message: { err: "An error occurred when adding sold shares to the database." }
    })
  })

}

portfolioController.editCurrentShares = (req, res, next) => {
  const { portfolio_id, shares_id, date_purchased, price, number_shares } = req.body;

  const editCurrensSharesQuery = `UPDATE shares
                                  SET date_purchased=$3, price=$4, number_shares=$5
                                  WHERE portfolio_id=$1 AND _id=$2`;

  const editCurrensSharesValues = [portfolio_id, shares_id, date_purchased, price, number_shares];

  db.query(editCurrensSharesQuery, editCurrensSharesValues)
  .then(() => {
    return next();
  })
  .catch(err => {
    return next({
      log: `Error occurred with portfolioController.editCurrentShares middleware: ${err}`,
      message: { err: "An error occurred when editing current shares to the database." }
    })
  })

}

module.exports = portfolioController;
