ReportsController = BusinessUnitController.extend({

    // a place to put your subscriptions
    // this.subscribe('items');
    // // add the subscription to the waitlist
    // this.subscribe('item', this.params._id).wait();

    subscriptions: function() {
        //Meteor.subscribe('BusinessUnits');
    },

    // Subscriptions or other things we want to "wait" on. This also
    // automatically uses the loading hook. That's the only difference between
    // this option and the subscriptions option above.
    // return Meteor.subscribe('post', this.params._id);

    waitOn: function () {
        return [
        ];
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


    netpay: function () {
        this.render('NetPayReport');
    },
    tax: function () {
        this.render('TaxReport');
    },
    pension: function () {
        this.render('PensionReport');
    },
    comprehensive: function () {
        this.render('ComprehensiveReport');
    },
    timewriting: function () {
        this.render('TimeWritingReport');
    },
    procurement: function () {
        this.render('ProcurementReport');
    },
    travelRequest: function () {
        this.render('TravelRequestReport');
    },

    onAfterAction: function () {
    },
    onStop: function () {
    }
});
