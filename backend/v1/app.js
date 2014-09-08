// collect params
process.env.TZ = 'UTC';

var path = require("path");
var frontend = path.resolve(__dirname + '/../../frontend/');

var mysql = require('mysql');
var tools = require("cevek-tools");
var ExpressApp = require('express');
var fs = require('fs');

var express = ExpressApp();
express.disable('x-powered-by');
//express.use(ExpressApp.cookieParser());

console.log(frontend);

express.use('/', ExpressApp.static(frontend));


express.use(ExpressApp.json());
express.use(ExpressApp.urlencoded());
express.use(ExpressApp.limit('10mb'));
express.use(function (req, res, next) {
    res.header("Content-Type", "application/json; charset=utf-8");
    res.header("Access-control-allow-origin", "*");
    next();
});


var db_options = {
    host: '127.0.0.1',
    user: 'root',
    password: 'goodjob',
    database: 'translator2',
    port: 3306
};

var app = {
    express: express,
    db: mysql.createConnection(db_options)
};
setInterval(function () {
    app.db.query("SELECT 1");
}, 5 * 60 * 1000);

app.db.queryOne = function () {
    var args = Array.prototype.slice.call(arguments);
    var cb = args.pop();
    args.push(function (err, rows) {
        var row = rows ? rows[0] : null;
        cb(err, row);
    });

    this.query.apply(this, args);
};


var lastUserRes, lastUserReq;
express.use(function (req, res, next) {
    lastUserReq = req;
    lastUserRes = res;
    //console.log(lastUserReq, lastUserRes);
    next();
});


var console_error = console.error;
console.error = function (err) {
    if (typeof arguments[0] == 'string')
        arguments[0] = arguments[0].replace(/ at [^\n]+(node_modules|\(\w)[^\n]+\n?/g, '');
    console_error.apply(null, arguments);
};


process.on('uncaughtException', function (err) {
    if (err.nostack)
        console.error("uncaughtException", new Date(), err.message);
    else
        console.error(err.stack || err);
    if (err && lastUserRes)
        lastUserRes.send(400, {error: err.code ? err.code : "ER_ERROR"});
});

express.get('/slovari/', require('./slovari.js')(app));
express.get('/translate/', require('./translate.js')(app));

express.use(express.router);
express.listen(8020);

console.log(new Date());
