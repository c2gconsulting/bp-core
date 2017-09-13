
/*****************************************************************************/
/* TravelRequisitionDetail: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';


/*
* invokeReason
* {
*   requisitionId: String,
*   reason: 'edit' | 'approve'
*   approverId: optional
* }
* */


Template.TravelRequisitionDetail.events({
    'click #requisition-save-draft': function(e, tmpl) {
        e.preventDefault()
        let procurementDetails = Template.instance().procurementDetails.get()
        if(procurementDetails) {
            let description = $("input[name=description]").val()
            let dateRequired = $("input[name=dateRequired]").val()
            let requisitionReason = $("textarea[name=requisitionReason]").val()

            if(description && description.length > 0) {
                let requisitionDoc = {}
                requisitionDoc.description = description
                if(dateRequired && dateRequired.length > 0)
                    requisitionDoc.dateRequired = new Date(dateRequired)
                else
                    requisitionDoc.dateRequired = null
                requisitionDoc.requisitionReason = requisitionReason

                let businessUnitId = Session.get('context')

                Meteor.call('TravelRequest/createDraft', businessUnitId, requisitionDoc, procurementDetails._id, function(err, res) {
                    if(!err) {
                        swal({title: "Success", text: "Travel request Draft saved", type: "success",
                            confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
                        }, () => {
                            Modal.hide()
                        })
                    } else {
                        swal('Validation error', err.message, 'error')
                    }
                })
            } else {
                swal('Validation error', "Please fill a description", 'error')
            }
        }
    },
    'click #requisition-create': function(e, tmpl) {
        e.preventDefault()

        let procurementDetails = Template.instance().procurementDetails.get()
        if(procurementDetails) {
            let description = $("input[name=description]").val()
            let dateRequired = $("input[name=dateRequired]").val()
            let requisitionReason = $("textarea[name=requisitionReason]").val()

            let validation = tmpl.areInputsValid(description, dateRequired, requisitionReason)
            if(validation === true) {
                let requisitionDoc = {}

                requisitionDoc.description = description
                requisitionDoc.dateRequired = new Date(dateRequired)
                requisitionDoc.requisitionReason = requisitionReason

                let businessUnitId = Session.get('context')

                Meteor.call('TravelRequest/create', businessUnitId, requisitionDoc, procurementDetails._id, function(err, res) {
                    if(!err) {
                        swal({title: "Success", text: "Travel request is now pending approval", type: "success",
                            confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
                        }, () => {
                            Modal.hide()
                        })
                    } else {
                        // console.log(`Err: ${JSON.stringify(err)}`)
                        swal('Validation error', err.message, 'error')
                    }
                })
            } else {
                swal('Validation error', validation, 'error')
            }
        }
    },
    'click #requisition-approve': function(e, tmpl) {
        e.preventDefault()
        let procurementDetails = Template.instance().procurementDetails.get()
        if(procurementDetails) {
            let businessUnitId = Session.get('context')

            let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
            if(businessUnitCustomConfig && businessUnitCustomConfig.isTwoStepApprovalEnabled) {
                if(Template.instance().isFirstSupervisor()) {
                    let approvalRecommendation = $("textarea[name=approvalRecommendation]").val()
                    
                    Meteor.call('TravelRequest/approveWithApprovalRecommendation', 
                        businessUnitId, procurementDetails._id, approvalRecommendation, function(err, res) {
                        if(!err) {
                            swal({title: "Success", text: "Requisition approved and sent for final approval", type: "success",
                                confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
                            }, () => {
                                Modal.hide()
                            })
                        } else {
                            swal('Validation error', err.message, 'error')
                        }
                    })
                } else if(Template.instance().isSecondSupervisor()) {
                    Meteor.call('TravelRequest/approve', businessUnitId, procurementDetails._id, function(err, res) {
                        if(!err) {
                            swal({title: "Success", text: "Requisition approved and sent for treatment approval", type: "success",
                                confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
                            }, () => {
                                Modal.hide()
                            })
                        } else {
                            swal('Validation error', err.message, 'error')
                        }
                    })
                } else {

                }
            } else {
                Meteor.call('TravelRequest/approve', businessUnitId, procurementDetails._id, function(err, res) {
                    if(!err) {
                        swal({title: "Success", text: "Travel request approved", type: "success",
                            confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
                        }, () => {
                            Modal.hide()
                        })
                    } else {
                        swal('Validation error', err.message, 'error')
                    }
                })
            }
        }
    },
    'click #requisition-reject': function(e, tmpl) {
        e.preventDefault()
        let procurementDetails = Template.instance().procurementDetails.get()
        if(procurementDetails) {
            let businessUnitId = Session.get('context')

            let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
            if(businessUnitCustomConfig && businessUnitCustomConfig.isTwoStepApprovalEnabled) {
                if(Template.instance().isFirstSupervisor()) {
                    let approvalRecommendation = $("textarea[name=approvalRecommendation]").val()
                    
                    Meteor.call('TravelRequest/rejectWithApprovalRecommendation', 
                        businessUnitId, procurementDetails._id, approvalRecommendation, function(err, res) {
                        if(!err) {
                            swal({title: "Success", text: "Travel request rejected and sent for final approval", type: "success",
                                confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
                            }, () => {
                                Modal.hide()
                            })
                        } else {
                            swal('Validation error', err.message, 'error')
                        }
                    })
                } else if(Template.instance().isSecondSupervisor()) {
                    Meteor.call('TravelRequest/reject', businessUnitId, procurementDetails._id, function(err, res) {
                        if(!err) {
                            swal({title: "Success", text: "Travel request rejected", type: "success",
                                confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
                            }, () => {
                                Modal.hide()
                            })
                        } else {
                            swal('Validation error', err.message, 'error')
                        }
                    })
                } else {

                }
            } else {
                Meteor.call('TravelRequest/reject', businessUnitId, procurementDetails._id, function(err, res) {
                    if(!err) {
                        swal({title: "Success", text: "Travel request rejected", type: "success",
                            confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
                        }, () => {
                            Modal.hide()
                        })
                    } else {
                        swal('Validation error', err.message, 'error')
                    }
                })
            }
        }
    },
    'click #requisition-print': function(e, tmpl) {
        // $("#ProcurementRequisitionDetailModal").printThis({
        //     importStyle: true
        // });
        let businessUnitLogoUrl = Template.instance().businessUnitLogoUrl.get()
        console.log('businessUnitLogoUrl: ', businessUnitLogoUrl)

        let procurementDetails = Template.instance().procurementDetails.get()

        let user = Meteor.users.findOne(procurementDetails.createdBy)
        let employeeFullName = ''
        let employeeId = ''
        if(user) {
            employeeFullName = user.profile.fullName
            employeeId = user.employeeProfile.employeeId;
        }

        let firstTransform = $("#TravelRequisitionDetailModal")
        .clone()
        .remove('.panel-footer')
        .find('.panel-title')
        .html(`Travel Request: ${employeeFullName}`)
        .end()
        .find('.panel-title')
        .prepend(`
            <img src='${businessUnitLogoUrl}' class='img-responsive mb10' alt='' />
        `)
        .end()

        if(businessUnitLogoUrl) {
        }

        firstTransform.printThis({
            importStyle: true
        });
    }    
});


Template.registerHelper('formatDate', function(date) {
    return moment(date).format('DD-MM-YYYY');
});

/*****************************************************************************/
/* TravelRequisitionDetail: Helpers */
/*****************************************************************************/
Template.TravelRequisitionDetail.helpers({
    'procurementDetails': function() {
        return Template.instance().procurementDetails.get()
    },
    'isInEditMode': function() {
        return Template.instance().isInEditMode.get()
    },
    'isInApproveMode': function() {
        return Template.instance().isInApproveMode.get()
    },
    'isInTreatMode': function() {
        return Template.instance().isInTreatMode.get()
    },
    'getUnitName': function(unitId) {
        if(unitId)
            return EntityObjects.findOne({_id: unitId}).name
    },
    'totalTripCost': function() {
        return Template.instance().totalTripCost.get()
    },
    'isTwoStepApprovalEnabled': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isTwoStepApprovalEnabled
        }
    },
    'isFirstSupervisor': function() {
        return Template.instance().isFirstSupervisor()
     },
    'isSecondSupervisor': function() {
        return Template.instance().isSecondSupervisor()
    },
    'firstSupervisorApproval': function() {
        let procurement = Template.instance().procurementDetails.get()

        let procurementApprovals = procurement.approvals || []
        let firstApproval = {}
        procurementApprovals.forEach(anApproval => {
            if(anApproval.firstApprover) {
                firstApproval = anApproval
            }
        })

        if(firstApproval) {
            let approverUserId = firstApproval.approverUserId
            if(approverUserId) {
                let approverUser = Meteor.users.findOne(approverUserId)
                if(approverUser) {
                    firstApproval.approverFullName = approverUser.profile.fullName
                }
            }
        }
        return firstApproval
    },
    'getHumanReadableApprovalState': function(boolean) {
        return boolean ? "Approved" : "Rejected"
    },
    'or': (a, b) => {
        return a || b
    }
});

/*****************************************************************************/
/* TravelRequisitionDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.TravelRequisitionDetail.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context');

    self.procurementDetails = new ReactiveVar()
    self.isInEditMode = new ReactiveVar()
    self.isInViewMode = new ReactiveVar()
    self.isInApproveMode = new ReactiveVar()
    self.isInTreatMode = new ReactiveVar()

    self.businessUnitCustomConfig = new ReactiveVar()

    let invokeReason = self.data;

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

    self.businessUnitLogoUrl = new ReactiveVar()

    self.autorun(function() {
        Meteor.call('BusinessUnitCustomConfig/getConfig', businessUnitId, function(err, res) {
            if(!err) {
                self.businessUnitCustomConfig.set(res)
            }
        })

        let businessUnitSubscription = self.subscribe("BusinessUnit", businessUnitId)
        let procurementSub = self.subscribe('TravelRequest', invokeReason.requisitionId)

        if(procurementSub.ready()) {
            let travelRequestDetails = TravelRequisitions.findOne({_id: invokeReason.requisitionId})
            self.procurementDetails.set(travelRequestDetails)
            //--
            if(travelRequestDetails && travelRequestDetails.tripCosts) {
                let flightCost = travelRequestDetails.tripCosts.flightCost || 0
                let accommodationCost = travelRequestDetails.tripCosts.accommodationCost || 0
                let localTransportCost = travelRequestDetails.tripCosts.localTransportCost || 0
                let perDiemCost = travelRequestDetails.tripCosts.perDiemCost || 0
                let miscCosts = travelRequestDetails.tripCosts.miscCosts || 0

                let totalTripCost = flightCost + accommodationCost + localTransportCost + 
                    perDiemCost + miscCosts

                self.totalTripCost.set(totalTripCost)
            }
            //--
            if(travelRequestDetails.unitId) {
                self.subscribe('getEntity', travelRequestDetails.unitId)
            }
        }

        if(businessUnitSubscription.ready()) {
            let businessUnit = BusinessUnits.findOne({_id: businessUnitId})
            self.businessUnitLogoUrl.set(businessUnit.logoUrl)
        }
    })

    self.areInputsValid = function(description, dateRequired, requisitionReason) {
        let errMsg = null
        if(!description || description.length < 1) {
            errMsg = "Please fill description"
            return errMsg
        }
        if(!dateRequired || dateRequired.length < 1) {
            errMsg = "Please fill date required"
            return errMsg
        }
        if(!requisitionReason || requisitionReason.length < 1) {
            errMsg = "Please fill requisition reason"
            return errMsg
        }
        return true
    }

    self.isFirstSupervisor = () => {
        let procurementDetails = Template.instance().procurementDetails.get()
        if(procurementDetails) {
            let currentUser = Meteor.user()
            let currentUserPositionId = null

            if(currentUser && currentUser.employeeProfile && currentUser.employeeProfile.employment) {
                currentUserPositionId = currentUser.employeeProfile.employment.position
            }

            let creatorUserId = procurementDetails.createdBy;

            let user = Meteor.users.findOne({_id: creatorUserId})
            if(user && user.employeeProfile && user.employeeProfile.employment) {
                let userPositionId = user.employeeProfile.employment.position
                let userPosition = EntityObjects.findOne({_id: userPositionId})

                if(userPosition) {
                    return userPosition.properties.supervisor === currentUserPositionId
                }
            }
        }
    }

    self.isSecondSupervisor = () => {
        let procurementDetails = Template.instance().procurementDetails.get()
        if(procurementDetails) {
            let currentUser = Meteor.user()
            let currentUserPositionId = null

            if(currentUser && currentUser.employeeProfile && currentUser.employeeProfile.employment) {
                currentUserPositionId = currentUser.employeeProfile.employment.position
            }

            let creatorUserId = procurementDetails.createdBy;

            let user = Meteor.users.findOne({_id: creatorUserId})
            if(user && user.employeeProfile && user.employeeProfile.employment) {
                let userPositionId = user.employeeProfile.employment.position

                let userPosition = EntityObjects.findOne({_id: userPositionId})
                if(userPosition) {
                    return userPosition.properties.alternateSupervisor === currentUserPositionId
                }
            }
        }
    }
});

Template.TravelRequisitionDetail.onRendered(function () {
    $('select.dropdown').dropdown();
    let self = this

    let procurementDetails = self.procurementDetails.get()
    if(procurementDetails) {
        if(procurementDetails.status !== 'Draft') {
            if(self.isInEditMode.get()) {
                swal('Error', "Sorry, you can't edit this travel request. ", 'error')
            }
        } else if(procurementDetails.status === 'Pending') {
            self.isInViewMode.set(true)
        } else if(procurementDetails.status === 'Approve') {
            if(self.isInEditMode.get()) {
                swal('Error', "Sorry, you can't edit this travel request. It has been approved", 'error')
            }
        }
    }
});

Template.TravelRequisitionDetail.onDestroyed(function () {
});
