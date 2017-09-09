const express = require('express');
const session = require('express-session')
const app = express();
const OAuth1Client = require('oauth-1-client');

const port = 3000;
const baseURL = 'http://localhost:3000';


let oauthClient = new OAuth1Client({
    key: 'bqLkST63ZqSqqp0EH5eeg',
    secret: 'oFThG5O4RCEFsXazRm0KlcyZv6XGKIOxxOcJIx2Qow',
    callbackURL: `${baseURL}/oauth/callback`,
    requestUrl: 'http://www.goodreads.com/oauth/request_token',
    accessUrl: 'http://www.goodreads.com/oauth/access_token',
    apiHostName: 'http://www.goodreads.com'
});


app.use(session({
  secret: 'mysessionsecret',
  resave: false,
  saveUninitialized: true
}))


app.get('/', (req, res) => {
    res.send('Reading List Library Helper - Backend API');
});

app.get('/oauth/?', (req, res) => {
    let client_callback_url = null;
    if(!('callback_url' in req.query)){
        res.status(400).send('No callback url specified');
    } else {
        client_callback_url = req.query.callback_url;
    }

    oauthClient.requestToken()
        .then((request_token) => {

            session.request_token = request_token.token
            session.request_token_secret = request_token.tokenSecret
            session.client_callback_url = client_callback_url

            var tempCredentials = {
                token: request_token.token,
                tokenSecret: request_token.tokenSecret
            };
            // res.send(tempCredentials);
            const authUrl = `https://www.goodreads.com/oauth/authorize?oauth_token=${request_token.token}&oauth_callback=${oauthClient.callbackURL}`
            res.redirect(authUrl);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Something broke!')
        });
});

app.get('/oauth/callback/?', (req, res) => {
    res.send(`Oauth token: ${req.query.oauth_token}`);
});

app.get('/api/?', (req, res) => {
    
});

app.get('/api/shelves/?', (req, res) => {
    
});

app.get('/api/shelves/:name/?', (req, res) => {
    let shelfName = req.params.name;
});

module.exports = app.listen(port, () => {
    console.log('API Server listening on port 3000');
});