const DynamoRepository = require('./dynamo-respository');

class VideoRepository extends DynamoRepository {
    constructor() {
        super(process.env.VIDEO_TABLE);
    }
}

module.exports = VideoRepository;