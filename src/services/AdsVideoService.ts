import {Account} from "../models/Account";
import {AdsVideo, AdsVideoServiceClass} from "../models/AdsVideo";
import {MongoConnection} from "../connections/MongoConnection";

let assert = require('assert');

export class AdsVideoService {
    static prepareData(account: Account, data: any): AdsVideoServiceClass {
        let adsVideoServiceClass = new AdsVideoServiceClass();
        adsVideoServiceClass.adsVideo = new AdsVideo(account, data);
        adsVideoServiceClass.isValid = adsVideoServiceClass.adsVideo.isValid();
        adsVideoServiceClass.isValidMongoID(data);

        return adsVideoServiceClass;
    }

    static saveData(adsVideoServiceClass: AdsVideoServiceClass, config: any, DbConn: MongoConnection): void {
        DbConn.mongoClient.connect(DbConn.getConnectionUrl(), (err, client) => {
            assert.equal(null, err);
            let db = client.db(config.mongodb.project);
            db.collection('ads_video').updateOne(
                {"_id": adsVideoServiceClass.getMongoID()},
                {$set: adsVideoServiceClass.adsVideo},
                {upsert: false});

            client.close();
        });
    }
}