/*****************************************************************************/
/* TravelRequisitionIndex: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.TravelRequisitionIndex.events({
    'click #createProcurementRequisition': function(e, tmpl) {
        e.preventDefault()
        Modal.show('TravelRequisitionCreate')
    },
    'click .requisitionRow': function(e, tmpl) {
        e.preventDefault()
        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')

        let invokeReason = {}
        invokeReason.requisitionId = requisitionId
        invokeReason.reason = 'edit'
        invokeReason.approverId = null

        Modal.show('TravelRequisitionDetail', invokeReason)
    },
    'click .goToPage': function(e, tmpl) {
        let pageNum = e.currentTarget.getAttribute('data-pageNum')
        let pageNumAsInt = parseInt(pageNum)
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        let skip = limit * pageNumAsInt

        let newPageOfProcurements = Template.instance().getTravelRequestsICreated1(skip)
        Template.instance().travelRequestsICreated1.set(newPageOfProcurements)

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
/* TravelRequisitionIndex: Helpers */
/*****************************************************************************/
Template.TravelRequisitionIndex.helpers({
    'travelRequestsICreated': function() {
        return Template.instance().travelRequestsICreated1.get()
    },
    'numberOfPages': function() {
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        let totalNum = TravelRequisitions.find({createdBy: Meteor.userId()}).count()

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
    'getUnitName': function(unitId) {
        if(unitId)
            return EntityObjects.findOne({_id: unitId}).name
    },
    'totalTripCost': function(travelRequestDetails) {
        if(travelRequestDetails) {
            let tripCosts = travelRequestDetails.tripCosts || [];
            let costNames = Object.keys(tripCosts)

            let totalCosts = 0;

            costNames.forEach(costName => {
                totalCosts += tripCosts[costName];
            })
            return totalCosts;
        }
    },
    'getTravelRequestCurrency': function(requisition) {
        if(requisition.currency) {
            return requisition.currency
        } else {
            return 'NGN'
        }
    }
});

/*****************************************************************************/
/* TravelRequisitionIndex: Lifecycle Hooks */
/*****************************************************************************/
Template.TravelRequisitionIndex.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context')

    self.NUMBER_PER_PAGE = new ReactiveVar(10);
    self.currentPage = new ReactiveVar(0);
    //--
    let customConfigSub = self.subscribe("BusinessUnitCustomConfig", businessUnitId, Core.getTenantId());
    self.travelRequestsICreated1 = new ReactiveVar()
    self.businessUnitCustomConfig = new ReactiveVar()

    self.getTravelRequestsICreated1 = function(skip) {
        let sortBy = "createdAt";
        let sortDirection = -1;

        let options = {};
        options.sort = {};
        options.sort[sortBy] = sortDirection;
        options.limit = self.NUMBER_PER_PAGE.get();
        options.skip = skip

        return TravelRequisitions.find({createdBy: Meteor.userId()}, options);
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

        let travelRequestsCreatedSub = self.subscribe('TravelRequestsICreated1', businessUnitId, limit, sort)
        if(travelRequestsCreatedSub.ready()) {
            self.travelRequestsICreated1.set(self.getTravelRequestsICreated1(0))
        }
        //--
        if(customConfigSub.ready()) {
            const customConfig = BusinessUnitCustomConfigs.findOne({businessId: businessUnitId})
            self.businessUnitCustomConfig.set(customConfig)
        }
    })
});

Template.TravelRequisitionIndex.onRendered(function () {
    $('select.dropdown').dropdown();
    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.TravelRequisitionIndex.onDestroyed(function () {
});
