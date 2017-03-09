/*****************************************************************************/
/* TaxCreate: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';

Template.TaxCreate.events({
    'click #TaxButton': (e, tmpl) => {
        event.preventDefault();
        let l = Ladda.create(tmpl.$('#TaxButton')[0]);
        l.start();
        const details = {
            businessId: BusinessUnits.findOne()._id,
            code: $('[name="code"]').val(),
            name: $('[name="name"]').val(),
            grossIncomeRelief: parseInt($('[name="grossIncomeRelief"]').val()) || 20,
            consolidatedRelief: parseInt($('[name="consolidatedRelief"]').val()) || 200000,
            bucket: $('[name="bucket"]').val(),
            status: $('[name="status"]').val(),
            rules:  tmpl.dict.get("taxRules")
        };
        if(tmpl.data){//edit action for updating tax
            const tId = tmpl.data._id;
            const code = tmpl.data.code;
            Meteor.call("tax/update", tId, details, (err, res) => {
                l.stop();
                if(err){
                    swal("Update Failed", `Cannot Update tax ${code}`, "error");
                } else {
                    swal("Successful Update!", `Succesffully update tax ${code}`, "success");
                    Modal.hide("TaxCreate");
                }
            });

        } else{ //New Action for creating paytype}
            Meteor.call('tax/create', details, (err, res) => {
                l.stop();
                if (res){
                    Modal.hide('TaxCreate');
                    swal({
                        title: "Success",
                        text: `Tax Created`,
                        confirmButtonClass: "btn-success",
                        type: "success",
                        confirmButtonText: "OK"
                    });
                } else {
                    err = JSON.parse(err.details);
                    // add necessary handler on error
                    //use details from schema.key to locate html tag and error handler
                    _.each(err, (obj) => {
                        $('[name=' + obj.name +']').addClass('errorValidation');
                        $('[name=' + obj.name +']').attr("placeholder", obj.name + ' ' + obj.type);

                    })
                }
            });
        }
    },
    'click #deleteTax': (e, tmpl) => {
        event.preventDefault();
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this Tax",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, () => {
            //call backend method to delete the tax
            const ptId = tmpl.data._id;
            const code = tmpl.data.code;
            Meteor.call('tax/delete', ptId, (err, res) => {
                if(!err){
                    swal("Deleted!", `tax ${code} has been deleted.`, "success");
                    Modal.hide("TaxCreate");
                }
            });

        });
    },
    'click #add-rule-button': (e,tmpl) => {
        e.preventDefault();
        console.log("clicked me will probably add a tr to the end of the table");
        Modal.show("AddRule");
    },
    'click .deletetr': (e,tmpl) => {
        e.preventDefault();
        const rowIndex = e.target.closest('tr').rowIndex - 1;
        //get dict taxRule and delete the index
        let rules = tmpl.dict.get("taxRules");
        // remove the rowIndex from the array element
        if(rules[rowIndex] !== undefined){
            rules.splice(rowIndex,1);
        }
        tmpl.dict.set("taxRules", rules);
    }
});

/*****************************************************************************/
/* TaxCreate: Helpers */
/*****************************************************************************/
Template.TaxCreate.helpers({
    selected(context, val) {
        if(Template.instance().data){
            //get value of the option element
            //check and return selected if the template instce of data.val matches
            return Template.instance().data[context] === val ? selected="selected" : '';
        }
    },
    ranges(){
        //var ranges = ['FIRST', 'NEXT', 'OVER'];
        //if ($scope.singleTax) {
        //    if (_.find($scope.singleTax.rules, function (rule) { return rule.range === 'FIRST' })) {
        //        ranges.splice(ranges.indexOf('FIRST'), 1);
        //    }
        //    if (_.find($scope.singleTax.rules, function (rule) { return rule.range === 'OVER' })) {
        //        ranges.splice(ranges.indexOf('OVER'), 1);
        //    }
        //}
        //$scope.ranges = ranges;
    },
    rule() {
        //get default rule for new tax
        return Template.instance().dict.get("taxRules") || [];
    },
    edit() {
        return
    }
});

/*****************************************************************************/
/* TaxCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.TaxCreate.onCreated(function () {
    this.dict = new ReactiveDict();
    if(this.data){
        this.dict.set("taxRules", this.data.rules);
    } else {
        this.dict.set("taxRules", DefaultRule);
    }

});

Template.TaxCreate.onRendered(function () {
    $('#ruleTable').sortable({
        containerSelector: 'table',
        itemPath: '> tbody',
        itemSelector: 'tr',
        placeholder: '<tr class="placeholder"/>'
    });
    self.$('select.dropdown').dropdown();
});

Template.TaxCreate.onDestroyed(function () {
});

const DefaultRule = [{range: 'First', upperLimit: 300000, rate: 7},{range: 'Next', upperLimit: 300000, rate: 11}, {range: 'Next', upperLimit: 500000, rate: 15}, {range: 'Next', upperLimit: 500000, rate: 19}, {range: 'Next', upperLimit: 1600000, rate: 21}, {range: 'Over', upperLimit: 3200000, rate: 24}]