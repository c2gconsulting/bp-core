import _ from 'underscore';

/*****************************************************************************/
/* AnnualTaxReport: Event Handlers */
/*****************************************************************************/
Template.AnnualTaxReport.events({
    'click .getResult': (e, tmpl) => {
        const year = $('[name="paymentPeriod.year"]').val();
        if(year) {
            Meteor.call('getAnnualTaxResult', Session.get('context'), year, function(err, res){
                if(res && res.taxAmountHeaders && res.taxAmountHeaders.length > 0) {
                    tmpl.dict.set('result', res);
                } else {
                    swal('No result found', 'Payroll Result not found for year', 'error');
                }
            });
        } else {
            swal('Error', 'Please select a year', 'error');
        }
    },
    'click .excel': (e, tmpl) => {
        event.preventDefault();
        const year = $('[name="paymentPeriod.year"]').val();

        if(year) {
            tmpl.$('.excel').text('Preparing... ');
            tmpl.$('.excel').attr('disabled', true);

            try {
                let l = Ladda.create(tmpl.$('.excel')[0]);
                l.start();
            } catch(e) {
                console.log(e);
            }

            let resetButton = function() {
                try {
                    let l = Ladda.create(tmpl.$('.excel')[0]);
                    l.stop();
                    l.remove();
                } catch(e) {
                    console.log(e);
                }

                tmpl.$('.excel').text(' Export to CSV');
                // Add back glyphicon
                $('.excel').prepend("<i class='glyphicon glyphicon-download'></i>");
                tmpl.$('.excel').removeAttr('disabled');
            };

            Meteor.call('exportAnnualTaxResult', Session.get('context'), year, function(err, res){
                if(res) {
                    BulkpayExplorer.exportAllData(res, "Pension Annual Report - " + year);
                    resetButton()
                } else {
                    console.log(err);
                    swal('No result found', 'Payroll Result not found for period', 'error');
                }
            });
        } else {
            swal('Error', 'Please select a year', 'error');
        }
    }
});

/*****************************************************************************/
/* AnnualTaxReport: Helpers */
/*****************************************************************************/
Template.registerHelper('formatDate', function(date) {
  return moment(date).format('MMYYYY');
});

Template.AnnualTaxReport.helpers({
    'tenant': function(){
        let tenant = Tenants.findOne();
        return tenant.name;
    },
    'month': function(){
        return Core.months()
    },
    'getMonthNameFromCode': function(monthCode) {
        const months = Core.months();
        let foundMonth =_.find(months, aMonth => aMonth.period === monthCode)
        if(foundMonth) {
            return foundMonth.name;
        }
    },
    'year': function(){
        return Core.years();
    },
    'result': () => {
        return Template.instance().dict.get('result');
    },
    'taxAmountHeaders': () => {
        let result = Template.instance().dict.get('result');
        if(result) {
            return result.taxAmountHeaders;
        }
    },
    'taxData': () => {
        let result = Template.instance().dict.get('result');
        if(result) {
            return result.taxData;
        }
    },
    'taxCodeHeaderForMonthExist': (monthTaxHeaders, month) => {
        return monthTaxHeaders.monthCode === month.period
    },
    'getTaxAmount': (currentEmployeeTaxData, currentMonthTaxCodeColumn, taxCode) => {
        let monthTaxHeaders = _.find(currentEmployeeTaxData.monthTax, (monthTax, monthIndex) => {
            let taxMonth = currentMonthTaxCodeColumn.monthCode
            let taxMonthAsNum = parseInt(taxMonth)

            return taxMonthAsNum === monthIndex
        })

        if(monthTaxHeaders) {
            return monthTaxHeaders[taxCode]
        } else {
            return ""
        }
    },
    'getNumberTaxCodeHeaderForMonth': (monthCode) => {
        let allTaxHeaders = Template.instance().dict.get('result') || [];

        let monthTaxHeaders = _.find(allTaxHeaders.taxAmountHeaders, monthTaxHeaders => {
            return monthTaxHeaders.monthCode === monthCode
        })
        if(monthTaxHeaders) {
            let taxCodesForMonth = monthTaxHeaders.taxCodes || [];
            return taxCodesForMonth.length;
        } else {
            return 0;
        }
    }
});

/*****************************************************************************/
/* AnnualTaxReport: Lifecycle Hooks */
/*****************************************************************************/
Template.AnnualTaxReport.onCreated(function () {
    let self = this;
    self.dict = new ReactiveDict();

});

Template.AnnualTaxReport.onRendered(function () {
    //$('#example').DataTable();
    self.$('select.dropdown').dropdown();

    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.AnnualTaxReport.onDestroyed(function () {
});
