'use strict';

const Later = require('later'),
      _ = require('lodash'),
      Co = require('co'),
      Config = require('config'),
      Moment = require('moment'),
      Finance = require('yahoo-finance'),
      Firebase = require('firebase'),
      Fireproof = require('fireproof'),
      Portfolios = new Fireproof(new Firebase(Config.firebase.collections.portfolios)),
      HistoricalQuotes = new Fireproof(new Firebase(Config.firebase.collections.historicalQuotes));

class StockHistorySubscriber {

    static schedule(scheduleText) {
        let sched = Later.parse.text(scheduleText);

        if (sched.error !== -1) {
            throw new Error(`The text schedule expression is invalid: ${scheduleText}`);
        }

        return Later.setInterval(this._watchStocksHistory, sched);
    }

    static _watchStocksHistory() {
        return Co(function* () {

            console.log("Updating stock history...");

            let portfolios = yield Portfolios; // get all portfolios
            let stockSymbols = _.uniq(_.flatten(_.values(portfolios.val())
                                .map(kvStocks => { return _.values(kvStocks); }))
                                .map(stockObj => { return stockObj.tick; }));

            let fetchDate = Moment().format();
            let stocksData = yield Finance.historical({
                from: Moment().subtract(120, 'days').format(),
                to: fetchDate,
                symbols: stockSymbols
            });

            let updates = [];
            Object.keys(stocksData).forEach((symbol) => {
                stocksData[symbol] = stocksData[symbol].map((stock) => {
                    stock.date = stock.date.toString();
                    return stock;
                });
                updates.push(HistoricalQuotes.child(symbol).set( stocksData[symbol] ));
            });

            let result = yield updates;
            return result;
        })
        .catch((error) => {
            console.error('Error in StockHistorySubscriber:', error);
        });
    }
}

module.exports = StockHistorySubscriber;
