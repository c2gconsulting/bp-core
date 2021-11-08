moment = require("moment");
/*****************************************************************************/
/* DashOutstandingBills: Event Handlers */
/*****************************************************************************/
Template.DashOutstandingBills.events({
  'click a[href="#annually"]': function (e, tmpl) {
    tmpl.topOutstandingBillsFilter.set("Year");
  },

  'click a[href="#month"]': function (e, tmpl) {
    tmpl.topOutstandingBillsFilter.set("Month");
  },

  'click a[href="#week"]': function (e, tmpl) {
    tmpl.topOutstandingBillsFilter.set("Week");
  },

  'click a[href="#today"]': function (e, tmpl) {
    tmpl.topOutstandingBillsFilter.set("Today");
  },
});

/*****************************************************************************/
/* DashOutstandingBills: Helpers */
/*****************************************************************************/
Template.DashOutstandingBills.helpers({
  deadline: function (dueDate) {
    deadline = moment(dueDate).diff(moment(), "days");
    abs_deadline = Math.abs(deadline);
    daysLeft =
      deadline < 0 ? "days overdue" : deadline == 1 ? "day left" : "days left";
    return `${abs_deadline} ${daysLeft}`;
  },
  outstandingBills: function () {
    if (
      Template.instance().outstandingBills.get("outstandingBills") &&
      Template.instance().outstandingBills.get("outstandingBills")
    ) {
      return Template.instance().outstandingBills.get("outstandingBills")
        .currentTopCustomers;
    //   previous = Template.instance().outstandingBills.get("outstandingBills")
    //     .previousTopCustomers;
    //   return transform(current, previous);
    }
    return [];
  },
  topOutstandingBillFilter: function () {
    return Template.instance().topOutstandingBillsFilter.get();
  },
  enableLoading: function () {
    return Template.instance().outstandingBills.get("showLoading");
  },
});

/*****************************************************************************/
/* DashOutstandingBills: Lifecycle Hooks */
/*****************************************************************************/
Template.DashOutstandingBills.onCreated(function () {
  let instance = this;
  instance.outstandingBills = new ReactiveDict();
  instance.topOutstandingBillsFilter = new ReactiveVar("Year");
  instance.outstandingBills.set("showLoading", true);

  instance.autorun(function () {
    instance.outstandingBills.set("showLoading", true);

    let industryFilter = Session.get("industryFilter");
    let companyFilter = Session.get("companyFilter");
    let companyNames = "all";

    if (industryFilter && industryFilter != "all") {
      const filter = {
        industry: industryFilter,
        status: "ACTIVE",
      };
      let companies = BusinessUnits.find(filter).fetch();
      companyNames = companies.map((company) => company.name);
    }

    if (companyFilter && companyFilter != "all") {
      company = BusinessUnits.findOne({
        _id: companyFilter,
      });
      companyNames = [company.name];
    }

    if (Core.isStakeholder()) {
      const companyId = Meteor.user().profile.companyId;
      const company = BusinessUnits.findOne({
        _id: companyId,
      });
      companyNames = [company.name];
    }
    // Meteor.call(
    //   "bills/outstandingBills",
    //   companyNames,
    //   function (error, data) {
    //     if (error) {
    //       console.log(error);
    //     } else {
    //       instance.outstandingBills.set("outstandingBills", data);
    //       instance.outstandingBills.set("showLoading", false);
    //     }
    //   }
    // );
  });
});

Template.DashOutstandingBills.onRendered(function () {});

Template.DashOutstandingBills.onDestroyed(function () {});

// let transform = function (current, previous) {
//   _.each(current, function (customer, index) {
//     let oldNum = index <= previous.length - 1 ? previous[index].amountDue : 0;
//     let newNum = customer.amountDue;
//     let evaluatedPercentage;
//     if (oldNum) {
//       evaluatedPercentage = (((newNum - oldNum) / oldNum) * 100).toFixed(0);
//       customer.evaluatedPercentage = Number(evaluatedPercentage);
//       customer.percentageChange = customer.evaluatedPercentage > 0;
//     }
//   });
//   return current;
// };