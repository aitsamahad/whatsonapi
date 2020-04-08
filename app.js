const express = require('express');
const path = require('path');
const logger = require('morgan');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/whatson', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, });

const app = express();
app.use(helmet());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
const userRoutes = require('./Routes/users');
const organizerRoutes = require('./Routes/organizers');
const eventRoutes = require('./Routes/events');
const dashRoutes = require("./Routes/dashRoutes");
const testRoutes = require('./Routes/test');
const bookingRoutes = require('./Routes/bookings');

// Passport Config require
require('./config/passport')(passport);

app.set('view engine', 'ejs');
app.set('views', 'views');

// Middlewares
app.use(logger('dev')); // Morgan API Calls Logger
app.use(compression());
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
// app.use(express.static(path.join(__dirname, 'resources')));
app.use(express.static(__dirname + '/resources'));


// Express Session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

// PassportJS Middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect Flash Messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.error = req.flash('error');
  next();
});
app.use("/dashboard", dashRoutes);
app.use('/test', testRoutes);

// Routes
app.use(verifyToken); // Bearer Authentication
app.use('/users', userRoutes);
app.use('/organizers', organizerRoutes);
app.use('/events', eventRoutes);
app.use('/bookings', bookingRoutes);

// Catch 404 Errors and Forward them to error handlers
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error Handlers
app.use((err, req, res, next) => {
    const error = app.get('env') === 'development' ? err : {};
    const status = err.status || 500; // 500 is server error
    
    // Respond to client
    res.status(status).json({
        error: {
            message: error.message
        }
    });

    // Respond to terminal
    console.error(err);
});

// Verify Token
function verifyToken(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if(typeof bearerHeader !== 'undefined') {
      // Split at the space
      const bearer = bearerHeader.split(' ');
      // Get token from array
      const bearerToken = bearer[1];
      // Set the token
      req.token = bearerToken;
      // Next middleware
      next();
    } else {
      // Forbidden
      res.sendStatus(403);
    }
  
  }

// Start the server
const port = process.env.port || 3000;
app.listen((port), () => {
    console.log(`Server started on port ${port}`);
});