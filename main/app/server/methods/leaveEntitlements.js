Meteor.methods({

    "LeaveEntitlement/create": function(leaveEntitlementDoc, currentYear){
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock();

        try {
            let newLeaveEntitlementId = LeaveEntitlements.insert(leaveEntitlementDoc);

            if(leaveEntitlementDoc.payGradeIds && leaveEntitlementDoc.payGradeIds.length > 0) {
                let employeesWithPaygrade = Meteor.users.find({
                  'employeeProfile.employment.paygrade': {$in: leaveEntitlementDoc.payGradeIds}
                })
                employeesWithPaygrade.forEach(anEmployee => {
                    let employeeLeaveEntitlement = UserLeaveEntitlements.findOne({userId: anEmployee._id})
                    if(employeeLeaveEntitlement) {
                        let leaveDaysLeftHistory = employeeLeaveEntitlement.leaveDaysLeft || []
                        let leaveDaysLeftForYear = _.find(leaveDaysLeftHistory, (aYear) => {
                            return (aYear.year === currentYear)
                        })
                        if(leaveDaysLeftForYear) {
                            leaveDaysLeftForYear.leaveEntitlementId = newLeaveEntitlementId
                            leaveDaysLeftForYear.daysLeft = leaveEntitlementDoc.numberOfLeaveDaysPerAnnum
                            delete employeeLeaveEntitlement.createdAt

                            UserLeaveEntitlements.update(employeeLeaveEntitlement._id, {$set: employeeLeaveEntitlement})
                        }
                    } else {
                        UserLeaveEntitlements.insert({
                            userId : anEmployee._id,
                            leaveEntitlementId : newLeaveEntitlementId,
                            businessId : leaveEntitlementDoc.businessId,
                            leaveDaysLeft : [{
                                year: currentYear,
                                daysLeft: leaveEntitlementDoc.numberOfLeaveDaysPerAnnum
                            }]
                        })
                    }
                })
            }
            return true
        } catch (e) {
            throw new Meteor.Error(401, e.message);
        }
    },

    "LeaveEntitlement/setForOneEmployee": function(businessId, userId, leaveEntitlementId, currentYear){
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock();

        try {
            let leaveEntitlement = LeaveEntitlements.findOne({_id: leaveEntitlementId})

            if(!leaveEntitlement) {
                throw new Meteor.Error(401, "Sorry, that leave entitlement does not exist");
            }

            let employeeLeaveEntitlement = UserLeaveEntitlements.findOne({userId: userId})
            if(employeeLeaveEntitlement) {
                let leaveDaysLeftHistory = employeeLeaveEntitlement.leaveDaysLeft || []
                let leaveDaysLeftForYear = _.find(leaveDaysLeftHistory, (aYear) => {
                    if(aYear.year === currentYear) {
                        aYear.daysLeft = leaveEntitlement.numberOfLeaveDaysPerAnnum
                        return true
                    } else {
                        return false
                    }
                })
                // if(leaveDaysLeftForYear) {
                //     throw new Meteor.Error(401, "Sorry, that employee already has a leave entitlement for the year");
                // }
                // console.log(`leaveDaysLeftHistory: `, leaveDaysLeftHistory)
                // console.log(`employeeLeaveEntitlement._id: `, employeeLeaveEntitlement._id)

                UserLeaveEntitlements.update({_id: employeeLeaveEntitlement._id}, 
                    {$set: {
                        leaveEntitlementId : leaveEntitlementId,
                        leaveDaysLeft : leaveDaysLeftHistory
                    }}
                )
                return true
            } else {
                UserLeaveEntitlements.insert({
                    userId : userId,
                    leaveEntitlementId : leaveEntitlementId,
                    businessId : businessId,
                    leaveDaysLeft : [{
                        year: currentYear,
                        daysLeft: leaveEntitlement.numberOfLeaveDaysPerAnnum
                    }]
                })
                return true
            }
        } catch (e) {
            throw new Meteor.Error(401, e.message);
        }
    },
    "LeaveEntitlement/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        
        let doc = LeaveEntitlements.findOne({_id: id});
        if(!doc) {
            throw new Meteor.Error(401, "Unauthorized. You cannot delete a leave entitlement that does not exist.");            
        }

        LeaveEntitlements.remove({_id: id});
        return true;
    }
})