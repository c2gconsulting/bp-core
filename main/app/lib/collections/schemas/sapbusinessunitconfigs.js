

Core.Schemas.SapUnitConfig = new SimpleSchema({
    unitId : {
        type: String
    },
    costCenterCode : {
        type: String,
        optional: true
    }
});
Core.Schemas.SapProjectConfig = new SimpleSchema({
    projectId : {
        type: String
    },
    projectCode : {
        type: String,
        optional: true
    }
});
Core.Schemas.SapPayTypeConfig = new SimpleSchema({
    payTypeId : {
        type: String
    },
    payTypeDebitAccountCode : {
        type: String,
        optional: true
    },
    payTypeCreditAccountCode : {
        type: String,
        optional: true
    }
});

/**
 * SapBusinessUnitConfig Schema
 */
Core.Schemas.SapBusinessUnitConfig = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    businessUnitId: {
        type: String
    },
    sapCompanyDatabaseName : {
        type: String,
        optional: true
    },
    ipAddress : {
        type: String,
        optional: true
    },
    protocol: {
        type: String,
        optional: true
    },
    units: {
        type: [Core.Schemas.SapUnitConfig],
        optional: true
    },
    projects: {
        type: [Core.Schemas.SapProjectConfig],
        optional: true
    },
    payTypes: {
        type: [Core.Schemas.SapPayTypeConfig],
        optional: true
    },
    createdAt: {
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
    }
});