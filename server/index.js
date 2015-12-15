'use strict';

const Koa = require('koa'),
      app = Koa(),
      config = require('config');

const StockHistorySubscriber = require('./services/stockHistorySubscriber'),
      StockSnapshotSubscriber = require('./services/stockSnapshotSubscriber'),
      PushNotificationsSubscriber = require('./services/pushNotificationsSubscriber');

let historicalTimer, snapshotTimer, notificationsTimer;
try {
    historicalTimer = StockHistorySubscriber.schedule(config.schedules.historicalQuotes);
    snapshotTimer = StockSnapshotSubscriber.schedule(config.schedules.quotes);
    notificationsTimer = PushNotificationsSubscriber.schedule(config.schedules.pushNotifications);
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
