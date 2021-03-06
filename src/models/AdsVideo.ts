import {logger} from "../util/logger";

let validation = require('../../config/validation/adsVideo.json');
let ObjectID = require('mongodb').ObjectID;
import {Account} from "./Account";

export class AdsVideo extends Account {
    public modified: Date;
    public clicked: number | boolean = false;
    public closed: number | boolean = false;
    public duration: number = null;
    public retention_time: number = null;

    public constructor(account: Account, data: any) {
        super(account);
        this.modified = new Date();
        Object.keys(data).forEach((e) => {
            this.setParam(e, data[e]);
        });

        this.setParam("closed", this.booleanToNumber('closed'), false);

        this.setParam("clicked", this.booleanToNumber('clicked'), false);
    }

    public isValid(): boolean {
        let required = {};
        if (!this.isEmptyValidationObj(validation)) {
            Object.keys(validation).forEach((e) => {
                if (e !== "mongo_id") {
                    if (this[e] !== null && this[e] !== undefined) {
                        if (typeof (this[e]) !== validation[e].type) {
                            let defaultData = null;
                            if (validation[e].hasOwnProperty('default'))
                                defaultData = validation[e].default;
                            this.tryChangeType(e, validation[e].type, defaultData);
                        }
                    } else {
                        if (validation[e].required)
                            required[e] = "required";
                        else
                            this.setParam(e, validation[e].default);
                    }
                }
            })
        }

        if (!this.isEmptyValidationObj(required)) {
            logger.log({
                level: 'info',
                validation: required
            });
            return false;
        }

        return true;
    }
}

export class AdsVideoServiceClass {
    public mongo_id: any = null;
    public isValid: boolean = false;
    public adsVideo: AdsVideo;

    public isValidMongoID(data: any): void {
        if (data.mongo_id) {
            this.mongo_id = new ObjectID(data.mongo_id);
        } else
            this.isValid = false;
    }

    public getMongoID(): any {
        return this.mongo_id;
    }
}