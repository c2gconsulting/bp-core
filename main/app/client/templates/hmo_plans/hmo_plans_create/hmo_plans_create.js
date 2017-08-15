/*****************************************************************************/
/* HmoPlanCreate: Event Handlers */
/*****************************************************************************/
Template.HmoPlanCreate.events({
});

/*****************************************************************************/
/* HmoPlanCreate: Helpers */
/*****************************************************************************/
Template.HmoPlanCreate.helpers({
    leaveTypes: function () {
        let leaveTypes = HmoPlans.find().fetch();
        let returnedArray = [];
        
        _.each(leaveTypes, function(leave){
            returnedArray.push({label: leave.name, value: leave._id})
        });
        return returnedArray
    },
    'payGrades': () => {
        return PayGrades.find().fetch().map(x => {
            return {label: x.code, value: x._id}
        })

    },
    'positions': () => {
        return EntityObjects.find().fetch().map(x => {
            return {label: x.name, value: x._id}
        })
    },

    'businessIdHelper': () => {
        return Session.get('context')
    },
    'status': () => {
        return [{label: "Active", value: "Active"},{label: "Inactive", value: "Inactive"}];
    },
    'formAction': () => {
        if(Template.instance().data)
            return "update";
        return "insert";
    },
    'formType': () => {
        if(Template.instance().data)
            return "hmoPlansForm";
        return "updateHmoPlansForm";
    },
    'data': () => {
        return Template.instance().data ? true:false;
    }
});



/*****************************************************************************/
/* HmoPlanCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.HmoPlanCreate.onCreated(function () {
    let self = this;
    self.profile = new ReactiveDict();

    //subscribe to positions and paygrades
    self.subscribe('getPositions', Session.get('context'));
    self.subscribe('paygrades', Session.get('context'));

});

Template.HmoPlanCreate.onRendered(function () {
    let self = this;
    $('select.dropdown').dropdown();

    let start = $("#startDate").val();
    let end = $("#endDate").val();
    if (start && end){
        start = moment(start);
        end = moment(end);
        let duration = end.diff(start, 'days');
        $("#duration").val(duration <= 0 ? 0 : duration)
    }

    self.autorun(function() {
        if (!self.profile.get('duration')){
            let propertyType = self.$("#duration").val();
            self.profile.set('duration', propertyType)
        }
        $("#startDate").on("change", function () {
            let start = $("#startDate").val();
            let end = $("#endDate").val();
            if (start && end){
                start = moment(start);
                end = moment(end);
                let duration = end.diff(start, 'days');
                $("#duration").val(duration <= 0 ? 0 : duration)
            }
        });
        $("#endDate").on("change", function () {
            let start = $("#startDate").val();
            let end = $("#endDate").val();
            if (start && end){
                start = moment(start);
                end = moment(end);
                let duration = end.diff(start, 'days');
                $("#duration").val(duration <= 0 ? 0 : duration)
            }
        });
    });
});

Template.HmoPlanCreate.onDestroyed(function () {
});