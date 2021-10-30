/*****************************************************************************/
/* TravelRequisition2Index: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.TravelRequisition2Index.events({
    'click #createTravelRequisition  ': function(e, tmpl) {
        e.preventDefault()
        Modal.show('TravelRequisition2Create')
    },
    'click .edit-requisitionRow': function(e, tmpl) {
        e.preventDefault()
        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')

        let invokeReason = {}
        invokeReason.requisitionId = requisitionId
        invokeReason.reason = 'edit'
        invokeReason.approverId = null

        const status = $("#status_" + requisitionId).html();


      //explicitely set status
      let currentStatus = "Pending";
      let currentPosition = 'HOD'

      if (tmpl.isHOD.curValue) {
        currentPosition = 'HOD';
        currentStatus = 'Approved By HOD'
      }

      if (tmpl.isDirectManager.curValue) {
        currentPosition = 'MANAGER';
        currentStatus = 'Approved By MD'
      }

      if (tmpl.isGcoo.curValue) {
        currentPosition = "GCOO";
        currentStatus = 'Approved By GCOO'
      }

      if (tmpl.isGceo.curValue) {
        currentPosition = "GCEO"
        currentStatus = 'Approved By GCEO'
      }

      console.log('currentStatus', currentStatus)
      console.log('status', status)


      if ((status === "Draft") || (status === "Pending") || (status === currentStatus) || (status === "Rejected By HOD") || (status === "Rejected By MD")){
            Modal.show('TravelRequisition2Create', invokeReason);
        } else if (!status.includes('Retire')) {
            Modal.show('TravelRequisition2ExtensionDetail', invokeReason);
        }
    },

    'click .view-requisitionRow': function(e, tmpl) {
        e.preventDefault()
        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')

        let invokeReason = {}
        invokeReason.requisitionId = requisitionId
        invokeReason.reason = 'edit'
        invokeReason.approverId = null

        const status = $("#status_" + requisitionId).html();




        Modal.show('TravelRequisition2Detail', invokeReason);

    },
    // 'click .requisitionRow': function(e, tmpl) {
    //     e.preventDefault()
    //     let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')

    //     let invokeReason = {}
    //     invokeReason.requisitionId = requisitionId
    //     invokeReason.reason = 'edit'
    //     invokeReason.approverId = null

    //     const status = $("#status_" + requisitionId).html();




    //     if ((status === "Draft") || (status === "Pending") || (status === "Rejected By HOD") || (status === "Rejected By MD")){
    //         Modal.show('TravelRequisition2Create', invokeReason);
    //     } else if (!status.includes('Retire')) {
    //         Modal.show('TravelRequisition2ExtensionDetail', invokeReason);
    //     } else{
    //         Modal.show('TravelRequisition2Detail', invokeReason);
    //     }

    // },
    'click .goToPage': function(e, tmpl) {
        let pageNum = e.currentTarget.getAttribute('data-pageNum')
        let pageNumAsInt = parseInt(pageNum)
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        let skip = limit * pageNumAsInt

        let newPageOfProcurements = Template.instance().getTravelRequestsICreated(skip)
        Template.instance().travelRequestsICreated.set(newPageOfProcurements)

        Template.instance().currentPage.set(pageNumAsInt)
    },
    'click .paginateLeft': function(e, tmpl) {

    },
    'click .paginateRight': function(e, tmpl) {

    }
});


Template.registerHelper('formatDate', function(date) {
    return moment(date).format('DD-MM-YYYY');
});

Template.registerHelper('repeat', function(max) {
    return _.range(max - 1); // undescore.js but every range impl would work
});

/*****************************************************************************/
/* TravelRequisition2Index: Helpers */
/*****************************************************************************/
Template.TravelRequisition2Index.helpers({
    'travelRequestsICreated': function() {
        return Template.instance().travelRequestsICreated.get()
    },
    getStatus: function (status, currentTravelRequest) {
        const lastApproval = "Approved By MD";
        const { trips } = currentTravelRequest;
        const departureDate = trips && trips[0].departureDate
        const returnDate = trips && trips[0].returnDate
        const hasStartedTrip = new Date() > new Date(departureDate);
        const hasEndedTrip = new Date() > new Date(returnDate);
        console.log('departureDate', departureDate)
        if (status === lastApproval && hasStartedTrip && !hasEndedTrip) {
            return 'Ongoing'
        } else if (status === lastApproval && hasStartedTrip && hasEndedTrip) {
            return 'Completed'
        }  else if (status.includes('Approved')) return 'Approved'
        return status
    },
    // 'hasUnretiredTrips': function() {

    //     let unretiredCount = TravelRequisition2s.find({
    //         $and : [
    //             { retirementStatus: "Not Retired"},
    //             { $or : [ { status : "Pending" }, { status : "Approved By HOD" }, { status : "Approved By MD"}] }
    //         ]}).count()
    //     console.log("Unretired Count: " + unretiredCount);
    //     if (unretiredCount > 0){
    //         return true;
    //     }else{
    //         return false;
    //     }

    // },
    'numberOfPages': function() {
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        let totalNum = TravelRequisition2s.find({createdBy: Meteor.userId()}).count()

        let result = Math.floor(totalNum/limit)
        var remainder = totalNum % limit;
        if (remainder > 0)
            result += 2;
        return result;
    },
    getCreatedByFullName: (requisition) => {
        const userId = requisition.createdBy

        const user = Meteor.users.findOne(userId)
        return user ? user.profile.fullName : '...'
    },
    'currentPage': function() {
        return Template.instance().currentPage.get()
    },

    'totalTripCostNGN': function(currentTravelRequest) {
        if(currentTravelRequest) {
            currentTravelRequest.totalTripCostNGN = totalTripCostNGN;

            return totalTripCostNGN;
        }
    },
    'getPrintUrl': function(currentTravelRequest) {
        if(currentTravelRequest) {
            return Meteor.absoluteUrl() + 'business/' + currentTravelRequest.businessId + '/travelrequests2/printrequisition?requisitionId=' + currentTravelRequest._id
        }
    }

});

/*****************************************************************************/
/* TravelRequisition2Index: Lifecycle Hooks */
/*****************************************************************************/
Template.TravelRequisition2Index.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context')

    self.NUMBER_PER_PAGE = new ReactiveVar(10);
    self.currentPage = new ReactiveVar(0);
    //--
    let customConfigSub = self.subscribe("BusinessUnitCustomConfig", businessUnitId, Core.getTenantId());
    self.travelRequestsICreated = new ReactiveVar()
    self.businessUnitCustomConfig = new ReactiveVar()

    self.currentUser = new ReactiveVar();
    self.isHOD = new ReactiveVar();
    self.isDirectManager = new ReactiveVar();
    self.isGceo = new ReactiveVar();
    self.isGcoo = new ReactiveVar();
    const currentUser = Meteor.user();
    self.currentUser.set(currentUser || {});


    Core.queryClient('account/isHod', Meteor.userId(), self.isHOD)
    Core.queryClient('account/isManager', Meteor.userId(), self.isDirectManager)
    Core.queryClient('account/gcoo', Meteor.userId(), self.isGcoo)
    Core.queryClient('account/gceo', Meteor.userId(), self.isGceo)


    self.totalTripCost = new ReactiveVar(0)

    self.getTravelRequestsICreated = function(skip) {
        let sortBy = "createdAt";
        let sortDirection = -1;

        let options = {};
        options.sort = {};
        options.sort[sortBy] = sortDirection;
        options.limit = self.NUMBER_PER_PAGE.get();
        options.skip = skip

        const individualTrip = { tripCategory: { $nin: ['GROUP', 'THIRD_PARTY_CLIENT'] } };
        return TravelRequisition2s.find({createdBy: Meteor.userId(), ...individualTrip }, options);
    }

    self.subscribe('getCostElement', businessUnitId)

    self.autorun(function() {
        let limit = self.NUMBER_PER_PAGE.get();
        let sortBy = "createdAt";
        let sortDirection =  -1;
        let sort = {};
        sort[sortBy] = sortDirection;

        let employeeProfile = Meteor.user().employeeProfile
        if(employeeProfile && employeeProfile.employment && employeeProfile.employment.position) {
            let userPositionId = employeeProfile.employment.position

            let positionSubscription = self.subscribe('getEntity', userPositionId)
        }

        let travelRequestsCreatedSub = self.subscribe('TravelRequestsICreated', businessUnitId, limit, sort)
        if(travelRequestsCreatedSub.ready()) {
            self.travelRequestsICreated.set(self.getTravelRequestsICreated(0))
        }
        //--
        if(customConfigSub.ready()) {
            const customConfig = BusinessUnitCustomConfigs.findOne({businessId: businessUnitId})
            self.businessUnitCustomConfig.set(customConfig)
        }
    })
});

Template.TravelRequisition2Index.onRendered(function () {
    $('select.dropdown').dropdown();
    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.TravelRequisition2Index.onDestroyed(function () {
});
