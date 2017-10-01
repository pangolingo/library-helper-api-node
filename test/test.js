const server = require('../index');
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

describe('index', function() {
  describe('GET /', function() {
    it('should return status code 200', function(done){
        chai.request(server)
            .get('/')
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            });
    });

    it('should return a string', function(done){
        chai.request(server)
            .get('/')
            .end((err, res) => {
                expect(res.text).to.be.a('string');
                done();
            });
    });
  });

  describe('GET /oauth', function() {
    // it('should print the request token', function(done){
    //     chai.request(server)
    //         .get('/oauth?callback_url=test')
    //         .end((err, res) => {
    //             expect(res.body).to.have.all.keys('token', 'tokenSecret');
    //             done();
    //         });
    // });
    it('returns an error if there is no callback', function(done){
        chai.request(server)
            .get('/oauth')
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    })
    it('redirects to goodreads', function(done){
        chai.request(server)
            .get('/oauth?callback_url=test')
            .end((err, res) => {
                expect(res).to.redirect
                expect(res.redirects[0]).to.match(/^https:\/\/www\.goodreads\.com\/oauth\/authorize\?oauth_token=.+?\&oauth_callback=.+?$/);
                done();
            });
    })

    it('sets a session cookie', function(done){
        // use an agent to be able to persist cookies
        let agent = chai.request.agent(server)
        agent
            .get('/oauth?callback_url=test')
            .redirects(0)
            .end((err, res) => {
                expect(res).to.have.cookie('connect.sid');
                done();
            })
    })
  });

  describe('GET /oauth/callback', function() {
    it('sends an error if there was no previous request to /oauth', function(done){
        chai.request(server)
            .get('/oauth/callback')
            .end((err, res) => {
                expect(res).to.have.status(400);
                done();
            });
    })

    // unable to test this without a real verifier from goodreads
    it.skip('redirects to the callback url send in the /oauth call', function(done){
        // use an agent to be able to persist cookies
        let agent = chai.request.agent(server)
        agent
            .get('/oauth?callback_url=http://www.bing.com')
            .then((res) => {
                agent
                    .get('/oauth/callback?oauth_token=test')
                    .end((err, res) => {
                        expect(res).to.redirect
                        expect(res.redirects[0]).to.match(/^http:\/\/www\.bing\.com.+?$/);
                        done();
                    });
            })
            
    })

    // unable to test this without a real verifier from goodreads
    it.skip('sends a JWT to the callback url', function(done){
        // use an agent to be able to persist cookies
        let agent = chai.request.agent(server)
        agent
            .get('/oauth?callback_url=http://www.bing.com')
            .then((res) => {
                agent
                    .get('/oauth/callback?oauth_token=test')
                    .end((err, res) => {
                        expect(res.redirects[0]).to.match(/^.+?jwt=.+?$/);
                        done();
                    });
            })
    })

  });
});
