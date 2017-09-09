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
  });
});
