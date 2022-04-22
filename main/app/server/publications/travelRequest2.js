/**
 * Travel Request publications
 */


 Core.publish("TravelRequestsBySupervisor", function (businessUnitId, supervisorId) {
     return TravelRequisition2s.find({businessId: businessUnitId, supervisorId: supervisorId});
 });


Core.publish("TravelRequestsByPM", function (businessUnitId, pmId) {
    return TravelRequisition2s.find({businessId: businessUnitId, pmId: pmId});
});

Core.publish("TravelRequestsByHOC", function (businessUnitId, hocId) {
    return TravelRequisition2s.find({businessId: businessUnitId, hocId: hocId});
});

 Core.publish("TravelRequestsByMD", function (businessUnitId, managerId) {
    return TravelRequisition2s.find({businessId: businessUnitId, managerId: managerId});
});

Core.publish("TravelRequestsByGCOO", function (businessUnitId, gcooId) {
    return TravelRequisition2s.find({businessId: businessUnitId, gcooId: gcooId});
});

Core.publish("TravelRequestsByGCEO", function (businessUnitId, gceoId) {
   return TravelRequisition2s.find({businessId: businessUnitId, gceoId: gceoId});
});

Core.publish("TravelRequestsByLogistics", function (businessUnitId, logisticsId) {
    return TravelRequisition2s.find({ businessId: businessUnitId, logisticsIds: logisticsId });
});

Core.publish("TravelRequestsByBST", function (businessUnitId, bstId) {
    return TravelRequisition2s.find({businessId: businessUnitId, bstIds: bstId});
});

Core.publish("TravelRequestsBySecurity", function (businessUnitId, securityId) {
    return TravelRequisition2s.find({businessId: businessUnitId, securityIds: securityId});
});

 Core.publish("TravelRequestsByBudgetHolder", function (businessUnitId, budgetHolderId) {
     return TravelRequisition2s.find({businessId: businessUnitId, budgetHolderId: budgetHolderId});
 });

 Core.publish("TravelRequestsByFinanceApprover", function (businessUnitId, financeApproverId) {
     return TravelRequisition2s.find({businessId: businessUnitId, financeApproverId: financeApproverId});
 });

Core.publish("TravelRequestsICreated", function (businessUnitId) {
    let user = this.userId;

    return TravelRequisition2s.find({businessId: businessUnitId, createdBy: this.userId});
});

Core.publish("TravelRequestsAdminCreated", function (businessUnitId) {


    const currentTravelRequest = TravelRequisition2s.find({businessId: businessUnitId})
    return currentTravelRequest;
    // .map((currentTravelRequest) => {
    //     currentTravelRequest.supervisor = Meteor.users.findOne(currentTravelRequest.supervisorId);
    //     currentTravelRequest.budgetHolder = Meteor.users.findOne(currentTravelRequest.budgetHolderId);
    //     return currentTravelRequest;
    // });
});

Core.publish("TravelRequestsStatusNotSeen", function (businessUnitId) {
    let user = this.userId;
    return TravelRequisition2s.find({
        businessId: businessUnitId,
        createdBy: this.userId,
        isStatusSeenByCreator: false
    });
});

Meteor.publish("TravelRequest2", function (requisitionId) {
    return TravelRequisition2s.find({_id: requisitionId});
});
Core.publish("TravelRequestToRetire", function (requisitionId) {
    return TravelRequisition2s.find({_id: requisitionId});
});

Core.publish("TravelRequestsToApprove", function (businessUnitId) {
    let user = Meteor.users.findOne({_id: this.userId})

    if(!user.employeeProfile || !user.employeeProfile.employment) {
        return Meteor.Error(401, "Unauthorized! You can't approve a travel request");
    }
    let userPositionId = user.employeeProfile.employment.position

    return TravelRequisition2s.find({
        businessId: businessUnitId,
        $or: [{supervisorPositionId : userPositionId},
                {alternativeSupervisorPositionId: userPositionId}]
    });
});


Core.publish("TravelRequestsToTreat", function (businessUnitId) {
    let user = Meteor.users.findOne({_id: this.userId})

    if(!user.employeeProfile || !user.employeeProfile.employment) {
        return Meteor.Error(401, "Unauthorized! You can't approve a travel request");
    }

    let userPositionId = user.employeeProfile.employment.position

    if (Core.hasTravelRequisitionApproveAccess(this.userId)) {
        return TravelRequisition2s.find({
            businessId: businessUnitId,
            status: 'Approved'
        });
    } else {
        return Meteor.Error(401, "Unauthorized! You don't have the 'Travel Requisition Approve' role");
    }
});
