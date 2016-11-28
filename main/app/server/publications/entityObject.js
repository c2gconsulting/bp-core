/**
 * entity Objects publications
 */

Core.publish("getChildrenEntityObject", function (parent, bu) {
    //perform neccessary checks and return both parent and children
    //considering that id cannot be null
    // select * from EntityObjects where (parentId = parent or id = parent) and businessid = bu;
    return EntityObjects.find({$and: [{$or: [{parentId: parent}, {_id: parent}]},{businessId: bu}]});
});

/**
 * Entity
 */

Core.publish("getRootEntities", function (bu) {
    //perform neccessary checks
    return EntityObjects.find({parentId: null, businessId: bu});
});

Core.publish("getEntity", function (id) {
    //perform neccessary checks
    return EntityObjects.find({_id: id});
});

Core.publish("getEntityWithDirectDecent", function(id){

});
