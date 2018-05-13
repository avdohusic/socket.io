import {Account} from "../models/Account";
import {MongoConnection} from "../connections/MongoConnection";
import {AdsBanner, AdsBannerServiceClass} from "../models/AdsBanner";

let assert = require('assert');

export class AdsBannerService {
    static prepareData(account: Account, data: any): AdsBannerServiceClass {
        let adsBannerServiceClass = new AdsBannerServiceClass();
        adsBannerServiceClass.adsBanner = new AdsBanner(account, data);
        adsBannerServiceClass.isValid = adsBannerServiceClass.adsBanner.isValid();
        adsBannerServiceClass.isValidMongoID(data);

        return adsBannerServiceClass;
    }

    static saveData(adsBannerServiceClass: AdsBannerServiceClass, config: any, DbConn: MongoConnection): void {
        DbConn.mongoClient.connect(DbConn.getConnectionUrl(), (err, client) => {
            assert.equal(null, err);
            let db = client.db(config.mongodb.project);
            db.collection('ads_banner').updateOne(
                {"_id": adsBannerServiceClass.getMongoID()},
                {$set: adsBannerServiceClass.adsBanner},
                {upsert: false});

            client.close();
        });
    }
}