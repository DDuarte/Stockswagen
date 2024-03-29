'use strict';

const Later = require('later'),
      _ = require('lodash'),
      Co = require('co'),
      Config = require('config'),
      Finance = require('yahoo-finance'),
      Firebase = require('firebase'),
      Fireproof = require('fireproof'),
      Portfolios = new Fireproof(new Firebase(Config.firebase.collections.portfolios)),
      Quotes = new Fireproof(new Firebase(Config.firebase.collections.quotes));

class StockSnapshotSubscriber {

    static schedule(scheduleText) {
        let sched = Later.parse.text(scheduleText);

        if (sched.error !== -1) {
            throw new Error(`The text schedule expression is invalid: ${scheduleText}`);
        }

        return Later.setInterval(this._watchStocksSnapshot, sched);
    }

    static _watchStocksSnapshot() {
        return Co(function* () {

            console.log("Updating stocks snapshot...");

            let portfolios = yield Portfolios; // get all portfolios
            let stockSymbols = _.uniq(_.flatten(_.values(portfolios.val())
                                .map(kvStocks => { return _.values(kvStocks); }))
                                .map(stockObj => { return stockObj.tick; }));

            let stocksData = yield Finance.snapshot({
                symbols: stockSymbols
            });

            let updates = [];
            stocksData.forEach((data) => {
                data.lastTradeDate = data.lastTradeDate.toString();
                updates.push(Quotes.child(data.symbol).set( data ));
            });

            return yield updates;
        })
        .catch((error) => {
            console.error('Error in StockSnapshotSubscriber:', error);
        });
    }
}

module.exports = StockSnapshotSubscriber;
