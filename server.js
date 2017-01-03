var express = require('express');
var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;
var Twit = require('twit');
var userToken = '';
var userTokenSecret = '';

//tweetThis('Tweet this!');
//setInterval(tweetThis, 20*1000);

function tweetThis(text, token, secret) {
    var config = {
        consumer_key: 'Ax9kPHdetJSNOKhc4g1V94p8y',
        consumer_secret: 'vOu2FXQCe3sO1LBrzB1tHVgqSsyj23ZGWe0QLRXT4Ww2DYvK26',
        access_token: token,
        access_token_secret: secret
    };

    var T = new Twit(config);
    //var r = Math.floor(Math.random()*100)
    var tweet = {status: text + ' ' + new Date().getTime().toString()};
    T.post('statuses/update', tweet, tweeted);

    function tweeted(err, data, response) {
        if (err) {
            console.log('Error', err);
        } else {
            console.log('Success');
        }
    }
}

//T.get('search/tweets', { q: 'banana since:2017-01-01', count: 2 }, printTweets);


function printTweets(err, data, response) {
    var tweets = data.statuses;
    for (var i = 0; i < tweets.length; i++) {
        console.log(tweets[i].text);
    }
}

console.log('Tweet@Me Bro');


// Configure the Twitter strategy for use by Passport.
//
// OAuth 1.0-based strategies require a `verify` function which receives the
// credentials (`token` and `tokenSecret`) for accessing the Twitter API on the
// user's behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new Strategy({
        consumerKey: 'Ax9kPHdetJSNOKhc4g1V94p8y',
        consumerSecret: 'vOu2FXQCe3sO1LBrzB1tHVgqSsyj23ZGWe0QLRXT4Ww2DYvK26',
        callbackURL: 'http://127.0.0.1:3000/login/twitter/return'
    },
    function (token, tokenSecret, profile, cb) {
        // In this example, the user's Twitter profile is supplied as the user
        // record.  In a production-quality application, the Twitter profile should
        // be associated with a user record in the application's database, which
        // allows for account linking and authentication with other identity
        // providers.
        // console.log('USER TOKEN:', token, 'USER TOKEN SECRET:', tokenSecret, 'PROFILE:', profile, 'CB:', cb);

        //tweetThis('Ayoooo', token, tokenSecret);
        userToken = token;
        userTokenSecret = tokenSecret;
        return cb(null, profile);
    }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Twitter profile is serialized
// and deserialized.
passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});


// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({extended: true}));
app.use(require('express-session')({secret: 'keyboard cat', resave: true, saveUninitialized: true}));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/',
    function (req, res) {
        res.render('home', {user: req.user});
    });

app.get('/login',
    function (req, res) {
        res.render('login');
    });

app.get('/login/twitter',
    passport.authenticate('twitter'));

app.get('/login/twitter/return',
    passport.authenticate('twitter', {failureRedirect: '/login'}),
    function (req, res) {
        res.redirect('/');
    });

app.get('/profile',
    require('connect-ensure-login').ensureLoggedIn(),
    function (req, res) {
        res.render('profile', {user: req.user});
    });

app.post('/tweet', function(req, res){
    console.log('lolol:', req.body);
    if(req.body.timeout){
        console.log(req.body.timeout);
        setInterval(function(){
            tweetThis(req.body.text, userToken, userTokenSecret);
        }, req.body.timeout*1000);
    } else{
        tweetThis(req.body.text, userToken, userTokenSecret);
    }
    res.render('profile', {user: req.user});
});

console.log('App listening on port 3000');
app.listen(process.env.PORT || 3000);
