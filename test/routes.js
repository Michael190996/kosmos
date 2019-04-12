import chai from 'chai';
import chaiHttp from 'chai-http';
import index from '../src/index';
import api from '../src/api';

chai.use(chaiHttp);

describe('Route tests', function () {
    const expect = chai.expect;
    const assert = chai.assert;
    let server = null;
    let agent = null;

    beforeEach(async function () {
        server = await index;
        agent = chai.request.agent(server)
    });

    it('/reset', (done) => {
        agent
            .post('/reset')
            .then(res => expect(res).to.have.status(200))
            .then(() => done())
            .catch(err => done(err))
    });

    it('/userSave', (done) => {
        const promises = [];

        for (let i = 0; i < 500; i++) {
            promises.push(agent
                .post('/userSave')
                .send({firstName: 'test'})
                .then(res => expect(res).to.have.status(200)));
        }

        Promise.all(promises)
            .then(() => done())
            .catch(err => done(err));
    });

    it('/send', (done) => {
        agent
            .post('/send')
            .send({template: 'test'})
            .then(res => expect(res).to.have.status(200))
            .then(() => done())
            .catch(err => done(err));
    });
});