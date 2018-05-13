let MongoClient = require('mongodb').MongoClient;
let assert = require('assert');

export class MongoConnection {
    public mongoClient: any;
    private project: string;
    private connectionUrl: string;

    public constructor(config: any) {
        if (config.hasOwnProperty('mongodb')) {
            this.mongoClient = MongoClient;
            this.project = config.mongodb.project;
            this.connectionUrl = config.mongodb.host + ':' + config.mongodb.port;
            this.initConnect(config);
        }
    }

    public initConnect(config: any): void {
        this.mongoClient.connect(this.connectionUrl, (err, client) => {
            assert.equal(null, err);
            let db = client.db(config.mongodb.project);
            db.collection('online_devices').deleteMany({});
            client.close();
        });
    }

    public getConnectionUrl(): string {
        return this.connectionUrl;
    }
}
