RequisitionController = BusinessUnitController.extend({

    // a place to put your subscriptions
    // this.subscribe('items');
    // // add the subscription to the waitlist
    // this.subscribe('item', this.params._id).wait();

    subscriptions: function() {
    },

    // Subscriptions or other things we want to "wait" on. This also
    // automatically uses the loading hook. That's the only difference between
    // this option and the subscriptions option above.
    // return Meteor.subscribe('post', this.params._id);

    waitOn: function () {
    },

    // A data function that can be used to automatically set the data context for
    // our layout. This function can also be used by hooks and plugins. For
    // example, the "dataNotFound" plugin calls this function to see if it
    // returns a null value, and if so, renders the not found template.
    // return Posts.findOne({_id: this.params._id});

    data: function () {
        return BusinessUnits.findOne({_id: this.params._id});
    },

    // You can provide any of the hook options

    onRun: function () {
        this.next();
    },
    onRerun: function () {
        this.next();
    },
    onBeforeAction: function () {
        this.next();
    },

    // The same thing as providing a function as the second parameter. You can
    // also provide a string action name here which will be looked up on a Controller
    // when the route runs. More on Controllers later. Note, the action function
    // is optional. By default a route will render its template, layout and
    // regions automatically.
    // Example:
    //  action: 'myActionFunction'
    // action: function () {
    //   this.render();
    // },
    showProcurementRequisitionsList: function() {
        this.render('ProcurementRequisitionIndex')
    },
    showProcurementRequisitionApprovalList: function() {
        this.render('ProcurementRequisitionApprovalList')
    },
    showProcurementRequisitionTreatList: function() {
        this.render('ProcurementRequisitionTreatList')
    },

    showTravelRequestsList: function() {
        this.render('TravelRequisitionIndex')
    },
    showTravelRequestTreatList: function() {
        this.render('TravelRequisitionTreatList')
    },
    showTravelRequisition2BudgetHolderIndex: function() {
        this.render('TravelRequisition2BudgetHolderIndex')
    },
    showTravelRequisition2AdminIndex: function() {
        this.render('TravelRequisition2AdminIndex')
    },
    showTravelRequisitionRetirement2AdminIndex: function() {
        this.render('TravelRequisitionRetirement2AdminIndex')
    },
    showTravelRequisition2Index: function() {
        this.render('TravelRequisition2Index')
    },
    showTravelRequisition2BudgetHolderRetireIndex: function() {
        this.render('TravelRequisition2BudgetHolderRetireIndex')
    },
    showTravelRequisition2FinanceRetireIndex: function() {
        this.render('TravelRequisition2FinanceRetireIndex')
    },
    showTravelRequisition2SupervisorRetirementIndex: function() {
        this.render('TravelRequisition2SupervisorRetirementIndex')
    },
    showTravelRequisition2RetirementIndex: function() {
        this.render('TravelRequisition2RetirementIndex')
    },
    showTravelRequisition2SupervisorIndex: function() {
        this.render('TravelRequisition2SupervisorIndex')
    },
    // Local Errand Transport

    showLocalErrandTransportRequisitionBudgetHolderIndex: function() {
        this.render('LocalErrandTransportRequisitionBudgetHolderIndex')
    },
    showLocalErrandTransportRequisitionAdminIndex: function() {
        this.render('LocalErrandTransportRequisitionAdminIndex')
    },
    showLocalErrandTransportRequisitionRetirementAdminIndex: function() {
        this.render('LocalErrandTransportRequisitionRetirementAdminIndex')
    },
    showLocalErrandTransportRequisitionIndex: function() {
        this.render('LocalErrandTransportRequisitionIndex')
    },
    showLocalErrandTransportRequisitionBudgetHolderRetireIndex: function() {
        this.render('LocalErrandTransportRequisitionBudgetHolderRetireIndex')
    },
    showLocalErrandTransportRequisitionFinanceRetireIndex: function() {
        this.render('LocalErrandTransportRequisitionFinanceRetireIndex')
    },
    showLocalErrandTransportRequisitionSupervisorRetirementIndex: function() {
        this.render('LocalErrandTransportRequisitionSupervisorRetirementIndex')
    },
    showLocalErrandTransportRequisitionRetirementIndex: function() {
        this.render('LocalErrandTransportRequisitionRetirementIndex')
    },
    showLocalErrandTransportRequisitionSupervisorIndex: function() {
        this.render('LocalErrandTransportRequisitionSupervisorIndex')
    },
    onAfterAction: function () {
    },
    onStop: function () {
    }
});
