/**
 * Core Account Methods
 */
Meteor.methods({
    "registerBusiness": function (user, tenant) {
        try {
            check(user, Match.Optional(Object));
            check(tenant, Core.Schemas.Tenant);
            check(user, Object);
        } catch (e) {
            console.log(e);
            throw new Meteor.Error(401, e);
        }
        //check if root admin mail exists
        //check if mail exists
        let foundEmail =  Meteor.users.findOne({"emails.address": user.email});
        if (foundEmail){
            throw new Meteor.Error(401, "Email already exists");
        };
        this.unblock();
        let tenantId, accountId, buId;
        //first create tenant, set admin email and domains
        tenant.adminEmail = user.email;
        tenant.domains = [tenant.name];
        try{
            tenantId = Tenants.insert(tenant);
        } catch(e){
            throw new Meteor.Error(401, e);
        }

        let options = {};

        options.email = user.email; // temporary
        options.password = user.password;
        options.firstname = "Default";
        options.lastname =  "Admin";
        options.employee = false;
        options.tenantId = tenantId;
        //assign default admin role
        options.roles = ["admin/all"];

        try{
            accountId = Accounts.createUser(options);
        } catch(e) {
            throw new Meteor.Error(401, e);
        }
        //Accounts.sendEnrollmentEmail(accountId, user.email);
        //create partitioned collection Business unit as default Company.
        let bu = {};
        bu.name = tenant.name;
        bu.location = tenant.addressBook[0].address1;
        bu.default = true;   //set bu as default... this bu cannot be deleted
        Partitioner.bindGroup(tenantId, function(){
            try{
                BusinessUnits.insert(bu);
            } catch(e) {
                throw new Meteor.Error(401, e);
            }
        });
        return accountId;
    }
});