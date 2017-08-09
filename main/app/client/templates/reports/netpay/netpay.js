
/*****************************************************************************/
/* NetPayReport: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';


Template.NetPayReport.events({
  'change [name=payrollReportPeriod]': function (e, tmpl) {
    let value = e.currentTarget.value;

    if (value && value.trim().length > 0) {
      Session.get('payrollPeriod', value);
      console.log("payrollPeriod changed to: " + value);
    }
  },
   'click .getResult': (e, tmpl) => {
      const month = $('[name="paymentPeriod.month"]').val();
      const year = $('[name="paymentPeriod.year"]').val();
      if(month && year) {
          const period = month + year;

          Meteor.call('getnetPayResult', Session.get('context'), period, function(err, res){
              console.log(res);
              if(res && res.length){
                  console.log('logging response as ', res);
                  tmpl.netPayReportResults.set(res);
              } else {
                  swal('No result found', err.reason, 'error');
                  tmpl.netPayReportResults.set(null);
              }
          });
      } else {
          swal('Error', 'Please select Period', 'error');
      }
   },
    'click .excel': (e, tmpl) => {
        event.preventDefault();
        const month = $('[name="paymentPeriod.month"]').val();
        const year = $('[name="paymentPeriod.year"]').val();
        if(month && year) {
            tmpl.$('.excel').text('Preparing... ');
            tmpl.$('.excel').attr('disabled', true);

            try {
                let l = Ladda.create(tmpl.$('.excel')[0]);
                l.start();
            } catch(e) {
                console.log(e);
            }

            let resetButton = function() {
                // End button animation
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

            const period = month + year;
            Meteor.call('ExportNetPayResult', Session.get('context'), period, function(err, res){
                if(res){
                    //call the export fo
                    BulkpayExplorer.exportAllData(res, "NetPaymentReport");
                    resetButton()
                } else {
                    console.log(err);
                    swal('No result found', err.reason, 'error');
                }
            });
        } else {
            swal('Error', 'Please select Period', 'error');
        }

    }
});

/*****************************************************************************/
/* NetPayReport: Helpers */
/*****************************************************************************/
Template.registerHelper('formatDate', function(date) {
  return moment(date).format('MMYYYY');
});

Template.NetPayReport.helpers({
    'tenant': function(){
        let tenant = Tenants.findOne();
        return tenant.name;
    },
    'month': function(){
        return Core.months()
    },
    'year': function(){
        return Core.years();
    },
    'result': () => {
        return Template.instance().netPayReportResults.get();
    },
    'netPayData': () => {
        let rawData = Template.instance().netPayReportResults.get();

        if(rawData && rawData.length > 0) {
            return rawData.splice(1)
        }        
    },
    'isEqual': (a, b) => {
        return a === b
    },
    'or': (a, b) => {
        return a || b
    },
    'isNumber': (value) => {
        return !isNaN(value)
    }
});

/*****************************************************************************/
/* NetPayReport: Lifecycle Hooks */
/*****************************************************************************/
Template.NetPayReport.onCreated(function () {
    let self = this;
    self.netPayReportResults = new ReactiveVar();
});

Template.NetPayReport.onRendered(function () {
    //$('#example').DataTable();
  	self.$('select.dropdown').dropdown();
});

Template.NetPayReport.onDestroyed(function () {
});
