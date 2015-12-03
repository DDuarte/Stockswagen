'use strict';

const Koa = require('koa'),
      app = Koa();

const StockHistorySubscriber = require('./services/stockHistorySubscriber'),
      StockSnapshotSubscriber = require('./services/stockSnapshotSubscriber');

let historicalTimer, snapshotTimer;
try {
    historicalTimer = StockHistorySubscriber.schedule(require('config').schedules.historicalQuotes);
    snapshotTimer = StockSnapshotSubscriber.schedule(require('config').schedules.quotes);
} catch(err) {
    console.error("Error in stock subscription service:", err);
}

let port = 3000;

app
.use(require('koa-gzip')())
.use(require('koa-validate')())
.use(require('./services/market'))
.listen(port, () => {
    console.log(`server listening on port: ${port}`);
});
