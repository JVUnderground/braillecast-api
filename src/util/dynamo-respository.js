const AWS = require('aws-sdk');
const logger = require('./logger');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

/**
 * A generic dynamo db repository with basic CRUD operations
 */
class DynamoRepository {

    /**
     * Constructor
     * @param {*} tableName The name of the underlying dynamo table for this instance
     */
    constructor(tableName) {
        if (!tableName) throw new Error('Missing table name to create repository.');
        this._tableName = tableName;
    }


    /**
     * Retrieve a record by its primary unique identifier (uuid)
     * @param {*Order's unique universal identifier} uuid 
     */
    get(uuid) {
        if (!uuid) {
            return Promise.reject(new Error('Missing parameter to call'));
        }
        var params = {
            TableName: this._tableName,
            Key: { uuid }
        };
        logger.log(`DATABASE GET: ${JSON.stringify(params)}`);
        return dynamoDb.get(params).promise()
            .then(response => {
                logger.log(`DATABASE RESPONSE: ${JSON.stringify(response)}`);
                if (response.Item) {
                    return response.Item;
                }
                throw new Error('Entity not found');
            });
    }

    /**
     * Creates a new entity record in the database and assigns a new uuid and version to it.
     * @param {*} entity The saved entity, with assigned uuid and version.
     */
    async create(entity) {
        if (entity === null || typeof entity !== 'object') {
            throw new Error('Invalid entity');
        }

        entity.uuid = uuid();
        entity.version = Date.now();

        var params = {
            TableName: this._tableName,
            Item: entity,
            ReturnValues: 'NONE'
        };

        logger.log('DATABASE PUT: ' + JSON.stringify(params));

        return dynamoDb.put(params).promise()
            .then(() => {
                return entity;
            });
    }
}

module.exports = DynamoRepository;