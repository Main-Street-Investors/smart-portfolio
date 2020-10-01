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

portfolioController.checkNumberSharesInPortfolio = (req, res, next) => {
    // This will be done when user is selling portfolio (before sellSharesToPortfolio happens)
    // We will just get the specific portfolio quantity
    /**
   SELECT s.number_shares
    FROM shares AS s
    JOIN portfolio AS p ON p._id = s.portfolio_id
    WHERE p._id = 1 AND s.ticker_name = 'FB';
    * */
    //compare the shares number if it is bigger than what client requested
      //if it is bigger then set res.locals.boolean to true
      // else set boolean to false


}

portfolioController.removeSharesToPortfolio = (req,res, next) => {
  //ADD -> portfolio id, name, date, price, num shares (send 200 status code )
  /**
   INSERT INTO shares (portfolio_id, ticker_name, date_purchased, price, number_shares)
    VALUES($1, $2, $3, $4, $5)
    */
  // selling -> we have to remove from current shares and add it to sold shares
  // This requires nested db query where you update shares in current shares
  // if the shares requested to remove is bigger than the shares in the database (boolean true), then we will just delete the current portfolio

  // DELETE FROM shares WHERE ticker_name=$1

  // if the boolean is false then we will just manipulate the data
  //UPDATE shares
  //SET ticker_name=$3, date_purchased=$4, price=$5, number_shares=$6
  //WHERE portfolio_id=$1 AND ticker_name=$2

}

portfolioController.checkSoldSharesInPortfolio = (req,res,next) => {
    // This will check if soldshares have the stock already
    /**
      SELECT ss.shares_id, s.ticker_name
      FROM soldshares AS ss
      JOIN shares AS s ON ss.shares_id = s._id
      WHERE ss.portfolio_id=$1
    */
    // if it has stock already in the table set boolean2 to true
    // if it doensn't have stock already in the teable, set boolean2 to false

}

portfolioController.addSoldSharesToPortfolio = (req,res, next) => {
  //ADD -> portfolio id, name, date, price, num shares (send 200 status code )

  // if boolean2 is false then we will just insert
  /**

    */

    // if boolean2 is true then we will update
    /**
    UPDATE soldshares
    SET ticker_name=$3, date_purchased=$4, price=$5, number_shares=$6
    WHERE portfolio_id=$1 AND ticker_name=$2
    */
}

module.exports = portfolioController;
