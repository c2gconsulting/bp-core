/*****************************************************************************/
/* Payslip: Event Handlers */
/*****************************************************************************/
Template.Payslip.events({
    'click #createPaygrade': (e,tmpl) => {
        e.preventDefault();
        Modal.show('PaygradeCreate');
    }
});

/*****************************************************************************/
/* Payslip: Helpers */
/*****************************************************************************/
Template.Payslip.helpers({

});

/*****************************************************************************/
/* Payslip: Lifecycle Hooks */
/*****************************************************************************/
Template.Payslip.onCreated(function () {
    let self = this;

});

Template.Payslip.onRendered(function () {
    console.log(Template.instance().data);

});

Template.Payslip.onDestroyed(function () {

});
