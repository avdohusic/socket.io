import {Account, AccountServiceClass} from '../models/Account';
import crypto = require('crypto');
import maxmind = require('maxmind');
let path  = require('path');

let assert = require('assert');
import {MongoConnection} from "../connections/MongoConnection";


export class AccountService {
    public generateAccountFromToken(token: any, config: any): AccountServiceClass {
        let accService = new AccountServiceClass();
        try {
            let data = Buffer.from(token, 'base64');
            let encrypted = data.slice(64);

            let key = crypto
                .createHash('sha256')
                .update(config.tokenKey + config.tokenSalt)
                .digest('hex')
                .substr(0, 32);

            let iv = encrypted.slice(0, 16);

            encrypted = encrypted.slice(16);

            let decipher = crypto.createDecipheriv('AES-256-CBC', key, iv);
            let decrypted = Buffer.concat([
                decipher.update(encrypted),
                decipher.final()
            ]);

            let jsonData = JSON.parse(decrypted.toString('utf8'));
            if (jsonData.hasOwnProperty('uid'))
                accService.uid = jsonData.uid;

            accService.account = new Account();
            accService.account.fillData(jsonData);
            this.setGeoData(accService.account, config);
            accService.account.checkSex();
            accService.isValid = accService.account.isValid();
        } catch (err) {
            accService.isValid = false;
        }

        return accService;
    }

    public setGeoData(account: Account, config: any): void {
        if (config.maxmindDbPath) {
            let cityLookup = maxmind.openSync(path.resolve(config.maxmindDbPath));
            let geoData = cityLookup.get(account.getIpAddress());
            account.setGeoData(geoData);
        }
    }

    static logOnlineDevice(acc: AccountServiceClass, config: any, DbConn: MongoConnection): void {
        DbConn.mongoClient.connect(DbConn.getConnectionUrl(), (err, client) => {
            assert.equal(null, err);
            let db = client.db(config.mongodb.project);
            db.collection('active_users').update(
                {"_id": acc.uid},
                {
                    $set: {
                        "socket_id": acc.uid,
                        "updated": new Date()
                    },
                    $setOnInsert: acc.account
                },
                {'upsert': true}
            );
            client.close();
        });
    }

    static removeFromOnlineDevice(acc: AccountServiceClass, config: any, DbConn: MongoConnection): void{
        DbConn.mongoClient.connect(DbConn.getConnectionUrl(), (err, client) => {
            assert.equal(null, err);
            let db = client.db(config.mongodb.project);
            db.collection('active_users').deleteOne({'_id': acc.uid});
            client.close();
        });
    }
}