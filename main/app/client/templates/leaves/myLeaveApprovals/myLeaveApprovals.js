
/*****************************************************************************/
/* MyLeaveApprovals: Event Handlers */
/*****************************************************************************/
Template.MyLeaveApprovals.events({
    'click #getResult': function(e, tmpl) {
        e.preventDefault();
        const startTime = $('[name="startTime"]').val();
        const endTime = $('[name="endTime"]').val();

        if(startTime && endTime) {
            tmpl.$('#getResult').text('Preparing... ');
            tmpl.$('#getResult').attr('disabled', true);
            try {
                let l = Ladda.create(tmpl.$('#getReportForPeriodForDisplay')[0]);
                l.start();
            } catch(e) {
            }
            //--
            let resetButton = function() {
                try {
                    let l = Ladda.create(tmpl.$('#getResult')[0]);
                    l.stop();
                    l.remove();
                } catch(e) {
                }

                tmpl.$('#getResult').text(' View');
                tmpl.$('#getResult').removeAttr('disabled');
            };
            //--
            let startTimeAsDate = tmpl.getDateFromString(startTime)
            let endTimeAsDate = tmpl.getDateFromString(endTime)

            Meteor.call('reports/myLeaveRequestsApprovals', Session.get('context'), 
                startTimeAsDate, endTimeAsDate, function(err, res) {
                resetButton()
                if(res){
                    tmpl.leaveReports.set(res)
                } else {
                    swal('No result found', err.reason, 'error');
                }
            });
        }
    },
    'click #excel': function(e, tmpl) {
        e.preventDefault();
        const startTime = $('[name="startTime"]').val();
        const endTime = $('[name="endTime"]').val();

        if(startTime && endTime) {
            tmpl.$('#excel').text('Preparing... ');
            tmpl.$('#excel').attr('disabled', true);
            try {
                let l = Ladda.create(tmpl.$('#excel')[0]);
                l.start();
            } catch(e) {
            }
            //--
            let resetButton = function() {
                try {
                    let l = Ladda.create(tmpl.$('#excel')[0]);
                    l.stop();
                    l.remove();
                } catch(e) {
                }

                tmpl.$('#excel').text('Export');
                $('#excel').prepend("<i class='glyphicon glyphicon-download'></i>");
                tmpl.$('#excel').removeAttr('disabled');
            };
            //--
            let startTimeAsDate = tmpl.getDateFromString(startTime)
            let endTimeAsDate = tmpl.getDateFromString(endTime)

            Meteor.call('reports/myLeaveRequestsApprovals', Session.get('context'), 
                startTimeAsDate, endTimeAsDate, function(err, res) {
                resetButton()
                if(res){
                    tmpl.leaveReports.set(res)
                    tmpl.exportLeaveRequestReportData(res, startTime, endTime)
                } else {
                    swal('No result found', err.reason, 'error');
                }
            });            
        }
    },
    'change [name="employee"]': (e, tmpl) => {
        let selected = Core.returnSelection($(e.target));
        tmpl.selectedEmployees.set(selected)
    }
});

/*****************************************************************************/
/* MyLeaveApprovals: Helpers */
/*****************************************************************************/
Template.registerHelper('formatDate', function(date) {
  return moment(date).format('MMYYYY');
});

Template.MyLeaveApprovals.helpers({
    'tenant': function(){
        let tenant = Tenants.findOne();
        return tenant.name;
    },
    'month': function(){
        return Core.months()
    },
    'year': function(){
        return Core.years();
    },
    'employees': () => {
        return Meteor.users.find({"employee": true});
    },
    'reportsData': function() {
        return Template.instance().leaveReports.get()
    },
    'isLastIndex': function(array, currentIndex) {
        return (currentIndex === (array.length - 1))
    },
    'getSupervisorFullNames': function(leave) {
        return Template.instance().getSupervisorFullNames(leave)
    },
    limitText: function(text) {
        if(text && text.length > 10) {
            return `${text.substring(0, 30)} ...`
        }
        return text
    },
});

/*****************************************************************************/
/* MyLeaveApprovals: Lifecycle Hooks */
/*****************************************************************************/
Template.MyLeaveApprovals.onCreated(function () {
    let self = this;
    // self.subscribe("getPositions", Session.get('context'));

    self.leaveReports = new ReactiveVar()

    self.selectedEmployees = new ReactiveVar()

    self.getDateFromString = function(str1) {
        let theDate = moment(str1);
        return theDate.add('hours', 1).toDate()
    }

    self.getSupervisorFullNames = function(leaveRequest) {
        // let supervisor = Meteor.users.findOne({
        //     'employeeProfile.employment.position': procurement.supervisorPositionId
        // })
        // if(supervisor) {
        //     return supervisor.profile.fullName || '---'
        // }
        // //--
        let currentUser = Meteor.users.findOne(leaveRequest.employeeId)

        if(currentUser && currentUser.employeeProfile && currentUser.employeeProfile.employment) {
            let userPositionId = currentUser.employeeProfile.employment.position

            let userPositionObj = EntityObjects.findOne({
                _id: userPositionId,
                otype: 'Position',
                businessId: Session.get('context')
            })
            
            if(userPositionObj && userPositionObj.properties) {
                let supervisorId = userPositionObj.properties.supervisor
                let alternateSupervisorId = userPositionObj.properties.alternateSupervisor


                let supervisorFullName = ''
                let alternateSupervisorFullName = ''

                if(supervisorId) {
                    let supervisor = Meteor.users.findOne({
                        'employeeProfile.employment.position': supervisorId
                    })                    
                    if(supervisor) {
                        supervisorFullName = supervisor.profile.fullName
                    }
                }
                if(alternateSupervisorId) {                    
                    let alternateSupervisor = Meteor.users.findOne({
                        'employeeProfile.employment.position': alternateSupervisorId
                    })
                    if(alternateSupervisor) {
                        alternateSupervisorFullName = alternateSupervisor.profile.fullName
                    }
                }

                return {supervisorFullName, alternateSupervisorFullName}
            }
        } else {
            // console.log(`user employeeProfile or employment is NULL`)
        }
    }

    self.exportLeaveRequestReportData = function(theData, startTime, endTime) {
        let formattedHeader = ["Created By", "Description", "Date approved", "Start date", "End date", "Approval Status"]

        let reportData = []

        theData.forEach(aDatum => {
            reportData.push([aDatum.createdByFullName, aDatum.description, aDatum.approvedDate, 
                aDatum.startDate, aDatum.endDate, aDatum.approvalStatus])
        })
        BulkpayExplorer.exportAllData({fields: formattedHeader, data: reportData}, 
            `My Leave Approvals Report ${startTime} - ${endTime}`)
    }

});

Template.MyLeaveApprovals.onRendered(function () {
    self.$('select.dropdown').dropdown();

    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.MyLeaveApprovals.onDestroyed(function () {
});


Template.MyLeaveApprovalsEntry.events({
    'click .view': (e,tmpl) => {
        Modal.show('selectedEvent', {type: 'Leaves', id: tmpl.data._id})
    }
})

Template.MyLeaveApprovalsEntry.helpers({
    limitText: function(text) {
        if(text && text.length > 10) {
            return `${text.substring(0, 30)} ...`
        }
        return text
    },
});