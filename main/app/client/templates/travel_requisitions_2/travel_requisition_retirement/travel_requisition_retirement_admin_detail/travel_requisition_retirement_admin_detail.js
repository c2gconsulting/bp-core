
/*****************************************************************************/
/* TravelRequisitionRetirement2AdminDetail: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.TravelRequisitionRetirement2AdminDetail.events({

    "change .selectFields": _.throttle(function(e, tmpl) {
        const fieldName = $(e.target).attr('name');
        let inputVal = $(e.target).val().trim();
        const customConfig = tmpl.travelRequisitionCustomConfig.get();
        customConfig[fieldName] = inputVal
        tmpl.travelRequisitionCustomConfig.set(customConfig)
    }),

    'click #requisition-edit': function(e, tmpl) {
        const isEdittableFields = Template.instance().isEdittableFields.get()
        if (isEdittableFields) {
            const customConfig = tmpl.travelRequisitionCustomConfig.get();
            let currentTravelRequest = tmpl.currentTravelRequest.curValue;

            if (currentTravelRequest.retirementStatus === customConfig.retirementStatus) {
                // console.log()
                delete currentTravelRequest.retirementStatus
            }

            currentTravelRequest = {
                ...currentTravelRequest,
                ...customConfig,
            }

            Meteor.call('TravelRequest2/editTravelRetirement', currentTravelRequest, (err, res) => {
                if (res){
                    swal({
                        title: "Travel requisition created",
                        text: "Travel request has been updated",
                        confirmButtonClass: "btn-success",
                        type: "success",
                        confirmButtonText: "OK"
                    });
                } else {
                    swal({
                        title: "Oops!",
                        text: "Travel request could not be updated, reason: " + err.message,
                        confirmButtonClass: "btn-danger",
                        type: "error",
                        confirmButtonText: "OK"
                    });
                    console.log(err);
                }

            });
            Template.instance().errorMessage.set(null);
            Modal.hide('TravelRequisitionRetirement2AdminDetail');
        }
        Template.instance().isEdittableFields.set(!isEdittableFields)
    },
    'change ': function(e, tmpl) {
        e.preventDefault()
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;

        currentTravelRequest.actualTotalTripDuration = parseFloat(($("#actualTotalTripDuration").val()).replace(',',''));
        currentTravelRequest.actualTotalTripDuration = isNaN(currentTravelRequest.actualTotalTripDuration)?0:currentTravelRequest.actualTotalTripDuration;

        currentTravelRequest.actualTotalEmployeePerdiemNGN = parseFloat(($("#actualTotalEmployeePerdiemNGN").val()).replace(',',''));
        currentTravelRequest.actualTotalEmployeePerdiemNGN = isNaN(currentTravelRequest.actualTotalEmployeePerdiemNGN)?0:currentTravelRequest.actualTotalEmployeePerdiemNGN;

        currentTravelRequest.actualTotalEmployeePerdiemUSD = parseFloat(($("#actualTotalEmployeePerdiemUSD").val()).replace(',',''));
        currentTravelRequest.actualTotalEmployeePerdiemUSD = isNaN(currentTravelRequest.actualTotalEmployeePerdiemUSD)?0:currentTravelRequest.actualTotalEmployeePerdiemUSD;

        currentTravelRequest.actualTotalAirportTaxiCostNGN = parseFloat(($("#actualTotalAirportTaxiCostNGN").val()).replace(',',''));
        currentTravelRequest.actualTotalAirportTaxiCostNGN = isNaN(currentTravelRequest.actualTotalAirportTaxiCostNGN)?0:currentTravelRequest.actualTotalAirportTaxiCostNGN;

        currentTravelRequest.actualTotalGroundTransportCostNGN = parseFloat(($("#actualTotalGroundTransportCostNGN").val()).replace(',',''));
        currentTravelRequest.actualTotalGroundTransportCostNGN = isNaN(currentTravelRequest.actualTotalGroundTransportCostNGN)?0:currentTravelRequest.actualTotalGroundTransportCostNGN;

        currentTravelRequest.actualTotalMiscCostNGN = parseFloat(($("#actualTotalMiscCostNGN").val()).replace(',',''));
        currentTravelRequest.actualTotalMiscCostNGN = isNaN(currentTravelRequest.actualTotalMiscCostNGN)?0:currentTravelRequest.actualTotalMiscCostNGN;

        currentTravelRequest.actualTotalAirportTaxiCostUSD = parseFloat(($("#actualTotalAirportTaxiCostUSD").val()).replace(',',''));
        currentTravelRequest.actualTotalAirportTaxiCostUSD = isNaN(currentTravelRequest.actualTotalAirportTaxiCostUSD)?0:currentTravelRequest.actualTotalAirportTaxiCostUSD;

        currentTravelRequest.actualTotalGroundTransportCostUSD = parseFloat(($("#actualTotalGroundTransportCostUSD").val()).replace(',',''));
        currentTravelRequest.actualTotalGroundTransportCostUSD = isNaN(currentTravelRequest.actualTotalGroundTransportCostUSD)?0:currentTravelRequest.actualTotalGroundTransportCostUSD;

        currentTravelRequest.actualTotalMiscCostUSD = parseFloat(($("#actualTotalMiscCostUSD").val()).replace(',',''));
        currentTravelRequest.actualTotalMiscCostUSD = isNaN(currentTravelRequest.actualTotalMiscCostUSD)?0:currentTravelRequest.actualTotalMiscCostUSD;

        currentTravelRequest.actualTotalAncilliaryCostNGN = currentTravelRequest.actualTotalEmployeePerdiemNGN + currentTravelRequest.actualTotalAirportTaxiCostNGN + currentTravelRequest.actualTotalGroundTransportCostNGN + currentTravelRequest.actualTotalMiscCostNGN;
        currentTravelRequest.actualTotalAncilliaryCostUSD = currentTravelRequest.actualTotalEmployeePerdiemUSD + currentTravelRequest.actualTotalAirportTaxiCostUSD + currentTravelRequest.actualTotalGroundTransportCostUSD + currentTravelRequest.actualTotalMiscCostUSD;
        currentTravelRequest.additionalRetirementComment = $("#additionalRetirementComment").val();
        currentTravelRequest.tripReport = $("#tripReport").val();


        tmpl.currentTravelRequest.set(currentTravelRequest);
    },
    'click #new-retirement-create': function(e, tmpl) {
        e.preventDefault()
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        currentTravelRequest.retirementStatus = "Retirement Submitted";
        Meteor.call('TRIPREQUEST/retire', currentTravelRequest, (err, res) => {
            if (res){
                swal({
                    title: "Trip Retirement Updated",
                    text: "Your trip requirement has been made, a notification has been sent to your supervisor",
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
            } else {
                swal({
                    title: "Oops!",
                    text: "Your trip requirement could not be created, reason: " + err.message,
                    confirmButtonClass: "btn-danger",
                    type: "error",
                    confirmButtonText: "OK"
                });
                console.log(err);
            }
        });

    },
    'click #new-retirement-save-draft': function(e, tmpl) {
        e.preventDefault()
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        currentTravelRequest.retirementStatus = "Draft";
        Meteor.call('TravelRequest2/createDraft', currentTravelRequest, (err, res) => {
            if (res){
                swal({
                    title: "Trip Retirement Updated",
                    text: "Your trip requirement draft has been saved",
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
            } else {
                swal({
                    title: "Oops!",
                    text: "Your trip requirement could not be saved, reason: " + err.message,
                    confirmButtonClass: "btn-danger",
                    type: "error",
                    confirmButtonText: "OK"
                });
                console.log(err);
            }
        });

    },

    'change input[type="file"]' ( event, template ) {
      Modules.client.uploadToAmazonS3( { event: event, template: template } );
    }
});


Template.registerHelper('formatDate', function(date) {
    return moment(date).format('DD-MM-YYYY');
});

/*****************************************************************************/
/* TravelRequisitionRetirement2AdminDetail: Helpers */
/*****************************************************************************/
Template.TravelRequisitionRetirement2AdminDetail.helpers({
    ACTIVITY: () => 'activityId',
    COSTCENTER: () => 'costCenter',
    PROJECT_AND_DEPARTMENT: () => 'departmentOrProjectId',
    costCenters: () => Core.Travel.costCenters,
    carOptions: () => Core.Travel.carOptions,
    currentDepartment: () => Template.instance().currentDepartment.get(),
    currentProject: () =>Template.instance().currentProject.get(),
    currentActivity: () => Template.instance().currentActivity.get(),
    isEmergencyTrip () {
        // let index = this.tripIndex - 1;
        const currentTravelRequest = Template.instance().currentTravelRequest.get();

        const minDate = new Date(moment(new Date()).add(5, 'day').format());
        const isEmergencyTrip = currentTravelRequest.isEmergencyTrip;

        return isEmergencyTrip ? new Date() : minDate;
    },
    costCenterType: function (item) {
      const currentTravelRequest = Template.instance().currentTravelRequest.get();
      if (currentTravelRequest && currentTravelRequest.costCenter === item) return item
      return false
    },
    selected(context,val) {
        let self = this;
        const { currentTravelRequest } = Template.instance();

        if(currentTravelRequest){
            //get value of the option element
            //check and return selected if the template instce of data.context == self._id matches
            if(val){
                return currentTravelRequest[context] === val ? selected="selected" : '';
            }
            return currentTravelRequest[context] === self._id ? selected="selected" : '';
        }
    },
    checkbox(isChecked){
        console.log('isChecked', isChecked)
        return isChecked ? checked="checked" : checked="";
    },
    'isEdittableFields': function() {
        return Template.instance().isEdittableFields.get()
    },
    'getStatusColor': function() {
        return Template.instance().isEdittableFields.get() ? 'primary' : 'warning'
    },
    travelApprovals: function () {
        let isAirTransportationMode = false;
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        
        const { trips, destinationType } = currentTravelRequest;
        const isInternationalTrip = destinationType === 'International';
        for (let i = 0; i < trips.length; i++) {
            const { transportationMode } = trips[i];
            if (transportationMode == 'AIR') isAirTransportationMode = true
        }

        const shouldGotoLogisicsFirst = (!isAirTransportationMode && !isInternationalTrip);

        const { supervisorId, managerId, budgetHolderId, gcooId, gceoId, logisticsId, bstId, financeApproverId } = currentTravelRequest;
        const { HOD, BUDGETHOLDER, MD, GCOO, GCEO, BST, LOGISTICS, FINANCE } = Core.Approvals

        const LOGISTICS_LABEL = { approvalId: logisticsId, label: LOGISTICS, id: 'logisticsId' };
        const BST_LABEL = { approvalId: bstId, label: BST, id: 'bstId' };

        const NEXT_APPROVAL_LABEL = shouldGotoLogisicsFirst ? LOGISTICS_LABEL : BST_LABEL;
        const SECOND_NEXT_APPROVAL_LABEL = shouldGotoLogisicsFirst ? BST_LABEL : LOGISTICS_LABEL;

        const dApprovals = [
            { approvalId: budgetHolderId, label: BUDGETHOLDER, id: 'budgetHolderId' },
            { approvalId: supervisorId, label: HOD, id: 'supervisorId' },
            NEXT_APPROVAL_LABEL,
            SECOND_NEXT_APPROVAL_LABEL,
            { approvalId: financeApproverId, label: FINANCE, id: 'financeApproverId' },
            // { approvalId: bstId, label: BST },
            // { approvalId: logisticsId, label: LOGISTICS },
        ]
        return dApprovals;
    },
    setApprovalUser(val, label) {
        return val ? (Meteor.users.findOne({_id: val})).profile.fullName : label || 'Select Employee to Approve'
    },
    'getStatusText': function() {
        return Template.instance().isEdittableFields.get() ? 'Save' : 'Edit'
    },
    'employees': () => {
        return  Meteor.users.find({"employee": true});
    },
    'getBudgetCodeName': function(budgetCodeId) {
        const budget = Budgets.findOne({_id: budgetCodeId})

        if(budget) {
            return budget.name
        } else {
            return 'Budget Code'
        }
    },
    allowedStatus() {
        return ["Not Retired","Draft","Retirement Submitted","Retirement Approved By HOD", "Retirement Rejected By HOD","Retirement Approved Finance","Retirement Rejected Finance"]
    },
    setDefaultStatus(val) {
        return val || 'Status'
    },
    setDefaultSupervisor(val) {
        return val ? (Meteor.users.findOne({_id: val})).profile.fullName : 'Supervisor'
    },
    setDefaultBudgetHolder(val) {
        return val ? (Meteor.users.findOne({_id: val})).profile.fullName : 'Budget Holder'
    },
     'isUnretiredTrips': function() {
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest) {
            return currentTravelRequest.retirementStatus === "Not Retired"

        }
     },
     'isRejectedTrips': function() {
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest) {
            return currentTravelRequest.retirementStatus === "Retirement Rejected By HOD"

        }
     },
     'isDraft': function() {
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest) {
            return currentTravelRequest.retirementStatus === "Draft"

        }
     },


    checkWhoToRefund(currency){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        let formatNumber = function(numberVariable, n, x) {
            var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
            return numberVariable.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
        }

        if (currency === "USD"){
            let usdDifference = currentTravelRequest.totalAncilliaryCostUSD - currentTravelRequest.actualTotalAncilliaryCostUSD;
            if (currentTravelRequest.cashAdvanceNotRequired){
                usdDifference = -1 * currentTravelRequest.actualTotalAncilliaryCostUSD;
            }
            if (usdDifference > 0){
                // return "Employee to refund " + formatNumber(usdDifference,2) + " USD";
                return "Company to refund " + formatNumber(usdDifference,2) + " USD";
            }else if (usdDifference < 0){
                return "Company to refund " + formatNumber((-1 * usdDifference),2) + " USD";
            }else{
                return "No USD refunds"
            }
        }else if (currency === "NGN"){
            let ngnDifference = currentTravelRequest.totalAncilliaryCostNGN - currentTravelRequest.actualTotalAncilliaryCostNGN;
            if (currentTravelRequest.cashAdvanceNotRequired){
                ngnDifference = -1 * currentTravelRequest.actualTotalAncilliaryCostNGN;
            }
            if (ngnDifference > 0){
                // return "Employee to refund " + formatNumber(ngnDifference,2) + " NGN";
                return "Company to refund " + formatNumber(ngnDifference,2) + " NGN";
            }else if (ngnDifference < 0){
                return "Company to refund " + formatNumber((-1 * ngnDifference),2) + " NGN";
            }else{
                return "No NGN refunds"
            }
        }
    },
    travelTypeChecked(val){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && val){
            return currentTravelRequest.type === val ? checked="checked" : '';
        }
    },
    destinationTypeChecked(val){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && val){
            return currentTravelRequest.destinationType === val ? checked="checked" : '';
        }
    },
    isReturnTrip(){
        return Template.instance().currentTravelRequest.get().type === "Return";
    },
    isCarModeOfTransport(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();

        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].transportationMode === "CAR"? '':'none';
        }
    },
    isAirModeOfTransport(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();

        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].transportationMode === "AIR"? '':'none';
        }
    },
    'getEmployeeNameById': function(employeeId){
        return (Meteor.users.findOne({_id: employeeId})).profile.fullName;
    },

    isBreakfastIncluded(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].isBreakfastIncluded? checked="checked" : '';
        }
    },
    provideAirportPickup(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].provideAirportPickup? checked="checked" : '';
        }
    },
    provideGroundTransport(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].provideGroundTransport? checked="checked" : '';
        }
    },
    isLunchIncluded(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].isLunchIncluded? checked="checked" : '';
        }
    },
    isDinnerIncluded(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].isDinnerIncluded? checked="checked" : '';
        }
    },
    isIncidentalsIncluded(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].isIncidentalsIncluded? checked="checked" : '';
        }
    },
    isLastLeg(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index && currentTravelRequest.type ==="Multiple"){
            // return parseInt(index) >= currentTravelRequest.trips.length;
            return parseInt(index) >= currentTravelRequest.trips.length + 1;
        }
    },
    'getTravelcityName': function(travelcityId) {
        const travelcity = Travelcities.findOne({_id: travelcityId})

        if(travelcity) {
            return travelcity.name
        } 
        return travelcityId
    },
    'getHotelName': function(hotelId) {
        const hotel = Hotels.findOne({_id: hotelId})

        if(hotel) {
            return hotel.name
        }
        return hotelId || 'I do not need a Hotel'
    },
    'getAirlineName': function(airlineId) {
        const airline = Airlines.findOne({_id: airlineId})

        if(airline) {
            return airline.name
        } else {
            if (airlineId === 'third_party_agent_flight') return 'A third party will cater for my flight'
            if (airlineId === 'company_will_process_flight') return 'Oilserv will cater for my flight'
        }
    },
    'getBudgetName': function(budgetCodeId) {
        const budget = Budgets.findOne({_id: budgetCodeId})

        if(budget) {
            return budget.name
        }
    },
    'currentTravelRequest': function() {
        return Template.instance().currentTravelRequest.get()
    },
    attachments: function () {
        // Meteor.Attachment.find({ })
        console.log('instance()', Template.instance())
        console.log('Template.instance()()', Template.instance().data)
        const requisitionId = Template.instance().currentTravelRequest.get()._id
        console.log('requisitionId', requisitionId)
        const attachments = Attachments.find({ travelId: requisitionId })
        console.log('attachments', attachments)
        return attachments;
    },
    getAttachmentName: function (data) {
        return data.name || data.fileUrl || data.imageUrl
    },

    getAttachmentUrl: function (data) {
        return data.fileUrl || data.imageUrl
    },
    getCreatedByFullName: (requisition) => {
        const userId = requisition.createdBy

        const user = Meteor.users.findOne(userId)
        return user ? user.profile.fullName : '...'
    },
    cashAdvanceNotRequiredChecked(){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest){
            return currentTravelRequest.cashAdvanceNotRequired? checked="checked" : '';
        }
    },
    'isInEditMode': function() {
        return Template.instance().isInEditMode.get()
    },
    'isInApproveMode': function() {
        return Template.instance().isInApproveMode.get()
    },
    'isInApproverEditMode': function() {
        return Template.instance().isInApproverEditMode.get()
    },
    'isInTreatMode': function() {
        return Template.instance().isInTreatMode.get()
    },
    'isInRetireMode': function() {
        return Template.instance().isInTreatMode.get()
    },
    'getUnitName': function(unitId) {
        if(unitId) {
            console.log(`unit id: `, unitId)
            return EntityObjects.findOne({_id: unitId}).name
        }
    },

    'getHumanReadableApprovalState': function(boolean) {
        return boolean ? "Approved" : "Rejected"
    },
    'or': (a, b) => {
        return a || b
    },
    'isEqual': (a, b) => {
        return a === b;
    },
    'totalTripCostNGN': function() {
        return Template.instance().totalTripCostNGN.get()
    },
    'getPrintUrl': function(currentTravelRequest) {
        if(currentTravelRequest) {
            return Meteor.absoluteUrl() + 'business/' + currentTravelRequest.businessId + '/travelrequests2/printretirement?requisitionId=' + currentTravelRequest._id
        }
    }
});

/*****************************************************************************/
/* TravelRequisitionRetirement2AdminDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.TravelRequisitionRetirement2AdminDetail.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context');
    self.subscribe("travelcities", Session.get('context'));
    self.subscribe("hotels", Session.get('context'));
    self.subscribe("airlines", Session.get('context'));
    self.subscribe("budgets", Session.get('context'));
    self.subscribe("attachments", Session.get('context'));




    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null);
    self.isEdittableFields = new ReactiveVar();
    self.isEdittableFields.set(false)
    self.travelRequisitionCustomConfig = new ReactiveVar();
    self.travelRequisitionCustomConfig.set({})
    self.currentTravelRequest = new ReactiveVar()
    self.isInEditMode = new ReactiveVar()
    self.isInViewMode = new ReactiveVar()
    self.isInApproveMode = new ReactiveVar()
    self.isInApproverEditMode = new ReactiveVar()
    self.isInTreatMode = new ReactiveVar()
    self.isInRetireMode = new ReactiveVar()
    self.attachments = new ReactiveVar()

    self.currentDepartment = new ReactiveVar()
    self.currentProject = new ReactiveVar()
    self.currentActivity = new ReactiveVar()

    self.businessUnitCustomConfig = new ReactiveVar()

    let invokeReason = self.data;

    // self.totalTripCost = new ReactiveVar(0)
    self.amountNonPaybelToEmp = new ReactiveVar(0)
    self.amoutPayableToEmp = new ReactiveVar(0)
    self.totalTripCost = new ReactiveVar(0)

    if(invokeReason.reason === 'edit') {
        self.isInEditMode.set(true)
    }
    if(invokeReason.reason === 'approve') {
        self.isInApproveMode.set(true)
    }
    if(invokeReason.reason === 'treat') {
        self.isInTreatMode.set(true)
    }
    if(invokeReason.reason === 'retire') {
        self.isInRetireMode.set(true)
    }

    self.businessUnitLogoUrl = new ReactiveVar()

    self.autorun(function() {

        Meteor.call('BusinessUnitCustomConfig/getConfig', businessUnitId, function(err, customConfig) {
            if(!err) {
                self.businessUnitCustomConfig.set(customConfig)
            }
        })

        let businessUnitSubscription = self.subscribe("BusinessUnit", businessUnitId)
        let travelRequest2Sub = self.subscribe('TravelRequest2', invokeReason.requisitionId)


        if(travelRequest2Sub.ready()) {

            let travelRequestDetails = TravelRequisition2s.findOne({_id: invokeReason.requisitionId})
            self.currentTravelRequest.set(travelRequestDetails)


            Core.defaultDepartmentAndProject(self, travelRequestDetails)
        }

        if(businessUnitSubscription.ready()) {
            let businessUnit = BusinessUnits.findOne({_id: businessUnitId})
            self.businessUnitLogoUrl.set(businessUnit.logoUrl)
        }
    })


});

Template.TravelRequisitionRetirement2AdminDetail.onRendered(function () {
    $('select.dropdown').dropdown();
    let self = this

    let currentTravelRequest = self.currentTravelRequest.get()
    if(currentTravelRequest) {
        if(currentTravelRequest.status !== 'Draft' && currentTravelRequest.status !== 'Pending') {
            if(self.isInEditMode.get()) {
                Modal.hide();
                swal('Error', "Sorry, you can't edit this travel request. ", 'error')
            }
        } else if(currentTravelRequest.status === 'Pending') {
            self.isInViewMode.set(true)
        } else if(currentTravelRequest.status === 'Approve') {
            if(self.isInEditMode.get()) {
                swal('Error', "Sorry, you can't edit this travel request. It has been approved", 'error')
            }
        }
    }
});

Template.TravelRequisitionRetirement2AdminDetail.onDestroyed(function () {
});
