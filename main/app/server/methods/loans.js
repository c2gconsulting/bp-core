
/**
 *  Loans Methods
 */
Meteor.methods({
    "Loans/create": function(loan){
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock();

        let user = Meteor.users.findOne(this.userId)
        if(user) {
            let hmoPlanType = loan.hmoPlanType
            if(hmoPlanType) {
                let hmoPlan = Loans2.findOne(hmoPlanType)

                if(changeRequest._id) {
                    Loans2.update(loan._id, 
                        {$set: {hmoPlanType: loan.hmoPlanType}})
                } else {
                    Loans2.insert(loan)
                }
                return true
            } else {
                throw new Meteor.Error(401, "Validation Error. Loan type not selected");
            }
        } else {
            throw new Meteor.Error(401, "Unauthorized");
        }
    },
    "Loans/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        
        let doc = Loans2.findOne({_id: id});
        if(!doc) {
            throw new Meteor.Error(401, "Sorry, your loan request could not be found");
        }
        if(doc.employeeId !== this.userId) {
            throw new Meteor.Error(401, "Unauthorized. You cannot delete a loan request you did not create.");
        }
        if(doc.approvalStatus === "Open") {
            Loans2.remove({_id: id});
            return true;
        } else {
            throw new Meteor.Error(401, "You cannot delete a loan request that has already been approved or rejected.");
        }
    }
});
