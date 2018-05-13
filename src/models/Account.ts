import {logger} from "../util/logger";

let validation = require('../../config/validation/account.json');

export class Account {
    public account_id: number = null;
    public account_profile_id: number = null;
    public age: number = null;
    public sex: string = null;
    public ip_address: string = null;
    public country_code: string = null;
    public country: string = null;
    public city: string = null;
    public time_zone: string = null;
    public loc: object = null;
    public accuracy_radius: number = null;
    public user_agent: string = null;
    public device_type: string = null;
    public device_model: string = null;
    public app_ver: string = null;
    public isp: string = null;
    public subscription_id: number = null;
    public created: Date = null;

    public constructor(account?: Account) {
        if (account) {
            this.copy(account);
        }
    }

    public fillData(jsonData: any) {
        Object.keys(jsonData).forEach((e) => {
            this.setParam(e, jsonData[e]);
        });

        this.created = new Date();
    }

    public setParam(key: string, value: any, checkExist: boolean = true): void {
        if (checkExist) {
            if (this[key] !== undefined)
                this[key] = value;
        } else {
            this[key] = value;
        }
    }

    public getIpAddress(): string {
        if (this.ip_address == "127.0.0.1")
            this.ip_address = "188.127.102.231";
        return this.ip_address;
    }

    public setGeoData(geoData: any): void {
        let tmpGeoData = {
            country_code: null,
            country: null,
            city: null,
            time_zone: null,
            loc: {lat: null, long: null},
            accuracy_radius: null
        };

        if (geoData) {
            if (geoData.hasOwnProperty('country')) {
                tmpGeoData.country_code = geoData.country.iso_code;
                tmpGeoData.country = geoData.country.names.en;
            }
            if (geoData.hasOwnProperty('city')) {
                tmpGeoData.city = geoData.city.names.en;
            }
            if (geoData.hasOwnProperty('location')) {
                tmpGeoData.accuracy_radius = geoData.location.accuracy_radius;
                tmpGeoData.time_zone = geoData.location.time_zone;
                tmpGeoData.loc.lat = geoData.location.latitude;
                tmpGeoData.loc.long = geoData.location.longitude;
            }
        }

        Object.keys(tmpGeoData).forEach((e) => {
            this.setParam(e, tmpGeoData[e]);
        });
    }

    public tryChangeType(index: string, type: any, defaultVal: any = null): void {
        if (type === 'number') {
            if (typeof (this[index]) === "string")
                this.stringToNumber(index);
            else
                this[index] = parseInt(this[index]);
        } else if (type === 'string') {
            this[index] = this[index].toString();
        } else if (type === 'boolean') {
            this.stringToBoolean(index);
        }
    }

    public stringToBoolean(index: string): boolean {
        switch (this[index].toLowerCase().trim()) {
            case "true":
            case "yes":
            case "1":
                return true;
            case "false":
            case "no":
            case "0":
            case null:
                return false;
            default:
                return Boolean(this[index]);
        }
    }

    public stringToNumber(index: string): number {
        switch (this[index].toLowerCase().trim()) {
            case "true":
            case "yes":
            case "1":
                return 1;
            case "false":
            case "no":
            case "0":
            case null:
                return 0;
            default:
                return Number(this[index]);
        }
    }

    public booleanToNumber(index): null | number {
        if (this[index] !== null) {
            if (typeof (this[index]) === "string") {
                switch (this[index].toLowerCase().trim()) {
                    case "true":
                    case "yes":
                    case "1":
                        return 1;
                    case "false":
                    case "no":
                    case "0":
                    case null:
                        return 0;
                    default:
                        return Number(this[index]);
                }
            }
            return Number(this[index]);
        }
    }

    public isValid(): boolean {
        let required = {};
        if (!this.isEmptyValidationObj(validation)) {
            Object.keys(validation).forEach((e) => {
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
            });
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

    public checkSex(): void {
        if (typeof (this.sex) === "string") {
            switch (this.sex.toLowerCase().trim()) {
                case "true":
                case "yes":
                case "1":
                case "m":
                case "male":
                    this.setParam('sex', 1);
                    break;
                case "false":
                case "no":
                case "0":
                case "f":
                case "female":
                case null:
                    this.setParam('sex', 0);
                    break;
                default:
                    this.setParam('sex', Number(this.sex));
            }
        } else if (typeof (this.sex) == "boolean") {
            if (Number(this.sex) == 1)
                this.setParam("sex", "m");
            else
                this.setParam("sex", "f");
        }
    }

    public isEmptyValidationObj(obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return false;
        }

        return JSON.stringify(obj) === JSON.stringify({});
    }

    public copy(acc) {
        this.account_id = acc.account_id;
        this.account_profile_id = acc.account_profile_id;
        this.age = acc.age;
        this.sex = acc.sex;
        this.ip_address = acc.ip_address;
        this.country_code = acc.country_code;
        this.country = acc.country;
        this.city = acc.city;
        this.time_zone = acc.time_zone;
        this.loc = acc.loc;
        this.accuracy_radius = acc.accuracy_radius;
        this.user_agent = acc.user_agent;
        this.device_type = acc.device_type;
        this.device_model = acc.device_model;
        this.app_ver = acc.app_ver;
        this.isp = acc.isp;
        this.subscription_id = acc.subscription_id;
        this.created = new Date();
    }
}

export class AccountServiceClass {
    public account: Account;
    public isValid: boolean = false;
    public uid: string;
}