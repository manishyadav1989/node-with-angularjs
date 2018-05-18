/*
* Manage app with express
*/
const express = require('express'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    app = express();

// app path and body parser
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// router manage
app.use('*',function (req, res, next) {
    req.io = global.io;
    req.socket = global.socket;
    next();
    console.log(`get request`)
});
app.use('/', require('./router'));

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
