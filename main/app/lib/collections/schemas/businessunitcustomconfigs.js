/**
 * Created by eariaroo on 4/24/17.
 */

/**
 * BusinessUnitCustomConfig Schema
 */
Core.Schemas.BusinessUnitCustomConfig = new SimpleSchema({
    _id: {
        type: String
    },
    businessId: {
        type: String
    },
    payGradeLabel: {
        type: String
    },
    payGradeLabelPlural: {
        type: String
    },
    isSuccessFactorsIntegrationEnabled: {
        type: Boolean
    },
    isSapBusinessOneIntegrationEnabled: {
        type: Boolean
    },
    isSapHanaIntegrationEnabled: {
        type: Boolean
    },
    isHourLeaveRequestsEnabled: {
        type: Boolean
    },
    isProcurementRequisitionActive: {
        type: Boolean
    },
    isTravelRequisitionActive: {
        type: Boolean
    },
    isLeaveRequestActive: {
        type: Boolean
    },
    isTimeWritingActive: {
        type: Boolean
    },
    isTimeWritingReportsActive: {
        type: Boolean,
        optional: true
    },

    procurementRequisitionApprovalConfig: {
        type: Object
    },
    isTwoStepApprovalEnabled: {
        type: Boolean
    },
    leaveDaysAccrual: {
        type: String // 'FixedLeaveEntitlement' or 'NumberOfDaysWorked'
    },
    checkEmployeeResumptionForPayroll: {
        type: Boolean
    },
    isWeekendIncludedInLeaveRequests: {
        type: Boolean
    },
    isTimeTypeEnabled: {
        type: Boolean,
        optional: true
    },
    isHmoSetupEnabled: {
        type: Boolean,
        optional: true
    },
    isLoanEnabled: {
        type: Boolean,
        optional: true
    },
    baseColor: {
        type: String,
        optional: true
    },
    displayLogoInSideBar: {
        type: Boolean,
        optional: true
    },
    isEmployeePersonalDataEditableByEmployee: {
        type: Boolean,
        optional: true
    },
    extraPersonalDataEmployeeProfileFieldsSupported: {
        type: [String],
        optional: true
    },
    isRelieverEnabledForLeaveRequests: {
        type: Boolean,
        optional: true
    },
    isEmployeePromotionEnabled: {
        type: Boolean,
        optional: true
    },
    isWeekendTimeWritingEnabled: {
        type: Boolean,
        optional: true
    },
    isOvertimeEnabled: {
        type: Boolean,
        optional: false
    },
    maxHoursInDayForTimeWriting: {
        type: Number
    },
    maxHoursInDayForTimeWritingPerLocationEnabled: {
        type: Boolean,
        optional: false
    },
    directEmployeeManagerEnabled: {
        type: Boolean,
        optional: true
    },

    isActive: {
        type: Boolean
    },
    _groupId: {
        type: String
    },
    // fields, costs, allowDatesInPast, isCurrencyEnabled, allowedCurrencies,
    // isNumberOfDaysEnabled, isCostCenterEnabled
    travelRequestConfig: {
        type: Object,
        optional: true,
        blackbox: true
    },
    paymentHeadersForPayslip: {// bank: true, accountNumber: true
        type: Object,
        optional: true,
        blackbox: true
    },
    notifyEmployeesOnPayrollApproval: {
        type: Boolean
    },
    skipCompanyListPageOnLogin: {
        type: Boolean,
        optional: true,
    },
    onLoginFirstBlazeTemplate: {
        type: String,
        optional: true,
    },
    showPayrunExportButtonWithProjects: {
        type: Boolean,
        optional: true
    },
    showResetPasswordButton: {
        type: Boolean,
        optional: true
    },
    hsdfTimeSheetReportEnabled: {
        type: Boolean,
        optional: true,
        defaultValue: false
    },
    isAdvancedTravelEnabled: {
        type: Boolean,
        optional: true,
        defaultValue: false
    },

    isTravelBudgetsEnabled: {
        type: Boolean,
        optional: true,
        defaultValue: false
    },

    isTravelCitiesEnabled: {
        type: Boolean,
        optional: true,
        defaultValue: false
    },

    isAirlinesEnabled: {
        type: Boolean,
        optional: true,
        defaultValue: false
    },

    isAHotelsEnabled: {
        type: Boolean,
        optional: true,
        defaultValue: false
    },

    isFlightRoutesEnabled: {
        type: Boolean,
        optional: true,
        defaultValue: false
    },

    isEmailSettingsEnabled: {
        type: Boolean,
        optional: true,
        defaultValue: false
    },

    "payrun": {
        label: "Payrun",
        optional: true,
        type: Object
    },
    'payrun.startFromPrevMonth': {
        type: Boolean
    },
    'payrun.monthStartDay': {
        type: Number
    },
    'payrun.monthEndDay': {
        type: Number
    },
    'payrun.isMinimumTimeWorkedForPayrollEnabled': {
        type: Boolean
    },
    'payrun.isProjectsPayrollForDeltatekEngineeringEnabled': {
        type: Boolean
    },
    'payrun.fullPayOnTimeRecorded': {
        type: Boolean
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
