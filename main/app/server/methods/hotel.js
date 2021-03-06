/**
 *  Pension Manager Methods
 */
Meteor.methods({

    /* pension Manger
     */

    "hotel/create": function(hotel){
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();

        try {
            check(hotel, Core.Schemas.Hotel);
        } catch (e) {
            console.log(e);
            throw new Meteor.Error(401, "There's invalid data in the hotel. Please correct and retry");
        }
        // if a bu object was provided and valid schema
        //if (Core.hasOrderAccess(userId, order.salesLocationId)) {
        //    // must have orders/manage permissions
        this.unblock();

        let hotelId = Hotels.insert(hotel);
        return {_id: hotelId};
        //let newBu = BusinessUnits.findOne(buId);
        ////sendOrderNotification("order.created", newOrder, userId);
        //return { _id: orderId, orderNumber: newOrder.orderNumber };
        //} else {
        //    throw new Meteor.Error(403, "You are not authorized to create an order for this location");
        //}
    },
    
    "hotel/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        // check if user has permission to delete
        Hotels.remove({_id: id});
        return true;
    },
    "hotel/update": function(id, updatedHotel){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        //update can only be done by authorized user. so check permission
        check(id, String);
        const selector = {
            _id: id
        };
        const result = Hotels.update(selector, {$set: updatedHotel} );
        return result;
    }

});
