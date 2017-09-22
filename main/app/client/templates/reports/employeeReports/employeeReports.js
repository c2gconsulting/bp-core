
/*****************************************************************************/
/* EmployeesReport: Event Handlers */
/*****************************************************************************/
Template.EmployeesReport.events({
  'click #getResult': function(e, tmpl) {
      e.preventDefault();
      const startTime = $('[name="startTime"]').val();
      const endTime = $('[name="endTime"]').val();

      if(startTime && endTime) {
          tmpl.$('#getResult').text('Preparing... ');
          tmpl.$('#getResult').attr('disabled', true);
          try {
              let l = Ladda.create(tmpl.$('#getReportForPeriodForDisplay')[0]);
              l.start();
          } catch(e) {
          }
          //--
          let resetButton = function() {
              try {
                  let l = Ladda.create(tmpl.$('#getResult')[0]);
                  l.stop();
                  l.remove();
              } catch(e) {
              }

              tmpl.$('#getResult').text(' View');
              tmpl.$('#getResult').removeAttr('disabled');
          };
          //--
          let startTimeAsDate = tmpl.getDateFromString(startTime)
          let endTimeAsDate = tmpl.getDateFromString(endTime)

          let selectedEmployees = tmpl.selectedEmployees.get()

          Meteor.call('reports/procurement', Session.get('context'), 
              startTimeAsDate, endTimeAsDate, selectedEmployees, function(err, res) {
              resetButton()
              if(res){
                  tmpl.procurementReports.set(res)
              } else {
                  swal('No result found', err.reason, 'error');
              }
          });
      }
  },
  'click #excel': function(e, tmpl) {
      e.preventDefault();
      const startTime = $('[name="startTime"]').val();
      const endTime = $('[name="endTime"]').val();

      if(startTime && endTime) {
          tmpl.$('#excel').text('Preparing... ');
          tmpl.$('#excel').attr('disabled', true);
          try {
              let l = Ladda.create(tmpl.$('#excel')[0]);
              l.start();
          } catch(e) {
          }
          //--
          let resetButton = function() {
              try {
                  let l = Ladda.create(tmpl.$('#excel')[0]);
                  l.stop();
                  l.remove();
              } catch(e) {
              }

              tmpl.$('#excel').text('Export');
              $('#excel').prepend("<i class='glyphicon glyphicon-download'></i>");
              tmpl.$('#excel').removeAttr('disabled');
          };
          //--
          let startTimeAsDate = tmpl.getDateFromString(startTime)
          let endTimeAsDate = tmpl.getDateFromString(endTime)

          let selectedEmployees = tmpl.selectedEmployees.get()

          Meteor.call('reports/procurement', Session.get('context'), 
              startTimeAsDate, endTimeAsDate, selectedEmployees, function(err, res) {
              resetButton()
              if(res){
                  tmpl.procurementReports.set(res)
                  tmpl.exportProcurementReportData(res, startTime, endTime)
              } else {
                  swal('No result found', err.reason, 'error');
              }
          });            
      }
  },
  'change [name="employee"]': (e, tmpl) => {
      let selected = Core.returnSelection($(e.target));
      tmpl.selectedEmployees.set(selected)
  }
});

/*****************************************************************************/
/* EmployeesReport: Helpers */
/*****************************************************************************/
Template.registerHelper('formatDate', function(date) {
return moment(date).format('MMYYYY');
});

Template.EmployeesReport.helpers({
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
  'employees': () => {
      return Meteor.users.find({"employee": true});
  },
  'locations': () => {
      return EntityObjects.find({
        otype: 'Location',
        businessId: Session.get('context')
      })
  },
  'units': () => {
    return EntityObjects.find({
      otype: 'Unit',
      businessId: Session.get('context')
    })
  },
  'paygrades': () => {
     return PayGrades.find({
       businessId: Session.get('context')
     });
  },
  getNameForUnit: (unit) => {
    let parentsText = ""
    
    if(unit.parentId) {
      let possibleParent = EntityObjects.findOne({_id: unit.parentId})

        if(possibleParent) {
          parentsText = possibleParent.name + " >> " + unit.name
          return parentsText
        } else return unit.name
    } else return unit.name
  },
  'procurementReports': function() {
      return Template.instance().procurementReports.get()
  },
  'isLastIndex': function(array, currentIndex) {
      return (currentIndex === (array.length - 1))
  },
  'getSupervisor': function(procurement) {
      return Template.instance().getSupervisor(procurement)
  },
  limitText: function(text) {
      if(text && text.length > 10) {
          return `${text.substring(0, 30)} ...`
      }
      return text
  },
});

/*****************************************************************************/
/* EmployeesReport: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeesReport.onCreated(function () {
  let self = this;
  // self.subscribe("getPositions", Session.get('context'));
  let businessUnitId = Session.get('context')

  self.procurementReports = new ReactiveVar()

  self.selectedEmployees = new ReactiveVar()

  self.getDateFromString = function(str1) {
      let theDate = moment(str1);
      return theDate.add('hours', 1).toDate()
  }

  self.subscribe("paygrades", businessUnitId)
  self.subscribe('getCostElement', businessUnitId)
  // self.subscribe('getLocationEntity', businessUnitId)

  self.getSupervisor = function(procurement) {
      let supervisor = Meteor.users.findOne({
          'employeeProfile.employment.position': procurement.supervisorPositionId
      })
      if(supervisor) {
          return supervisor.profile.fullName || '---'
      }
  }

  self.exportProcurementReportData = function(theData, startTime, endTime) {
      let formattedHeader = ["Description", "Created By", "Unit", "Date required", "Approver", "Status"]

      let reportData = []

      theData.forEach(aDatum => {
          reportData.push([aDatum.description, aDatum.createdByFullName, aDatum.unitName, aDatum.createdAt, 
              self.getSupervisor(aDatum), aDatum.status])
      })
      BulkpayExplorer.exportAllData({fields: formattedHeader, data: reportData}, 
          `Procurement Requisition Report ${startTime} - ${endTime}`);
  }

});

Template.EmployeesReport.onRendered(function () {
  self.$('select.dropdown').dropdown();

  $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.EmployeesReport.onDestroyed(function () {
});
