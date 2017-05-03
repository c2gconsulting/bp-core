

Template.header.events({
    'click .requisitionRowForApproval': function(e, tmpl) {
        e.preventDefault()
        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')
        console.log(`RequisitionId: ${requisitionId}`)

        let invokeReason = {}
        invokeReason.requisitionId = requisitionId
        invokeReason.reason = 'approve'
        invokeReason.approverId = Meteor.userId()

        Modal.show('ProcurementRequisitionDetail', invokeReason)
    },
    'click .requisitionRowForEdit': function(e, tmpl) {
        e.preventDefault()
        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')
        console.log(`RequisitionId: ${requisitionId}`)

        let invokeReason = {}
        invokeReason.requisitionId = requisitionId
        invokeReason.reason = 'edit'
        invokeReason.approverId = Meteor.userId()

        Modal.show('ProcurementRequisitionDetail', invokeReason)
    },
    'click .requisitionApprovalSeen': function(e, tmpl) {
        e.preventDefault()
        e.stopPropagation()

        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')
        console.log(`RequisitionId: ${requisitionId}`)
        let businessUnitId = Session.get('context')

        Meteor.call('ProcurementRequisition/markAsSeen', businessUnitId, requisitionId, function(err, res) {
            if(err) {
                swal('Validation error', err.message, 'error')
            }
        })
    },
    'click .timeRowForApproval': function(e, tmpl) {
        e.preventDefault()
        let timeId = e.currentTarget.getAttribute('data-timeId')
        Modal.show('selectedEvent', {type: 'Times', id: timeId})
    }
});


Template.registerHelper('trimString', function(passedString, startstring, endstring) {
    var theString = passedString.substring( startstring, endstring );
    return new Handlebars.SafeString(theString)
});

Template.header.helpers({
    'context': function(){
        return Session.get('context');
    },
    'procurementsToApprove': function() {
        return Template.instance().procurementsToApprove.get()
    },
    'procurementsStatusNotSeen': function() {
        return Template.instance().procurementsStatusNotSeen.get()
    },
    'timesToApprove': function() {
        return Template.instance().timesToApprove.get()
    },
    'timesStatusNotSeen': function() {
        return Template.instance().timesStatusNotSeen.get()
    },
    'currentUserId': function() {
        return Meteor.userId();
    },
    'getActivityDescription': function(time) {
        // console.log(`Inside getActivityDescription! Time: ${JSON.stringify(time)}`)
        let activity = Activities.findOne({_id: time.activity})
        // console.log(`Activity: ${JSON.stringify(activity)}`)

        return activity ? activity.description : '---';
    }
});

Template.header.onCreated(function() {
    console.log(`[header.js] inside onCreated`)
    let self = this

    self.procurementsToApprove = new ReactiveVar()
    self.procurementsStatusNotSeen = new ReactiveVar()

    self.timesToApprove = new ReactiveVar()
    self.timesStatusNotSeen = new ReactiveVar()

    self.leavesToApprove = new ReactiveVar()
    self.leavesApprovalStatusNotSeen = new ReactiveVar()   // By leave creator

    self.getIds = (users) => {
        const newUsers = [...users];
        const ids = newUsers.map(x => {
            //get unique ids of users
            return x._id;
        });
        return ids;
    }

    self.autorun(function() {
        let businessUnitId = Session.get('context')

        self.subscribe('AllActivities', Session.get('context'));

        let procurementsToApproveSub = self.subscribe('ProcurementRequisitionsToApprove', businessUnitId)
        let procurementsStatusNotSeenSub = self.subscribe('ProcurementRequisitionsStatusNotSeen', businessUnitId)
        //--
        let allEmployeesSub = self.subscribe('allEmployees', businessUnitId)
        let timesAndLeavesSub = self.subscribe('timedata', businessUnitId)  // This handles the subscription for 'times' and 'leaves'

        if(procurementsToApproveSub.ready()) {
            let currentUser = Meteor.user()

            if(currentUser.employeeProfile && currentUser.employeeProfile.employment) {
                let currentUserPosition = currentUser.employeeProfile.employment.position

                let procurementsToApprove = ProcurementRequisitions.find({
                    supervisorPositionId: currentUserPosition,
                    status: 'Pending'
                }).fetch()
                console.log(`[header.js] procurementsToApprove: ${JSON.stringify(procurementsToApprove)}`)
                self.procurementsToApprove.set(procurementsToApprove)
            }
        }
        if(procurementsStatusNotSeenSub.ready()) {
            self.procurementsStatusNotSeen.set(ProcurementRequisitions.find({
                createdBy: Meteor.userId(),
                $or: [{status: 'Treated'}, {status: 'Rejected'}],
                isStatusSeenByCreator: {$ne: true}
            }).fetch())
        }

        if(allEmployeesSub.ready() && timesAndLeavesSub.ready()) {
            let user = Meteor.user()
            let positions = EntityObjects.find({"properties.supervisor": user.employeeProfile.employment.position}).fetch().map(x=>{
                return x._id
            });
            const selector = {
                businessIds: businessUnitId,
                "employeeProfile.employment.position": {$in: positions}
            };
            console.log(`selector: ${JSON.stringify(selector)}`)

            let allSuperviseeIds = []

            Meteor.users.find().fetch().forEach(aUser => {
                let userPositionId = aUser.employeeProfile.employment.position
                if(positions.indexOf(userPositionId) !== -1) {
                    allSuperviseeIds.push(aUser._id)
                }
            });
            console.log(`allSuperviseeIds: ${JSON.stringify(allSuperviseeIds)}`)

            let timesToApprove = Times.find({
                employeeId: {$in: allSuperviseeIds},
                status: 'Open'
            }).fetch()
            self.timesToApprove.set(timesToApprove)
            //--
            let timesStatusNotSeen = Times.find({
                employeeId: Meteor.userId(),
                $or: [{status: 'Approved'}, {status: 'Rejected'}],
            }).fetch()
            self.timesStatusNotSeen.set(timesStatusNotSeen)
            //--
            let leavesToApprove = Leaves.find({
                employeeId: {$in: allSuperviseeIds},
                status: 'Open'
            }).fetch()
            self.leavesToApprove.set(leavesToApprove)
        }
    })
})

Template.header.onRendered(function () {

});

Template.header.onDestroyed(function() {
    Modal.show('selectedEvent', {type: 'Times', id: timeId})
})
