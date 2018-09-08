// TODO: Put this in another repos (internal services), to avoid AWS boiler plate code.
const AWS = require('aws-sdk');

const ytdl = require('../util/youtubedl-adaptor');
const VideoRepo = require('../util/video-repository');
const logger = require('../util/logger');

exports.create = async (event, context, callback) => {
    let data = JSON.parse(event.body);
    logger.log(`REQUEST: ${JSON.stringify(data)}`);

    const sns = new AWS.SNS();
    let videoRepo = new VideoRepo();

    if (!data.ytlink) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: '"ytlink" parameter is missing'
            })
        };
    }


    const id_re = /.*v=(\w*)$/;
    let match = id_re.exec(data.ytlink);
    if (!match || match.length === 0) {
        return {
            statusCode: 422,
            body: JSON.stringify({
                message: '"ytlink" parameter is malformed'
            })
        };
    }
    
    let id = match[1];
    let statusCode = 200; // Already created. Talvez usar redirect (303)?
    let record = await videoRepo.get(id)
        .catch(err => {
            // TODO: Create exception types.
            if (err.message === "Entity not found") statusCode = 201 // Creating
            else throw new Error(`Unexpected error: ${JSON.stringify(err)}`);
        })

    if (!record) {
        // Video does not exist yet, notify for conversion!
        // FIXME: Hard coded, and should be in internal services, to avoid boilerplate.
        let params = {
            TopicArn: 'arn:aws:sns:us-west-2:582191388523:dev_notify_convert_video',
            Message: JSON.stringify({ id })
        };

        await sns.publish(params).promise();
    }

    // let info = await ytdl.getInfo(data.ytlink);

    return {
        statusCode: statusCode,
        body: JSON.stringify({
            resource: id
        })
    };
}