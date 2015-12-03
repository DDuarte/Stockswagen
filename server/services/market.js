'use strict';

const Market = require('koa-router')(),
      Finance = require('yahoo-finance');

Market.get('/quotes/:stockSymbol', function *show() {

    this.checkParams('stockSymbol').len(1, 5);

    if (this.errors) {
        this.body = this.errors;
        this.status = 400;
        return;
    }

    this.body = yield Finance.snapshot({ symbol: this.params.stockSymbol});
});

Market.get('/quotes/:stockSymbol/history', function *showHistory() {

    this.checkParams('stockSymbol').len(1, 5);

    this.checkQuery('from').notEmpty().isDate();
    this.checkQuery('to').notEmpty().isDate();

    if (this.errors) {
        this.body = this.errors;
        this.status = 400;
        return;
    }

    this.body = yield Finance.historical({
        symbol: this.params.stockSymbol,
        from: this.query.from,
        to: this.query.to
    });
});

module.exports = Market.routes();
