/*****************************************************************************/
/* Selectpicker: Event Handlers */
/*****************************************************************************/
Template.semanticselect.events({

});

/*****************************************************************************/
/* Selectpicker: Helpers */
/*****************************************************************************/
Template.semanticselect.helpers({
});

/*****************************************************************************/
/* Selectpicker: Lifecycle Hooks */
/*****************************************************************************/
Template.semanticselect.onCreated(function () {
});

Template.semanticselect.onRendered(function () {
	self.$('select.dropdown').dropdown({
		forceSelection: false
	});
});

Template.semanticselect.onDestroyed(function () {
});
