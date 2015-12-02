'use strict';

const Koa = require('koa'),
      app = Koa();

let port = 3000;

app
.use(require('koa-gzip')())
.use(require('koa-validate')())
.use(require('./api/market'))
.listen(port, () => {
    console.log(`server listening on port: ${port}`);
});
