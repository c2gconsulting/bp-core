// // const { default: axios } = require("axios");
// import axios from 'axios'
// import { Meteor } from 'meteor/meteor';

// function capitalize(str = ""){
//   let string = str.replace(/[_-]/g, " ");
//   string = string.toLowerCase().trim();
//   return string.slice(0, 1).toUpperCase() + string.slice(1)
// }

// var MyLogger = function (opts) {
//   console.log('Level', opts.level)
//   console.log('Message', opts.message)
//   console.log('Tag', opts.tag)
// }

// SyncedCron.config({
//   logger: MyLogger
// })

// const emailPolyfill = (eachLine) => eachLine.email || `${eachLine.lastname}.${eachLine.firstname}@OILSERVLTD-NG.COM`;

// const EmployeesPositions = (eachLine, otype) => ({
//   name: eachLine.positionDesc || "",
//   // parentId: "",
//   status: "Active",
//   otype: otype || "Position",
//     // allowedValues: ["Unit", "Position", "Job", "Location"]
//   businessId: "FYTbXLB9whRc4Lkh4", // FYTbXLB9whRc4Lkh4 - dev - FJe5hXSxCHvR2FBjJ
//   createdBy: 'woW5qkSL6vsma7Nan', // woW5qkSL6vsma7Nan - dev - ZAs6m3LLyZpS2p5K6
//   lastEditedBy: 'woW5qkSL6vsma7Nan', // woW5qkSL6vsma7Nan - dev - ZAs6m3LLyZpS2p5K6
//   properties: {
//     code: eachLine.positionId
//   },
//   // "successFactors": {},
//   _groupId: "gqEreTKe3h43z3q2R" // gqEreTKe3h43z3q2R - dev - QyPY7RY4Hc2dqZTem
// })

// const RestructureEmployee = (eachLine, password) => ({
//   "emails" : [
//     {
//       "address" : eachLine.email || "",
//       "verified" : false
//     }
//   ],
//   "profile" : {
//     "fullName" : `${eachLine.firstname} ${eachLine.lastname}`,
//     "firstname" : eachLine.firstname || "",
//     "lastname" : eachLine.lastname || ""
//   },
//   "employee" : true,
//   "employeeProfile" : {
//     "employeeId" : eachLine.employee_number || "",
//     "address" : "",
//     // "dateOfBirth" : ISODate("1973-05-04T00:00:00.000Z"),
//     "gender" : eachLine.gender || "",
//     "maritalStatus" : null,
//     "phone" : eachLine.phone || "",
//     "state" : "",
//     "photo" : null,
//     "guarantor" : {
//         "fullName" : null,
//         "email" : null,
//         "phone" : null,
//         "address" : null,
//         "city" : null,
//         "state" : null
//     },
//     "employment" : {
//       hireDate: new Date(),
//       terminationDate: null,
//       "position" : eachLine.positionId || "",
//       "status" : "Active"
//     },
//     "emergencyContact" : [ 
//       {
//         "name" : null,
//         "email" : null,
//         "phone" : null,
//         "address" : null,
//         "city" : null,
//         "state" : null
//       }
//     ],
//     "payment" : {
//       "paymentMethod" : "",
//       "bank" : "",//Fidelity Bank Plc
//       "accountNumber" : "",//4020169214
//       "accountName" : "",
//       "pensionmanager" : "",
//       "RSAPin" : "",
//       "taxPayerId" : ""
//     }
//   },
//   "salesProfile" : {
//     "salesAreas" : null
//   },
//   "roles" : {
//     "__global_roles__" : [ 
//       "ess/all"
//     ]
//   },
//   "services" : {
//     "password" : {
//       "bcrypt" : password || "$2a$10$PR3Sbybwr6LIuAVPOFCkX.4fAuizRt3Ttc0.60OMCQ0.ouRoYnpyW"
//     }
//   },
//   "businessIds" : [ 
//     "FYTbXLB9whRc4Lkh4" // FYTbXLB9whRc4Lkh4 - dev - FJe5hXSxCHvR2FBjJ
//   ],
//   "customUsername" :  `${capitalize(eachLine.firstname)}.${capitalize(eachLine.lastname)}` || "",
//   "_group" : "gqEreTKe3h43z3q2R", // gqEreTKe3h43z3q2R - dev - QyPY7RY4Hc2dqZTem
//   "group" : "gqEreTKe3h43z3q2R", // gqEreTKe3h43z3q2R - dev - QyPY7RY4Hc2dqZTem
//   "isUsingDefaultPassword" : true,
//   "positionId": eachLine.positionId || "",
//   "positionDesc": eachLine.positionDesc || "",
//   "lineManagerId": eachLine.lineManagerId || "",
//   "organizationalUnit": eachLine.organizationalUnit || "",
//   "hodPositionId": eachLine.hodPositionId || "",
//   "costCenterId": eachLine.costCenterId || ""
// })

// const RestructureWBS = (wbs, projectId) => ({
//   ...wbs,
//   code: wbs.wbs_number,
//   unitOrProjectId: projectId || wbs.unitOrProjectId,
//   fullcode: wbs.object_number,
//   manager: wbs.wbs_manager,
//   managerId: wbs.wbs_manager_number,
//   externalCode: wbs.external_wbs_number,
//   type: 'project',
//   businessId: "FYTbXLB9whRc4Lkh4", // FYTbXLB9whRc4Lkh4 - dev - FJe5hXSxCHvR2FBjJ
// })

// const RestructureProject = (eachLine) => ({
//   ...eachLine,
//   businessId: "FJe5hXSxCHvR2FBjJ", // FYTbXLB9whRc4Lkh4 - dev - FJe5hXSxCHvR2FBjJ
//   name: eachLine.description,
//   // activities: (eachLine.wbs && eachLine.wbs.lines.map(wbs => RestructureWBS(wbs))) || []
// })

// const importEmployees = (data) => {
//   const { Employees } = data;
//   Core.Log.info('CRON JOB IN ACTION: SET-BACK WHILE WE IMPORT THE EMPLOYEES DATA')
//   Employees.line.map((eachLine) => {
//     Core.Log.info(`CRON JOB IN ACTION: EMPLOYEE DATA FOR ${eachLine.lastname} ${eachLine.firstname}`)

//     const cleanData = {
//       ...eachLine,
//       email: emailPolyfill(eachLine).toLowerCase()
//     }

//     if (Meteor.isServer) {
//       let currentHashedPassword = Package.sha.SHA256('123456')
//       const user = RestructureEmployee(cleanData, currentHashedPassword)
//       /** CHECK IF USER ALREADY EXISTS AND UPDATE OR CREATE IF THEY DON"T */
//       const userFound = Meteor.users.findOne({ 'emails.address': user.emails[0].address })
//       // console.log('Meteor- user', JSON.stringify(userFound))

//       // Meteor.loginWithPassword('adesanmiakoladedotun@gmail.com', 'k.code1234', function(err){
//         const email = 'adesanmiakoladedotun@gmail.com'
//         const password = 'k.code1234'
//         let hashedPassword = Package.sha.SHA256(password)

// 				Meteor.call('account/customLoginWithEmail', email, hashedPassword, function(err, res) {
// 					if(err) {
//             console.log('account/customLoginWithEmail --ERROR', err)
// 						// $('div #login_error').removeClass('hide');
// 						// $('div #login_error').html(err.reason);
// 					} else {
//             console.log('account/customLoginWithEmail --RESPO', res)
// 						// $('div #login_error').addClass('hide');
// 						// $('div #login_error').html('');

// 						if(res.status === true) {

//               // if (userFound) {
//               //   Core.Log.info(`CRON JOB IN ACTION: UPDATING EMPLOYEE DATA FOR ${eachLine.lastname} ${eachLine.firstname}`)
//               //   Meteor.users.update({ customUsername: user.customUsername }, { $set: user })
//               //   // Meteor.call('account/create')
//               // } else {
//               //   Core.Log.info(`CRON JOB IN ACTION: CREATING EMPLOYEE DATA FOR ${eachLine.lastname} ${eachLine.firstname}`)
//               //   const accountId = Meteor.users.insert(user);
//               //   Accounts.setPassword(accountId, "123456");
//               //   Partitioner.setUserGroup(accountId, user.group);
//               // }

//               /** CHECK IF POSITION ALREADY EXISTS AND UPDATE OR CREATE IF THEY DON"T */
//               // Partitioner.directOperation(function() {
//               //   Partitioner.bindGroup(user.group, function() {
//               //     try {
//               //       const position = EmployeesPositions(eachLine);
//               //       Core.Log.info(`CRON JOB IN ACTION: UPDATING EntityObjects DATA FOR ${eachLine.lastname} ${eachLine.firstname}`)
//               //       const positionCondition = [{name: position.name}, { 'properties.code': position.properties.code }];
//               //       console.log('positionCondition', positionCondition)
//               //       const positionFound = EntityObjects.findOne({ name: position.name, 'properties.code': position.properties.code })
//               //       console.log('positionFound', positionFound)
//               //       if (positionFound) {
//               //         EntityObjects.update({ name: position.name, 'properties.code': position.properties.code }, { $set: position })
//               //       } else {
//               //         EntityObjects.insert(position)
//               //       }
//               //     } catch (error) {
//               //       console.log('EntityObjects ---error', error)
//               //     }
//               //   })
//               // })
//               // Meteor.call('entityObject/import', position, function (params) {
//               //   console.log('params', params)
//               // })

// 							Meteor.loginWithPassword(email, password, function(err){
// 								if (!err) {
// 									var currentRoute = Router.current().route.getName();
//                   // console.log('err', err)

// 									// if (currentRoute == "login") {
// 									// 		// Router.go("home");
// 									// } else {
// 									// 	console.log(`Current route is not login`)
// 									// }
// 								}
// 							})
// 						}
// 					}
// 				})
//       // /** CHECK IF POSITION ALREADY EXISTS AND UPDATE OR CREATE IF THEY DON"T */
//       // const orgUnit = EmployeesPositions(eachLine, 'Unit');
//       // const orgUnitCondition = [{name: orgUnit.name}, { 'properties.code': orgUnit.properties.code }];
//       // if (EntityObjects.find({ $and: orgUnitCondition })) {
//       //   EntityObjects.update({ $set: orgUnit })
//       // } else {
//       //   EntityObjects.insert(orgUnit)
//       // }
//     }
//   })
// }


// const importCostCenters = (data) => {
//   const { CostCenters: CostCenter } = data;
//   Core.Log.info('CRON JOB IN ACTION: SET-BACK WHILE WE IMPORT THE COSTCENTERS DATA')
//   CostCenter.line.map((eachLine) => {
//     Core.Log.info(`CRON JOB IN ACTION: COSTCENTER DATA FOR ${eachLine.cost_center_description}`)

//     const cleanData = {
//       ...eachLine,
//       name: eachLine.cost_center_general_name,
//       description: eachLine.cost_center_description
//     }

//     // if (Meteor.isServer) {
//     //   /** CHECK IF USER ALREADY EXISTS AND UPDATE OR CREATE IF THEY DON"T */
//     //   const user = RestructureEmployee(cleanData)
//     //   if (Meteor.users.findOne({ customUsername: user.customUsername })) {
//     //     Meteor.users.update({ $set: user })
//     //   } else {
//     //     Meteor.users.insert(user)
//     //   }
//     // }

//     if (Meteor.isServer) {
//       let currentHashedPassword = Package.sha.SHA256('123456')
//       /** CHECK IF USER ALREADY EXISTS AND UPDATE OR CREATE IF THEY DON"T */
//       const user = RestructureEmployee(cleanData, currentHashedPassword)
//       const email = 'adesanmiakoladedotun@gmail.com'
//       const password = 'k.code1234'
//       let hashedPassword = Package.sha.SHA256(password)

//       Meteor.call('account/customLoginWithEmail', email, hashedPassword, function(err, res) {
//         if(err) {
//           console.log('account/customLoginWithEmail --ERROR', err)
//         } else {
//           console.log('account/customLoginWithEmail --RESPO')

//           if(res.status === true) {


//             // try {
//               // Partitioner.directOperation(function() {
//               //   Partitioner.bindGroup(user._group, function() {
//                   try {
//                     const costCenter = {
//                       ...eachLine,
//                       name: eachLine.cost_center_general_name,
//                       description: eachLine.cost_center_description,
//                       businessId: "FJe5hXSxCHvR2FBjJ", // FYTbXLB9whRc4Lkh4 - dev - FJe5hXSxCHvR2FBjJ
//                     };
//                     console.log('costCenter', JSON.stringify(costCenter))
//                     const costCenterCondition = [{name: costCenter.name}, { costCenter: costCenter.cost_center }];
//                     console.log('costCenterCondition', JSON.stringify(costCenterCondition))
//                     const costCenterFound = CostCenters.findOne({ name: costCenter.name, cost_center: costCenter.cost_center })
//                     console.log('costCenterFound', JSON.stringify(costCenterFound))
//                     if (costCenterFound) {
//                       CostCenters.update({ $and: costCenterCondition }, { $set: costCenter })
//                     } else {
//                       CostCenters.insert(costCenter)
//                     }
//                   } catch (error) {
//                     console.log('CostCenters ---error', error)
//                   }
//               //   })
//               // })
//             // } catch (error) {
//             //   console.log('CostCenter -- Partitioner error', error)
//             // }
//             Meteor.loginWithPassword(email, password, function(err){
//               if (!err) {
//                 var currentRoute = Router.current().route.getName();
//               }
//             })
//           }
//         }
//       });
//     }
//   })
// }


// /**
//  * @description Import Projects and WBS - work breakdown structure
//  * @param {*} data 
//  */
// const importProjectsAndWBS = (data) => {
//   const { Projects: Project } = data;
//   Core.Log.info('CRON JOB IN ACTION: SET-BACK WHILE WE IMPORT THE PROJECTS DATA')
//   Project.line.map((eachLine) => {
//     Core.Log.info(`CRON JOB IN ACTION: PROJECT DATA FOR ${eachLine.description}`)

//     if (Meteor.isServer) {
//       let currentHashedPassword = Package.sha.SHA256('123456')
//       /** USER LOGIN */
//       const email = 'adesanmiakoladedotun@gmail.com'
//       const password = 'k.code1234'
//       let hashedPassword = Package.sha.SHA256(password)

//       Meteor.call('account/customLoginWithEmail', email, hashedPassword, function(err, res) {
//         if(err) {
//           console.log('account/customLoginWithEmail --ERROR', err)
//         } else {
//           console.log('account/customLoginWithEmail --RESPO')

//           if(res.status === true) {


//             try {
//               const user = RestructureEmployee(eachLine, currentHashedPassword);
//               Partitioner.directOperation(function() {
//                 Partitioner.bindGroup(user._group, function() {
//                   try {
//                     const project = RestructureProject(eachLine);
//                     console.log('project.wbs', JSON.stringify(project.activities))
//                     console.log('project', JSON.stringify(project))
//                     const projectCondition = [{name: project.name}, { project_number: project.project_number }];
//                     console.log('projectCondition', JSON.stringify(projectCondition))
//                     const projectFound = Projects.findOne({ name: project.name, project_number: project.project_number })
//                     console.log('projectFound', JSON.stringify(projectFound))
//                     if (projectFound) {
//                       const currentProject = Projects.update({ $and: projectCondition }, { $set: project })
//                       console.log('currentProject', currentProject);

//                       const { wbs: { lines } } = eachLine;

//                       lines.forEach(wbsline => {
//                         const wbs = RestructureWBS(wbsline, currentProject)
//                         const { externalCode } = wbs
//                         const currWBS = Activities.findOne({ unitOrProjectId: currentProject, externalCode })
//                         console.log('Current WBS UPDATE', currWBS)
//                         if (currWBS) Activities.update({ unitOrProjectId: currentProject, externalCode }, { $set: wbs })
//                         else Activities.insert(wbs)
//                         return wbsline
//                       });
//                       // project.activities.map()
//                     } else {
//                       const currentProject = Projects.insert(project)
//                       console.log('currentProject', currentProject)

//                       const { wbs: { lines } } = eachLine;

//                       lines.forEach(wbsline => {
//                         const wbs = RestructureWBS(wbsline, currentProject)
//                         if(wbsline) Activities.insert(wbs)
//                         return wbsline
//                       });

//                     }
//                   } catch (error) {
//                     console.log('Projects ---error', error)
//                   }
//                 })
//               })
//             } catch (error) {
//               console.log('Project -- Partitioner error', error)
//             }
//             Meteor.loginWithPassword(email, password, function(err){
//               if (!err) {
//                 var currentRoute = Router.current().route.getName();
//               }
//             })
//           }
//         }
//       });
//     }
//   })
// }









// Meteor.startup(function () {
//     Core.Log.info('Startup ::: EMPLOYEES CRON JOB IN ACTION')
//     if (Meteor.isServer) {
//       /** BEGIN::: EMPLOYEES IMPORT */
//       axios
//       .post(
//         'http://20.73.168.4:50000/RESTAdapter/employees',
//         {
//           employee_number: ''
//         },
//         {
//           headers: {
//             Authorization: 'Basic QlVMS1BBWV9ERVY6UGFzc3cwcmQlJQ==',
//             'Content-Type': 'application/json',
//             Cookie:
//               'JSESSIONID=5kfVra385oH81KSzlcgDQcm930NrfAHCeEwA_SAP8i4nHR_PRsyEcufSUvz4_frw; saplb_*=(J2EE5011620)5011650'
//           },
//           proxy: { protocol: 'http',host: '20.73.168.4',port: 50000 }
//         }
//       )
//       .then(function (response) {
//         // handle success
//         console.log(JSON.stringify(response.data))
//         const { data } =  response;
//         importEmployees(data)
//         // const { Employees: { line } }
//       })
//       .catch(function (error) {
//         // handle error
//         console.log(error)
//       })
//       .then(function () {
//         console.log('err')
//         // always executed
//       })
//     /** END::: EMPLOYEES IMPORT */
  
  
  
  
//     /** BEGIN::: COST CENTERS IMPORT */
//       axios
//       .post(
//         'http://20.73.168.4:50000/RESTAdapter/costcenters',
//         {
//           employee_number: ''
//         },
//         {
//           headers: {
//             Authorization: 'Basic QlVMS1BBWV9ERVY6UGFzc3cwcmQlJQ==',
//             'Content-Type': 'application/json',
//             Cookie:
//               'JSESSIONID=5kfVra385oH81KSzlcgDQcm930NrfAHCeEwA_SAP8i4nHR_PRsyEcufSUvz4_frw; saplb_*=(J2EE5011620)5011650'
//           },
//           proxy: { protocol: 'http',host: '20.73.168.4',port: 50000 }
//         }
//       )
//       .then(function (response) {
//         // handle success
//         console.log(JSON.stringify(response.data))
//         const { data } =  response;
//         importCostCenters(data)
//       })
//       .catch(function (error) {
//         // handle error
//         console.log(error)
//       })
//       .then(function () {
//         console.log('err')
//         // always executed
//       })
//     /** END::: COST CENTERS IMPORT */
  
  
  
//       /** BEGIN::: EMPLOYEES IMPORT */
//       axios
//       .post(
//         'http://20.73.168.4:50000/RESTAdapter/projects',
//         {
//           employee_number: ''
//         },
//         {
//           headers: {
//             Authorization: 'Basic QlVMS1BBWV9ERVY6UGFzc3cwcmQlJQ==',
//             'Content-Type': 'application/json',
//             Cookie:
//               'JSESSIONID=5kfVra385oH81KSzlcgDQcm930NrfAHCeEwA_SAP8i4nHR_PRsyEcufSUvz4_frw; saplb_*=(J2EE5011620)5011650'
//           },
//           proxy: { protocol: 'http',host: '20.73.168.4',port: 50000 }
//         }
//       )
//       .then(function (response) {
//         // handle success
//         console.log(JSON.stringify(response.data))
//         const { data } =  response;
//         importProjectsAndWBS(data)
//         // const { Employees: { line } }
//       })
//       .catch(function (error) {
//         // handle error
//         console.log(error)
//       })
//       .then(function () {
//         console.log('err')
//         // always executed
//       })
//     /** END::: EMPLOYEES IMPORT */
//     }
//     // Core.fixPartitionProblems();
// });
  


// SyncedCron.add({
//   name: 'WEEKEND\'S CRON JOB SCHEDULE FOR EMPLOYEES',
//   schedule: function (parser) {
//     // parser is a later.parse object

//     console.log('every 5 mins every weekend')
//     // const now = new Date();
//     // return parser.recur().on(new Date()).fullDate();
//     // return parser.cron(`${ now.getMinutes() } ${ now.getHours() } * * *`);
//     return parser.recur().on(0, 8, 20).hour().onWeekend();
//     // return parser.text('every 1 mins')
//     // return parser.text('every 5 mins every weekend')
//   },
//   job: function () {
//     Core.Log.info('EMPLOYEES CRON JOB IN ACTION')

//     // axios
//     //   .post(
//     //     'http://20.73.168.4:50000/RESTAdapter/employees',
//     //     {
//     //       employee_number: ''
//     //     },
//     //     {
//     //       headers: {
//     //         Authorization: 'Basic QlVMS1BBWV9ERVY6UGFzc3cwcmQlJQ==',
//     //         'Content-Type': 'application/json',
//     //         Cookie:
//     //           'JSESSIONID=5kfVra385oH81KSzlcgDQcm930NrfAHCeEwA_SAP8i4nHR_PRsyEcufSUvz4_frw; saplb_*=(J2EE5011620)5011650'
//     //       },
//     //       proxy: { protocol: 'http',host: '20.73.168.4',port: 50000 }
//     //     }
//     //   )
//     //   .then(function (response) {
//     //     // handle success
//     //     console.log(JSON.stringify(response.data))
//     //     const { data } =  response;
//     //     importEmployees(data)
//     //     // const { Employees: { line } }
//     //   })
//     //   .catch(function (error) {
//     //     // handle error
//     //     console.log(error)
//     //   })
//     //   .then(function () {
//     //     // always executed
//     //   })
//   }
// })












// "TRIPREQUEST/budgetHolderApprovals": function(currentTravelRequest){
//     if (!this.userId && Core.hasPayrollAccess(this.userId)){
//       throw new Meteor.Error(401, "Unauthorized");
//     }

//     check(currentTravelRequest.businessId, String);
//     this.unblock()
//     /**
//      * IF trip mode is Air, should go through normal stages of approval
//      * ELSE should skip couple of approvals (GCOO and GCEO respectively) then go to logistics
//      */
//      const fetchUser = (conditions, position, skipApprovalTillApprovedByBudgetHolder) => {
//       if (skipApprovalTillApprovedByBudgetHolder) return "";
//       const dPosition = position || 'HOD';
//       const isPartOfApprovalFlow = Core.getApprovalConfig(dPosition, currentTravelRequest)
//       if (position && !isPartOfApprovalFlow) return ""
//       const fetchedUser = Meteor.users.findOne(conditions);
//       if (fetchedUser) return fetchedUser._id;
//       return ''
//     }

//     // currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
//     const currentUser = Meteor.users.findOne(currentTravelRequest.createdBy);
//     const {
//       hodOrSupervisorCond, managerCond, GcooCond, GceoCond, bstCond, logisticCond, financeCond, securityCond
//     } = Core.getApprovalQueries(currentUser, currentTravelRequest);

//     const { directSupervisorId, managerId, _id, positionId } = currentUser
//     const userId = _id || Meteor.userId()
//     currentTravelRequest.supervisorId = directSupervisorId || fetchUser(hodOrSupervisorCond, Core.Approvals.HOD)
//     currentTravelRequest.managerId = managerId || fetchUser(managerCond, Core.Approvals.MD)
//     currentTravelRequest.gcooId = fetchUser(GcooCond, Core.Approvals.GCOO)
//     currentTravelRequest.gceoId = fetchUser(GceoCond, Core.Approvals.GCEO)
//     currentTravelRequest.bstId = fetchUser(bstCond, Core.Approvals.BST)
//     currentTravelRequest.logisticsId = fetchUser(logisticCond, Core.Approvals.LOGISTICS)
//     currentTravelRequest.financeApproverId = fetchUser(financeCond, Core.Approvals.FINANCE)
//     currentTravelRequest.securityId = fetchUser(securityCond, Core.Approvals.SECURITY)

//     let budgetCode = Budgets.findOne({ businessId: currentTravelRequest.businessId });
//     console.log('budgetCode', budgetCode);
//     if (budgetCode){
//       currentTravelRequest.budgetCodeId = budgetCode._id
//       currentTravelRequest.budgetHolderId = budgetCode.employeeId;
//       // currentTravelRequest.financeApproverId = budgetCode.financeApproverId;
//     }

//     let isTopLevelUser = Core.hasApprovalLevel();
//     let approvalLevel, currentPosition, tripByAir;
//     if (isTopLevelUser) approvalLevel = Core.hasApprovalLevel(currentTravelRequest, true);
//     if (approvalLevel) currentPosition = approvalLevel.currentPosition;
//     for (let i = 0; i < currentTravelRequest.trips.length; i++) {
//       const trip = currentTravelRequest.trips[i];
//       if (trip.transportationMode === 'AIR') tripByAir = true
//     }
//     const { destinationType } = currentTravelRequest;
//     const isInternationalTrip = destinationType === 'International';
//     if (currentPosition) {
//       if(currentPosition == 'HOD' && tripByAir) currentPosition = "MD"
//       if(currentPosition == 'HOD' && !tripByAir) currentPosition = "BST"

//       if(currentPosition == 'MD' && tripByAir) currentPosition = "GCOO"
//       if(currentPosition == 'MD' && !tripByAir) currentPosition = "BST"

//       if(currentPosition == 'GCOO' && isInternationalTrip) currentPosition = "GCEO"
//       if(currentPosition == 'GCOO' && !isInternationalTrip) currentPosition = "BST"

//       if(currentPosition == 'GCEO') currentPosition = "BST"
//       if(currentPosition == 'GCEO') currentPosition = "BST"
//     }
//     if (!currentPosition && tripByAir) currentPosition = "MD";
//     if (!currentPosition && !tripByAir) currentPosition = "BST";

//     let nextUserApprovalId = "", nextUserApproval = "";
//     if (currentPosition) nextUserApprovalId = `${currentPosition.toLowerCase()}Id`;

//     if(currentTravelRequest._id){
//       TravelRequisition2s.update(currentTravelRequest._id, {$set: currentTravelRequest})

//       let otherPartiesEmail = "bulkpay@c2gconsulting.com";

//       const createdBy = Meteor.users.findOne(currentTravelRequest.createdBy);
//       const nextUserApproval = Meteor.users.findOne(nextUserApprovalId);
//       const budgetHolder = Meteor.users.findOne(currentTravelRequest.budgetHolderId);
//       let createdByEmail = "";
//       let nextUserApprovalEmail = "";
//       let createdByName = "Employee"
//       let nextUserApprovalName = "Supervisor"
//       let budgetHolderEmail = "";
//       let budgetHolderName = "Budget Holder"
//       let createdBySubject = "";
//       let supervisorSubject = "";
//       const bookingAgentSubject = "Process ticket booking for " + createdBy.profile.fullName + "'s travel request";
//       const securityDeptSubject = "Process security for " + createdBy.profile.fullName + "'s travel request";
//       let nextUserApprovalSubject = "Please approve travel request for " + createdBy.profile.fullName;
//       if (currentPosition === "BST") {
//         nextUserApprovalSubject = "Please approve travel request for " + createdBy.profile.fullName;
//       }


//       if(currentTravelRequest.status === "Approved By Budget Holder"){
//         createdBySubject = "Budget Holder: " + budgetHolder.profile.fullName + " has approved your travel request";
//         budgetHolderSubject = "You have approved " + createdBy.profile.fullName + "'s travel request";
//       } else {
//         createdBySubject = "Budget Holder: " + budgetHolder.profile.fullName + " has rejected your travel request";
//         budgetHolderSubject = "You have rejected " + createdBy.profile.fullName + "'s travel request";
//       }
//       if (createdBy.emails.length > 0){
//         createdByEmail = createdBy.emails[0].address;
//         createdByEmail = createdByEmail + "," + otherPartiesEmail;
//         console.log(createdByEmail);
//       }

//       const { tripFor } = currentTravelRequest;
//       if (tripFor && tripFor.individuals && tripFor.individuals.length) {
//         const individuals = tripFor;
//         //  Send Notification to other individual going on this trip
//         createdByEmail = createdByEmail + individuals.reduce((prev, curr) => prev + ',' + curr.email, '');
//       }

//       if (budgetHolder.emails.length > 0){
//         budgetHolderEmail = budgetHolder.emails[0].address;
//         budgetHolderEmail = budgetHolderEmail + "," + otherPartiesEmail;
//         console.log(budgetHolderEmail);
//       }

//       if (nextUserApproval, nextUserApproval.emails.length > 0){
//         nextUserApprovalEmail = nextUserApproval.emails[0].address;
//         nextUserApprovalEmail = nextUserApprovalEmail  + ", bulkpay@c2gconsulting.com";
//         console.log(nextUserApprovalEmail);
//       }

//       //Send to requestor
//       TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, createdByEmail, createdBySubject);

//       //Send to Budget holder
//       TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, budgetHolderEmail, budgetHolderSubject);

//       if (currentTravelRequest.status === "Approved By Budget Holder") {
//         //Send to nextUserApproval
//         TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, nextUserApprovalEmail, nextUserApprovalSubject);

//         // Send to booking agent if it's approved by budgetHolder
//         if (bookingAgentEmail) {
//           TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, bookingAgentEmail, bookingAgentSubject, 'booking agent');
//         }
//         // Send to security dept if requested and approved by budgetHolder
//         if (trips.length > 0 && securityDeptSubject) {
//           for (let t = 0; t < trips.length; t++) {
//             const { provideSecurity } = trips[t];
//             if (provideSecurity) {
//               TravelRequestHelper.sendTravelRequestEmail(currentTravelRequest, securityDeptEmail, securityDeptSubject);
//             }
//           }
//         }
//       }

//     } else {
//       let result = TravelRequisition2s.insert(currentTravelRequest);
//     }
//     return true;