/**
 * CustomEmailSettings Schema
 */

Core.Schemas.CustomEmailSettings = new SimpleSchema({
    username: {
        type: String,
        optional: true
    },
    password: {
        type: String,
        optional: true
    },
    host: {
        type: String,
        optional: true
    },
    port: {
        type: Number,
        allowedValues: [25, 587, 465, 475, 2525],
        optional: true
    }
});

/**
 * Metafield Schema
 */

Core.Schemas.Metafield = new SimpleSchema({
    _id: {
        type: String,
        autoValue: Core.schemaIdAutoValue,
        optional: true
    },
    key: {
        type: String,
        max: 30,
        optional: true
    },
    namespace: {
        type: String,
        max: 20,
        optional: true
    },
    scope: {
        type: String,
        optional: true
    },
    value: {
        type: String,
        optional: true
    },
    valueType: {
        type: String,
        optional: true
    },
    description: {
        type: String,
        optional: true
    }
});


/**
 * Locale Schema
 */

Core.Schemas.Locale = new SimpleSchema({
    continents: {
        type: Object,
        blackbox: true
    },
    countries: {
        type: Object,
        blackbox: true
    }
});

/**
 * Tenants Schema
 */

Core.Schemas.Tenant = new SimpleSchema({
    "_id": {
        type: String,
        optional: true
    },
    "status": {
        type: String,
        defaultValue: "active",
        optional: true
    },
    "name": {
        type: String,
        index: 1,
        unique: true
    },
    "description": {
        type: String,
        optional: true
    },
    "keywords": {
        type: String,
        optional: true
    },
    "addressBook": {
        type: Array,
        optional: true
    },
    "addressBook.$": {
        type: Object,
        optional: true
    },
    "addressBook.$.address1": {
        type: String,
        optional: true
    },
    "industry": {
        type: String,
        optional: true
    },
    "domains": {
        type: [String],
        unique: true,
        index: 1,
        optional: true
        //autoValue: function(){return [this.field('name')]}
    },
    "emails": {
        type: [Core.Schemas.Email],
        optional: true
    },
    "country": {
        type: String
    },
    "baseCurrency": {
        label: "Base Currency",
        optional: true,
        type: Object,
        autoValue: function () {
            if (this.isInsert && Meteor.isServer) {
                let country = this.field('country');
                if (!this.isSet && country.isSet) {
                    let locales = EJSON.parse(Assets.getText("settings/locales.json"));
                    let currency = {};
                    if (locales.countries[country.value]) {
                        currency.iso = locales.countries[country.value].currency;

                        let currencies = EJSON.parse(Assets.getText("settings/currencies.json"));
                        currency.symbol = currencies[currency.iso] ? currencies[currency.iso].symbol : '';
                        return currency;
                    }
                }
            }
        }
    },
    "baseCurrency.iso": {
        type: String,
        optional: true
    },
    "baseCurrency.symbol": {
        type: String,
        optional: true
    },
    "currencies": {
        type: [String],
        optional: true
    },
    "locale": {
        type: String,
        defaultValue: "en",
        optional: true
    },
    "public": {
        type: String,
        optional: true
    },
    "timezone": {
        type: String,
        optional: true
    },
    "baseUOM": {
        type: String,
        optional: true,
        defaultValue: "OZ",
        label: "Base Unit of Measure"
    },
    "metafields": {
        type: [Core.Schemas.Metafield],
        optional: true
    },
    "defaultRoles": {
        type: [String],
        defaultValue: ["business/manage", "employee/view"],
        optional: true
    },
    "layout": {
        type: [Object],
        optional: true
    },
    "layout.$.layout": {
        type: String,
        defaultValue: "ApplicationLayout",
        optional: true
    },
    "layout.$.theme": {
        type: String,
        defaultValue: "default",
        optional: true
    },
    "layout.$.workflow": {
        type: String,
        optional: true
    },
    "layout.$.collection": {
        type: String,
        optional: true
    },
    "layout.$.enabled": {
        type: Boolean,
        defaultValue: true,
        optional: true
    },
    "settings": {
        type: Object,
        optional: true
    },
    "settings.rounding": {
        type: Object,
        optional: true,
        blackbox: true
    },
    "adminEmail": {
        type: String,
        regEx: SimpleSchema.RegEx.Email,
        optional: true
    },
    "createdAt": {
        type: Date,
        autoValue: function () {
            if (this.isInsert) {
                return new Date;
            } else if (this.isUpsert) {
                return {
                    $setOnInsert: new Date
                };
            }
        },
        denyUpdate: true,
        optional: true
    },
    "updatedAt": {
        type: Date,
        autoValue: function () {
            if (this.isUpdate) {
                return new Date;
            }
        },
        optional: true
    }
});