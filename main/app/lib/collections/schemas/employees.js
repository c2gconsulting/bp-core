
/**
 * Order Types Schema
 */
Core.Schemas.Employee = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    address: {
        type: String
    },
    businessId: {
        type: String
    },
    businessUnitId: {
        type: String
    },
    payGrade: {
        type: Object,
        defaultValue: {}
    },
    taxRule: {
        type: Object,
        defaultValue: {}
    },
    pensionRule: {
        type: Object,
        defaultValue: {}
    },
    loans: {
        type: Object,
        defaultValue: []
    },
    expenses: {
        type: Object,
        defaultValue: []
    },
    city: {
        type: String
    },
    confirmationDate: {
        type: Date
    },
    customPayTypes: {
        type: Object,
        defaultValue: {}
    },
    dateOfBirth: {
        type: Date
    },
    departmentId: {
        type: String
    },
    divisionId: {
        type: String
    },
    profilePictures: {
        type: [Object]
    },
    currentProfilePicture: {
        type: String
        //as placeholder
    },
    editablePayTypes: {
        type: Object
    },
    email: {
        type: String
    },
    employeeNumber: {
        type: Number,
        index: 1,
        autoValue: Core.schemaEmployeeNextSeqNumber,
        optional: true, // to enable pre-validation
        denyUpdate: true
    },
    employmentDate: {
        type: Date
    },
    exemptedPayTypes: {
        type: Object
    },
    firstName: {
        type: String
    },
    gender: {
        type: String
    },
    leaveDaysTaken: {
        type: Number,
        defaultValue: 0
    },
    guarantor: {
        type: Object
    },
    lastName: {
        type: String
    },
    maritalStatus: {
        type: String
    },
    otherNames: {
        type: String
    },
    payGradeId: {
        type: String
    },
    payGroupId: {
        type: String
    },
    selfService: {
        type: String,
        defaultValue: 'Active'
    },
    paymentDetails: {
        type: Object
    },
    phone: {
        type: String
    },
    positions: {
        type: Array,
        optional: true

    },
    'positions.$': {   //[{positionId: 1, percentage: 50}]
        type: Object,
        blackbox: true
    },
    state: {
        type: String
    },
    location: {
        type: String
    },
    status: {
        type: String,
        defaultValue: 'Active'
    },
    terminationDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        defaultValue: Date.now
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
      denyUpdate: true
    }
});
