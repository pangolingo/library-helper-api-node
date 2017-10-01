const AuthMiddleware = require('../auth-middleware');
const chai = require('chai');
const expect = chai.expect;
const spies = require('chai-spies');

chai.use(spies)

describe('AuthMiddleware', function() {
    let mockSend = function(output){
        console.log('send()')
        return this;
    };
    let mockStatus = function(code){
        console.log('status()')
        return this;
    };
    let mockSet = function(name, value){
        console.log('set()')
    }
    let spySet = chai.spy(mockSet);
    let spySend = chai.spy(mockSend);
    let spyStatus = chai.spy(mockStatus);

    let mockRes = {
        status: spyStatus,
        send: spySend,
        set: spySet
    }
    let mockNext = () => {
        
    }

    function resetSpies(){
        spySet = chai.spy(mockSet);
        spySend = chai.spy(mockSend);
        spyStatus = chai.spy(mockStatus);
        mockRes = {
            status: spyStatus,
            send: spySend,
            set: spySet
        }
    }

    afterEach(function(){
        resetSpies();
    })


    it('doesn\'t require authorization if the path doesn\'t contain /api', function(done){
        let stubReq = {
            path: '/',
            headers: {}
        }
        AuthMiddleware(stubReq, mockRes, mockNext)
        expect(spySend).not.to.have.been.called();
        done();
    })
    it('requires authorization if the path contains /api', function(done){
        let stubReq = {
            path: '/api',
            headers: {}
        }
        AuthMiddleware(stubReq, mockRes, mockNext)
        expect(spySend).to.have.been.called.once;
        // expect(spyStatus).to.have.been.called.with(401); // chai-spies with is broken right now
        expect(spyStatus).to.have.been.called.once;
        done();
    });

    context('when there is a valid JWT', function(){
        it('sets an oauth object on the request', function(){
            let stubReq = {
                path: '/api',
                headers: {
                    'authorization': 'Bearer: fake_jwt_here'
                }
            }
            AuthMiddleware(stubReq, mockRes, mockNext)
            expect(spySet).to.have.been.called.once;
        })
    });

    context('when the JWT doesn\'t have an access token', function(){
        it('returns an unauthorized error', function(){
            let stubReq = {
                path: '/api',
                headers: {
                    'authorization': 'Bearer: fake_jwt_here'
                }
            }
            AuthMiddleware(stubReq, mockRes, mockNext)
            expect(spySend).to.have.been.called.once;
            expect(spyStatus).to.have.been.called.once;
        })
    })
    
});