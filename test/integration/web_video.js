require('mocha');
const { expect } = require('chai');
const LambdaTester = require('lambda-tester');
const Promise = require('bluebird');
const awscred = Promise.promisifyAll(require('awscred'));
const AWS = require('aws-sdk');

const web_video = require('../../src/web/video');

describe('Web Handlers - video', () => {

    let config = new AWS.Config({});

    before(() => {
        process.env.VIDEO_TABLE = 'dev.Video';
        return awscred.loadCredentialsAndRegionAsync()
            .then(({ credentials, region }) => {
                config.update({ credentials, region});
            });
    });

    describe('.create', () => {
        it('Returns 201 creating with video id, when receiving new video', () => {
            let url = 'https://www.youtube.com/watch?v=1IFNHcs56ss';
            let expectedStatus = 201;
            let expected = '1IFNHcs56ss';

            // Request mocking.
            let event = {
                body: JSON.stringify({
                    ytlink: url
                })
            };

            return LambdaTester(web_video.create)
                .event(event)
                .expectResolve(result => {
                    expect(result.statusCode).to.equal(expectedStatus);
                    
                    let { resource } = JSON.parse(result.body);
                    expect(resource).to.equal(expected);
                });
        });

        it('Returns error when missing ytlink parameter', () => {
            let expectedStatus = 400;
            let expected = '"ytlink" parameter is missing';

            // Request mocking.
            let event = {
                body: JSON.stringify({})
            };

            return LambdaTester(web_video.create)
                .event(event)
                .expectResolve(result => {
                    expect(result.statusCode).to.equal(expectedStatus);
                    
                    let { message } = JSON.parse(result.body);
                    expect(message).to.equal(expected);
                });
        });

        it('Returns error when given malformed ytlink parameter', () => {
            let url = 'https://www.youtube.com/watch?'
            let expectedStatus = 422;
            let expected = '"ytlink" parameter is malformed';

            // Request mocking.
            let event = {
                body: JSON.stringify({
                    ytlink: url
                })
            };

            return LambdaTester(web_video.create)
                .event(event)
                .expectResolve(result => {
                    expect(result.statusCode).to.equal(expectedStatus);
                    
                    let { message } = JSON.parse(result.body);
                    expect(message).to.equal(expected);
                });
        });
    });

});