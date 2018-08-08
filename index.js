/**
 * @class 
 * Handle connections to different mongodb databases
 * @param {Mongoose} [mongooseInstance] A mongoose instance
 */
class MongoConnectionManager {
    constructor(mongooseInstance = require('mongoose')) {
        this._store = {};
        if (!mongooseInstance) {
            throw new Error('ConnectionManager requires a mongoose instance');
        }
        this._mongooseInstance = mongooseInstance;
        this.schemas = {};
    }

    /**
     * Get a connection from the connection storage
     * @param {String} uri Connection uri
     * @returns {Connection} connection the stored connection coressponding to a given id or a new connection
     */
    getConnection(uri) {
        if (!this._store[uri]) {
            this._store[uri] = this._mongooseInstance.createConnection(uri, {
                useNewUrlParser: true
            });
        }
        let connection = this._store[uri];
        return connection;
    }

    /**
     * Store a new connection in the internal connection cache
     * @param {String} uri Connection uri
     * @param {Object} [options] Options for connection 
     * @param {Connection} connection The created connection
     */
    storeConnection(uri, options = {}) {
        let connection = this._mongooseInstance.createConnection(uri,options);
        this._store[uri] = connection;
        return connection;
    }

    /**
     * Delete a stored connection
     * @param {String} uri The uri of the connection to delete 
     */
    deleteConnection(uri) {
        this._store[uri] = null;
        delete this._store[uri];
    }

    /**
     * Get the internal mongoose instance
     * @returns {Mongoose} instance The internal mongoose instance
     */
    getMongooseInstance() {
        let instance = this._mongooseInstance;
        return instance;
    }

    /**
     * Creates a model upon a specific connection
     * @param {Connection} connection A connection instance
     * @param {String} modelName Name of the compiled model
     * @param {Schema} modelSchema Schema of the model
     * @returns {Model} model The compiled model
     */
    createModel(connection, modelName, modelSchema) {
        let model = connection.model(modelName, modelSchema);
        return model;
    }

    /**
     * Add a new Mongoose Schema to our schemas storage
     * @param {String} schemaName Name of the schema
     * @param {Schema} schemaObject Schema definition
     */
    addSchema(schemaName, schemaObject) {
        this.schemas[schemaName] = schemaObject;
    }


    /**
     * Build a mongoose model from an internal saved schema
     * @param {Connection} connection The connection upon to build a model  
     * @param {String} schemaName Name of schema as saved internally
     * @returns {Model} model The compiled model
     */
    buildModelFromSchema(connection, schemaName) {
        if (!connection) {
            throw new Error('Connection object is required');
        }
        let schema = this.schemas[schemaName];
        if (!schema) {
            throw new Error(`${schemaName} schema doesn't exist`);
        }
        let model = connection.model(schemaName, schema);
        return model;
    }
}

module.exports = MongoConnectionManager;