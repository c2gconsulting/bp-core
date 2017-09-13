import _ from 'underscore';



let TravelRequestHelper = {
    sendRequisitionCreated: function(supervisorFullName, supervisorEmail, createdByFullName, 
        description, unitName, dateRequired, requisitionReason, approvalsPageUrl) {
        try {
            SSR.compileTemplate("travelRequestNotification", Assets.getText("emailTemplates/travelRequestNotification.html"));
            Email.send({
                to: supervisorEmail,
                from: "BulkPay™ Team <eariaroo@c2gconsulting.com>",
                subject: "Travel Request created!",
                html: SSR.render("travelRequestNotification", {
                    user: supervisorFullName,
                    createdBy: createdByFullName,
                    description: description,
                    unit: unitName,
                    dateRequired: dateRequired,
                    reason: requisitionReason,
                    approvalsPageUrl: approvalsPageUrl
                })
            });
            return true
        } catch(e) {
            throw new Meteor.Error(401, e.message);
        }
    },
    sendRequisitionNeedsTreatment: function(supervisorFullName, supervisorEmail, createdByFullName, 
        description, unitName, dateRequired, requisitionReason, approvalsPageUrl) {
        try {
            SSR.compileTemplate("travelRequisitionNotificationForTreatment", Assets.getText("emailTemplates/travelRequisitionNotificationForTreatment.html"));
            
            Email.send({
                to: supervisorEmail,
                from: "BulkPay™ Team <eariaroo@c2gconsulting.com>",
                subject: "Travel Request approved and needs to be treated",
                html: SSR.render("travelRequisitionNotificationForTreatment", {
                    user: supervisorFullName,
                    createdBy: createdByFullName,
                    description: description,
                    unit: unitName,
                    dateRequired: dateRequired,
                    reason: requisitionReason,
                    approvalsPageUrl: approvalsPageUrl
                })
            });
            return true
        } catch(e) {
            throw new Meteor.Error(401, e.message);
        }
    }
}

/**
 *  Travel Request Methods
 */
Meteor.methods({
    "TravelRequest/createDraft": function(businessUnitId, travelRequestDoc, docId){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you have not allowed to create a travel request because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }

        let userPositionId = Meteor.user().employeeProfile.employment.position

        let userPosition = EntityObjects.findOne({_id: userPositionId, otype: 'Position'})
        if(userPosition.properties) {
            let supervisorPositionId = userPosition.properties.supervisor

            travelRequestDoc.createdBy = Meteor.userId()
            travelRequestDoc.status = 'Draft'
            travelRequestDoc.businessId = businessUnitId
            travelRequestDoc.supervisorPositionId = supervisorPositionId
            if(docId) {
                TravelRequisitions.update(docId, {$set: travelRequestDoc})
            } else{
                TravelRequisitions.insert(travelRequestDoc)
            }
            return true
        }
        throw new Meteor.Error(404, "Sorry, you have not supervisor to approve your requisition");
    },
    "TravelRequest/create": function(businessUnitId, travelRequestDoc, docId){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you have not allowed to create a procurement requisition because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }

        let userPositionId = Meteor.user().employeeProfile.employment.position

        let userPosition = EntityObjects.findOne({_id: userPositionId, otype: 'Position'})
        if(userPosition.properties 
            && (userPosition.properties.supervisor || userPosition.properties.alternateSupervisor)) {
            let supervisorPositionId = userPosition.properties.supervisor || ""
            let alternateSupervisorPositionId = userPosition.properties.alternateSupervisor || ""

            travelRequestDoc.createdBy = Meteor.userId()
            travelRequestDoc.businessId = businessUnitId
            travelRequestDoc.supervisorPositionId = supervisorPositionId
            travelRequestDoc.alternativeSupervisorPositionId = alternateSupervisorPositionId
            travelRequestDoc.status = 'Pending'

            if(docId) {
                TravelRequisitions.update(docId, {$set: travelRequestDoc})
            } else {
                TravelRequisitions.insert(travelRequestDoc)
            }
            //--
            let createdBy = Meteor.users.findOne(Meteor.userId())
            
            let createdByEmail = createdBy.emails[0].address;
            let createdByFullName = createdBy.profile.fullName
            let unit = EntityObjects.findOne({_id: travelRequestDoc.unitId, otype: 'Unit'})
            let unitName = unit.name
            let dateRequired = ''
            if(travelRequestDoc.dateRequired) {
                dateRequired = moment(travelRequestDoc.dateRequired).format('DD/MM/YYYY')
            }
            let approvalsPageUrl = Meteor.absoluteUrl() + `business/${businessUnitId}/employee/travelrequests/approvalslist`
            //--
            let supervisors = []
            let alternateSupervisors = []

            if(supervisorPositionId) {
                supervisors = Meteor.users.find({
                    'employeeProfile.employment.position': supervisorPositionId
                }).fetch()
            }

            if(alternateSupervisorPositionId) {
                alternateSupervisors = Meteor.users.find({
                    'employeeProfile.employment.position': alternateSupervisorPositionId
                }).fetch()
            }
            if(supervisors && supervisors.length > 0) {
                supervisors.forEach(aSupervisor => {
                    let supervisorEmail =  aSupervisor.emails[0].address;

                    TravelRequestHelper.sendRequisitionCreated(
                        aSupervisor.profile.fullName,
                        supervisorEmail, createdByFullName, 
                        travelRequestDoc.description, 
                        unitName,
                        dateRequired,
                        travelRequestDoc.requisitionReason,
                        approvalsPageUrl)
                })
            }
            if(alternateSupervisors && alternateSupervisors.length > 0) {
                alternateSupervisors.forEach(aSupervisor => {
                    let supervisorEmail =  aSupervisor.emails[0].address;

                    TravelRequestHelper.sendRequisitionCreated(
                        aSupervisor.profile.fullName,
                        supervisorEmail, createdByFullName, 
                        travelRequestDoc.description, 
                        unitName,
                        dateRequired,
                        travelRequestDoc.requisitionReason,
                        approvalsPageUrl)
                })
            }
            return true
        }
        throw new Meteor.Error(404, "Sorry, you do not have a supervisor to approve your requisition");
    },
    "TravelRequest/approve": function(businessUnitId, docId) {
        if(!this.userId && !Core.hasTravelRequisitionApproveAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you have not allowed to approve a travel requisition because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }
        let userPositionId = Meteor.user().employeeProfile.employment.position

        let travelRequestDoc = TravelRequisitions.findOne({_id: docId})
        if(!travelRequestDoc) {
            throw new Meteor.Error(401, "Requisition does not exist.")
        }

        let businessCustomConfig = BusinessUnitCustomConfigs.findOne({businessId: businessUnitId})
        if(businessCustomConfig && businessCustomConfig.isTwoStepApprovalEnabled) {
            if(travelRequestDoc.alternativeSupervisorPositionId === userPositionId) {
                TravelRequisitions.update(docId, {$set: {
                    status: 'Approved',
                    approvedByUserId: Meteor.userId()
                }})
                //--
                let usersWithTravelApproveRole = Meteor.users.find({
                    businessIds: businessUnitId,
                    'roles.__global_roles__': Core.Permissions.TRAVEL_REQUISITION_APPROVE
                }).fetch()

                try {
                    let createdBy = Meteor.users.findOne(travelRequestDoc.createdBy)                
                    let createdByEmail = createdBy.emails[0].address;
                    let createdByFullName = createdBy.profile.fullName
                    let unit = EntityObjects.findOne({_id: travelRequestDoc.unitId, otype: 'Unit'})
                    let unitName = unit.name
                    let dateRequired = ''
                    if(travelRequestDoc.dateRequired) {
                        dateRequired = moment(travelRequestDoc.dateRequired).format('DD/MM/YYYY')
                    }
                    let approvalsPageUrl = Meteor.absoluteUrl() + `business/${businessUnitId}/employee/travelrequests/treatlist`
                    //--
                    if(usersWithTravelApproveRole && usersWithTravelApproveRole.length > 0) {
                        let supervisorEmail =  usersWithTravelApproveRole[0].emails[0].address;

                        TravelRequestHelper.sendRequisitionNeedsTreatment(
                            usersWithTravelApproveRole[0].profile.fullName,
                            supervisorEmail, createdByFullName, 
                            travelRequestDoc.description, 
                            unitName,
                            dateRequired,
                            travelRequestDoc.requisitionReason,
                            approvalsPageUrl)
                    }
                } catch(errorInSendingEmail) {
                    console.log(errorInSendingEmail)
                }
                return true;
            } else {
                throw new Meteor.Error(401, "Unauthorized to perform final approval")
            }
        } else {
            if(travelRequestDoc.supervisorPositionId === userPositionId) {
                TravelRequisitions.update(docId, {$set: {status: 'Approved'}})
                return true;
            } else {
                throw new Meteor.Error(401, "Unauthorized to approve requisition.")
            }
        }
    },
    "TravelRequest/treat": function(businessUnitId, docId) {
        if(!this.userId && !Core.hasTravelRequisitionApproveAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you have not allowed to treat a travel requisition because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }
        let userPositionId = Meteor.user().employeeProfile.employment.position

        let travelRequestDoc = TravelRequisitions.findOne({_id: docId})
        if(travelRequestDoc) {
            TravelRequisitions.update(docId, {$set: {status: 'Treated'}})
            return true;
        }
    },
    "TravelRequest/treatmentRejected": function(businessUnitId, docId) {
        if(!this.userId && !Core.hasProcurementRequisitionApproveAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you have not allowed to reject a procurement requisition because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }
        let userPositionId = Meteor.user().employeeProfile.employment.position

        let travelRequestDoc = TravelRequisitions.findOne({_id: docId})
        if(travelRequestDoc) {
            TravelRequisitions.update(docId, {$set: {status: 'TreatmentRejected'}})
            return true;
        }
    },
    "TravelRequest/reject": function(businessUnitId, docId) {
        // if(!this.userId && !Core.hasTravelRequisitionApproveAccess(this.userId)){
        //     throw new Meteor.Error(401, "Unauthorized");
        // }
        check(businessUnitId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you have not allowed to reject a travel requisition because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }
        let userPositionId = Meteor.user().employeeProfile.employment.position

        let travelRequestDoc = TravelRequisitions.findOne({_id: docId})
        if(travelRequestDoc.supervisorPositionId === userPositionId) {
            TravelRequisitions.update(docId, {$set: {status: 'Rejected'}})
            return true;
        } else {
            throw new Meteor.Error(401, "Unauthorized to approve requisition.")
        }
    },
    "TravelRequest/markAsSeen": function(businessUnitId, docId){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        let travelRequestDoc = TravelRequisitions.findOne({_id: docId})
        if(travelRequestDoc.createdBy === Meteor.userId()) {
            TravelRequisitions.update(docId, {$set: {isStatusSeenByCreator: true}})
            return true;
        } else {
            throw new Meteor.Error(401, "Unauthorized. You didn't create that requisition")
        }
    }
});
