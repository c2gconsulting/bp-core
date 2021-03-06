import _ from 'underscore'


Template.navigator.events({
    'click #companyMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #payRulesMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #sapB1IntegrationMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #successFactorsIntegrationMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #sapHanaIntegrationMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #administrationMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #payrunsMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #selfServiceMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #travelSupervisorMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #travelBudgetHolderMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #travelFinanceMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #reportsMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #auditReportsMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #superAdminReportsMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    }
});

Template.navigator.helpers({
    'context': function(){
        return Session.get('context');
    },
    'currentUserId': function() {
        return Meteor.userId();
    },
    'isMenuExpanded': function(menuId) {
        let currentExpandedMenuId = Template.instance().expandedMenu.get()
        return menuId === currentExpandedMenuId
    },
    'isMenuExpandedFocusClass': function(menuId) {
        let currentExpandedMenuId = Template.instance().expandedMenu.get()
        return (menuId === currentExpandedMenuId) ? 'active' : ''
    },
    hasLeaveApprovalAccess: function () {
        return Core.hasLeaveApprovalAccess(Meteor.userId());
    },

    hasProcurementRequisitionApproveAccess: function () {
        let canApproveProcurement = Core.hasProcurementRequisitionApproveAccess(Meteor.userId());
        return canApproveProcurement;
    },
    isProcurementRequisitionActive: function () {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isProcurementRequisitionActive
        } else {
            return false
        }
    },
    isUserASupervisor: function() {
        let currentUser = Meteor.users.findOne(Meteor.userId())
        if(currentUser && currentUser.employeeProfile && currentUser.employeeProfile.employment) {
            let currentUserPosition = currentUser.employeeProfile.employment.position

            let numPositionsSupervising = EntityObjects.find({
                    otype: 'Position',
                    $or: [{'properties.supervisor' : currentUserPosition},
                        {'properties.alternateSupervisor': currentUserPosition}],
                    businessId: Session.get('context')
                }).count()
            return (numPositionsSupervising > 0)
        }
    },
    isUserADirectSupervisor: function() {
        if (Meteor.users.findOne({directSupervisorId: Meteor.userId()})){
            return true;
        } else {
            return false;
        }
    },
    isUserABudgetHolder: function() {

        if (Template.instance().isBudgetHolder.get() === "TRUE"){
            return true;
        }else{
            return false;
        }
    },
    isUserATravelFinanceApprover: function() {
        if (Template.instance().isFinanceApprover.get() === "TRUE"){
            return true;
        }else{
            return false;
        }
    },
    hasTravelRequisitionApproveAccess: function () {
        let canApproveTrip = Core.hasTravelRequisitionApproveAccess(Meteor.userId());
        return canApproveTrip;
    },
    isAdvancedTravelEnabled: function () {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isAdvancedTravelEnabled
        } else {
            return false
        }
    },
    isTravelRequisitionActive: function () {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isTravelRequisitionActive
        } else {
            return false
        }
    },
    hasPayrollAccess: function () {
        return Core.hasPayrollAccess(Meteor.userId());
    },
    hasPayRulesManageAccess: function () {
        let hasPayrulesManageAccess = Core.hasPayRulesManageAccess(Meteor.userId());
        return hasPayrulesManageAccess;
    },

    hasRunPayrollManageAccess: function () {
        return Core.hasRunPayrollManageAccess(Meteor.userId());
    },
    hasPayrollAdditionalPaymentsManageAccess: function () {
        return Core.hasPayrollAdditionalPaymentsManageAccess(Meteor.userId());
    },
    hasPayrollResultsViewAccess: function () {
        return Core.hasPayrollResultsViewAccess(Meteor.userId());
    },
    hasPayrollApprovalConfigAccess: function () {
        return Core.hasPayrollApprovalConfigAccess(Meteor.userId());
    },
    // hasPayrollApprovalManageAccess: function () {
    //     return Core.hasPayrollApprovalManageAccess(Meteor.userId());
    // },

    hasPayrollReportsViewAccess: function () {
        let hasPayrollReportsViewAccess = Core.hasPayrollReportsViewAccess(Meteor.userId());
        return hasPayrollReportsViewAccess;
    },

        hasTravelReportsViewAccess: function () {
            let hasTravelReportsViewAccess = Core.hasTravelReportsViewAccess(Meteor.userId());
            return hasTravelReportsViewAccess;
        },
    hasAuditReportsViewAccess: function () {
        let hasAuditReportsViewAccess = Core.hasAuditReportsViewAccess(Meteor.userId());
        return hasAuditReportsViewAccess;
    },
    hasProcurementReportsViewAccess: function () {
        return Core.hasProcurementReportsViewAccess(Meteor.userId());
    },
    isSapBusinessOneIntegrationEnabled: () => {
      let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
      if(businessUnitCustomConfig) {
          return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isSapBusinessOneIntegrationEnabled
      } else {
          return true
      }
    },
    isSuccessfactorsEnabled: () => {
      let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
      if(businessUnitCustomConfig) {
          return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isSuccessFactorsIntegrationEnabled
      } else {
          return true
      }
    },
    isSapHanaEnabled: () => {
      let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
      if(businessUnitCustomConfig) {
          return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isSapHanaIntegrationEnabled
      } else {
          return true
      }
    },
    isLeaveRequestEnabled: () => {
      let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
      if(businessUnitCustomConfig) {
          return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isLeaveRequestActive
      } else {
          return true
      }
    },
    isTimeWritingEnabled: () => {
      let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
      if(businessUnitCustomConfig) {
          return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isTimeWritingActive
      } else {
          return true
      }
    },
    isNewTimeWritingEnabled: () => {
      let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
      if(businessUnitCustomConfig) {
          return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isNewTimeWritingEnabled
      } else {
          return true
      }
    },
    isTimeWritingReportsActive: () => {
      let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
      if(businessUnitCustomConfig) {
          return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isTimeWritingReportsActive
      } else {
          return true
      }
    },
    hasSuccessfactorsManageAccess: () => {
      return Core.hasSuccessfactorManagesAccess(Meteor.userId());
    },
    hasSapHanaManageAccess: () => {
      return Core.hasSapHanaManageAccess(Meteor.userId());
    },
    'payGradeLabel': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.payGradeLabel
        } else {
            return "Pay Grade"
        }
    },
    'payGradeLabelPlural': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.payGradeLabelPlural
        } else {
            return "Pay Grades"
        }
    },
    'canApprovePayroll': function() {
        let userId = Meteor.userId()
        let payrollApprovalConfig = Template.instance().payrollApprovalConfig.get()
        if(payrollApprovalConfig) {
            let approvers = payrollApprovalConfig.approvers
            if(approvers && approvers.length > 0) {
                let currentUserIsApprover = _.find(approvers, anApproverId => {
                    return anApproverId === userId
                })
                return (currentUserIsApprover) ? true : false
            }
        }
    },
    'isLeaveAccrualByEntitlement': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.leaveDaysAccrual === 'FixedLeaveEntitlement'
        }
    },
    'isTimeTypeEnabled': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isTimeTypeEnabled
        }
    },
    'isHmoSetupEnabled': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isHmoSetupEnabled
        }
    },
    'isLoanEnabled': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isLoanEnabled
        }
    },
    'showSideBarLinks': function() {
        return Session.get('context')
    },
    'isTravelBudgetsEnabled': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isTravelBudgetsEnabled
        }
    },
    'isTravelCitiesEnabled': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isTravelCitiesEnabled
        }
    },
    'isAirlinesEnabled': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isAirlinesEnabled
        }
    },
    'isAHotelsEnabled': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isAHotelsEnabled
        }
    },
    'isFlightRoutesEnabled': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isFlightRoutesEnabled
        }
    },
    'isEmailSettingsEnabled': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isEmailSettingsEnabled
        }
    }
});

Template.navigator.onCreated(function () {
    let self = this

    //--
    self.expandedMenu = new ReactiveVar()
    //--
    self.businessUnitCustomConfig = new ReactiveVar();
    self.payrollApprovalConfig = new ReactiveVar();

    self.isBudgetHolder = new ReactiveVar();
    self.isFinanceApprover = new ReactiveVar();

    self.subscribe("getPositions", Session.get('context'));


    self.autorun(function() {
        let businessUnitId = Session.get('context');

        let payrollApprovalConfigSub = self.subscribe('PayrollApprovalConfigs', businessUnitId);

        if(payrollApprovalConfigSub.ready()) {
            let payrollApprovalConfig = PayrollApprovalConfigs.findOne({businessId: businessUnitId})
            self.payrollApprovalConfig.set(payrollApprovalConfig)
        }

        Meteor.call('BusinessUnitCustomConfig/getConfig', businessUnitId, function(err, res) {
            if(!err) {
                // console.log()
                self.businessUnitCustomConfig.set(res)
            }
        })

        let budgetSub = self.subscribe("budgets", Session.get('context'));
        if (budgetSub.ready()){

            if (Budgets.findOne({employeeId: Meteor.userId()})){
                self.isBudgetHolder.set("TRUE");
            }else{
                self.isBudgetHolder.set("FALSE");
            }

            if (Budgets.findOne({financeApproverId: Meteor.userId()})){
                self.isFinanceApprover.set("TRUE");
            }else{
                self.isFinanceApprover.set("FALSE");
            }
        }
    })
});


Template.navigator.onRendered(function () {
    // Deps.autorun(function () {
    //     initAll();
    // });


   // Tooltip
//    $('.tooltips').tooltip({ container: 'body'});

//    //// Popover
//    //$('.popovers').popover();

//    // Show panel buttons when hovering panel heading
//    $('.panel-heading').hover(function() {
//       $(this).find('.panel-btns').fadeIn('fast');
//    }, function() {
//       $(this).find('.panel-btns').fadeOut('fast');
//    });

//    // Close Panel
//    $('.panel .panel-close').click(function() {
//       $(this).closest('.panel').fadeOut(200);
//       return false;
//    });

//    // Minimize Panel
//    $('.panel .panel-minimize').click(function(){
//       var t = $(this);
//       var p = t.closest('.panel');
//       if(!$(this).hasClass('maximize')) {
//          p.find('.panel-body, .panel-footer').slideUp(200);
//          t.addClass('maximize');
//          t.find('i').removeClass('fa-minus').addClass('fa-plus');
//          $(this).attr('data-original-title','Maximize Panel').tooltip();
//       } else {
//          p.find('.panel-body, .panel-footer').slideDown(200);
//          t.removeClass('maximize');
//          t.find('i').removeClass('fa-plus').addClass('fa-minus');
//          $(this).attr('data-original-title','Minimize Panel').tooltip();
//       }
//       return false;
//    });

//    $('.leftpanel .nav .parent > a').click(function() {

//       var coll = $(this).parents('.collapsed').length;

//       if (!coll) {
//          $('.leftpanel .nav .parent-focus').each(function() {
//             $(this).find('.children').slideUp('fast');
//             $(this).removeClass('parent-focus');
//          });

//          var child = $(this).parent().find('.children');
//          if(!child.is(':visible')) {
//             child.slideDown('fast');
//             if(!child.parent().hasClass('active'))
//                child.parent().addClass('parent-focus');
//          } else {
//             child.slideUp('fast');
//             child.parent().removeClass('parent-focus');
//          }
//       }
//       return false;
//    });


//    // Menu Toggle
//    $('.menu-collapse').click(function() {
//       if (!$('body').hasClass('hidden-left')) {
//          if ($('.headerwrapper').hasClass('collapsed')) {
//             $('.headerwrapper, .mainwrapper').removeClass('collapsed');
//          } else {
//             $('.headerwrapper, .mainwrapper').addClass('collapsed');
//             $('.children').hide(); // hide sub-menu if leave open
//          }
//       } else {
//          if (!$('body').hasClass('show-left')) {
//             $('body').addClass('show-left');
//          } else {
//             $('body').removeClass('show-left');
//          }
//       }
//       return false;
//    });

//    // Add class nav-hover to mene. Useful for viewing sub-menu
//    $('.leftpanel .nav li').hover(function(){
//       $(this).addClass('nav-hover');
//    }, function(){
//       $(this).removeClass('nav-hover');
//    });

//    // For Media Queries
//    $(window).resize(function() {
//       hideMenu();
//    });

//    hideMenu(); // for loading/refreshing the page
//    function hideMenu() {

//       if($('.header-right').css('position') == 'relative') {
//          $('body').addClass('hidden-left');
//          $('.headerwrapper, .mainwrapper').removeClass('collapsed');
//       } else {
//          $('body').removeClass('hidden-left');
//       }

//       // Seach form move to left
//       if ($(window).width() <= 360) {
//          if ($('.leftpanel .form-search').length == 0) {
//             $('.form-search').insertAfter($('.profile-left'));
//          }
//       } else {
//          if ($('.header-right .form-search').length == 0) {
//             $('.form-search').insertBefore($('.btn-group-notification'));
//          }
//       }
//    }

//    collapsedMenu(); // for loading/refreshing the page
//    function collapsedMenu() {

//       if($('.logo').css('position') == 'relative') {
//          $('.headerwrapper, .mainwrapper').addClass('collapsed');
//       } else {
//          $('.headerwrapper, .mainwrapper').removeClass('collapsed');
//       }
//    };
});
