import {logger} from "./util/logger";

let config = require('../config/config.json');

let fs = require('fs');
let io: any = null;
let serverOptions: any = {
    pingTimeout: config.pingTimeout,
    pingInterval: config.pingInterval
};

io = require('socket.io')(config.port, serverOptions);

import {MongoConnection} from "./connections/MongoConnection";
import {Neo4jConnection} from "./connections/Neo4jConnection";

import {AccountService} from "./services/AccountService";
import {AdsBannerService} from "./services/AdsBannerService";
import {AdsVideoService} from "./services/AdsVideoService";

const DbConn = new MongoConnection(config);
const Neo4jConn = new Neo4jConnection(config);

io.on('connection', function (socket) {
    if (socket.handshake.query.token) {
        let accService = new  AccountService();
        let accServiceClass = accService.generateAccountFromToken(socket.handshake.query.token, config);

        if (accServiceClass.isValid) {
            AccountService.logOnlineDevice(accServiceClass, config, DbConn);

            socket.on('ads-banner', function (data) {
                let adsBannerServiceClass = AdsBannerService.prepareData(accServiceClass.account, data);

                if (adsBannerServiceClass.isValid){
                    AdsBannerService.saveData(adsBannerServiceClass, config, DbConn);
                    logger.info("On: ads-banner - ProfileID: " + accServiceClass.account.account_profile_id + ", ModelID: " + adsBannerServiceClass.mongo_id);
                }
            });

            socket.on('ads-video', function (data) {
                let adsVideoServiceClass = AdsVideoService.prepareData(accServiceClass.account, data);

                if (adsVideoServiceClass.isValid){
                    AdsVideoService.saveData(adsVideoServiceClass, config, DbConn);
                    logger.info("On: ads-video - ProfileID: " + accServiceClass.account.account_profile_id + ", ModelID: " + adsVideoServiceClass.mongo_id);
                }
            });

            socket.onclose = function (reason) {
                if (accServiceClass.isValid) {
                    AccountService.removeFromOnlineDevice(accServiceClass, config, DbConn);
                    logger.info("Onclose - ProfileID: " + accServiceClass.account.account_profile_id);
                }
            };
        }else
            logger.error("Invalid token");
    } else
        logger.info("The token is not provided.");

    socket.on('heartbeat', function (data, fn) {
        fn('alive');
    });
});