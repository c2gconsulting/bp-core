Core.getOtherSubscribedParties = (businessId, department) => {
  // const bookingAget = 'Booking';// department
  const emailSettings = EmailSettings._collection
    .find({
      businessId,
      department: { $regex: `${department}`, $options: "i" },
    })
    .fetch();
  let emails = "";
  for (let i = 0; i < emailSettings.length; i++) {
    const element = emailSettings[i];
    const comma = emails ? ", " : "";
    emails += element.email + comma;
  }
  return emails;
};

const fetchUsers = (conditions) => {
  const fetchedUsers = Meteor.users.find(conditions);
  if (fetchedUsers) return fetchedUsers;
  return [];
};

const getJustUserEmail = (userData) => {
  if (userData && userData.emails.length > 0) {
    console.log(userData.emails[0].address);
    return "" + userData.emails[0].address;
  }
};

const fetchOtherUsers = (fetchedUser, conditions) => {
  let assignedFullName, otherUserEmails;
  if (fetchedUser) {
    const getRecords = (records) => records.map(record => record._id);
    const getRecordName = (records) => (records.map(record => record.profile && record.profile.fullName) || []).join(', ');
    const records = Array.isArray(fetchedUser) ? getRecords(fetchedUser) : fetchedUser._id;
    const filter = Core.queryUsersExcept(records, conditions);
    const otherUsers = fetchUsers(filter);
    if (otherUsers) {
      otherUserEmails = otherUsers.map((otherUser) =>
        getJustUserEmail(otherUser)
      );
      console.log("otherUserEmails", otherUserEmails);
      assignedFullName = Array.isArray(fetchedUser) ? getRecordName(fetchedUser) : (fetchedUser.profile && fetchedUser.profile.fullName);
    }
  }
  return { assignedFullName, otherUserEmails };
};

const getUsers = (recordIds) => {
  console.log('recordIds', recordIds);
  let records;
  if (recordIds) {
    records = Meteor.users.find({ "_id": { "$in": recordIds }  }).fetch();
    // recordIds = records.map(record => record.profile);
    console.log('records', records);
  }

  return records
}

const supportmail = "aadesanmi@c2gconsulting.com, trips@oilservltd-ng.com, cokhiade@c2gconsulting.com";
/**
 * @description Send Approval mail
 * @param {*} currentTravelRequest
 * @param {*} TravelRequestHelper
 * @param {*} receiverID
 * @param {*} nextUserID
 */
Core.sendApprovalMail = (
  currentTravelRequest,
  TravelRequestHelper,
  receiverID,
  nextUserID
) => {
  let otherPartiesEmail =
    "bulkpay@c2gconsulting.com" + supportmail
      ? `, ${supportmail}`
      : supportmail;
  const defaultUserData = { profile: {}, emails: [{ address: '' }] };

  const createdBy =
    Meteor.users.findOne(currentTravelRequest.createdBy) || defaultUserData;
  const pm = 
    Meteor.users.findOne(currentTravelRequest.pmId) || defaultUserData;
  const hoc = 
    Meteor.users.findOne(currentTravelRequest.hocId) || defaultUserData;
  const supervisor =
    Meteor.users.findOne(currentTravelRequest.supervisorId) || defaultUserData;
  const budgetHolder =
    Meteor.users.findOne(currentTravelRequest.budgetHolderId) ||
    defaultUserData;
  let externalBudgetBodies = Budgets.findOne({ businessId: currentTravelRequest.businessId });
  const { externalNotificationEmail } = externalBudgetBodies || { externalNotificationEmail: "" };
  const manager =
    Meteor.users.findOne(currentTravelRequest.managerId) || defaultUserData;
  const gcoo =
    Meteor.users.findOne(currentTravelRequest.gcooId) || defaultUserData;
  const gceo =
    Meteor.users.findOne(currentTravelRequest.gceoId) || defaultUserData;

  const bsts = getUsers(currentTravelRequest.bstIds) || [defaultUserData];
  console.log('bsts', bsts)
  console.log('currentTravelRequest.bstIds', currentTravelRequest.bstIds)
  const logistics = getUsers(currentTravelRequest.logisticsIds) || [defaultUserData];
  console.log('logistics', logistics)
  console.log('currentTravelRequest.logisticsIds', currentTravelRequest.logisticsIds)
  const securities = getUsers(currentTravelRequest.securityIds) || [defaultUserData];
  console.log('securities', securities)
  console.log('currentTravelRequest.securityIds', currentTravelRequest.securityIds)
  // const bst =
  //   Meteor.users.findOne(currentTravelRequest.bstId) || defaultUserData;
  // const logistics =
  //   Meteor.users.findOne(currentTravelRequest.logisticsId) || defaultUserData;

  const { businessId } = currentTravelRequest;
  const bookingAgentEmail = Core.getOtherSubscribedParties(
    businessId,
    "Booking"
  );
  const securityDeptEmail = Core.getOtherSubscribedParties(
    businessId,
    "Security"
  );
  let createdByEmail = "";
  let supervisorEmail = "";
  let pmEmail = "";
  let hocEmail = "";
  let budgetHolderEmail = "";
  let managerEmail = "";
  let gcooEmail = "";
  let gceoEmail = "";
  let bstEmail = "";
  let bstEmails = "";
  let logisticsEmail = "";
  let logisticsEmails = "";
  let securitiesEmail = "";
  let securitiesEmails = "";

  let createdByName = "Employee";
  let supervisorName = "Supervisor";
  let budgetHolderName = "Budget Holder";
  let managerName = "Managing Director";
  let gcooName = "GCOO";
  let gceoName = "GCEO";
  let bstName = "BST";
  let logisticsName = "LOGISTICS";

  let otherUserSubject = "Travel request process for ";
  let bookingAgentSubject =
    "Ticket booking for " + createdBy.profile.fullName + "'s travel request";
  let securityDeptSubject =
    "Security Notification for " +
    createdBy.profile.fullName +
    "'s travel request";
  let createdBySubject = "New travel request for " + createdBy.profile.fullName;
  let pmSubject =
    "Please approve travel request for " + createdBy.profile.fullName;
  let hocSubject =
    "Please approve travel request for " + createdBy.profile.fullName;
  let supervisorSubject =
    "Please approve travel request for " + createdBy.profile.fullName;
  let budgetHolderSubject =
    "Please approve travel request for " + createdBy.profile.fullName;
  let managerSubject =
    "Please approve travel request for " + createdBy.profile.fullName;
  let gcooSubject =
    "Please approve travel request for " + createdBy.profile.fullName;
  let gceoSubject =
    "Please approve travel request for " + createdBy.profile.fullName;
  let bstSubject =
    "Please process travel request for " + createdBy.profile.fullName;
  let logisticsSubject =
    "Please process travel request for " + createdBy.profile.fullName;
  let securitiesSubject =
    "Please review the travel request security  for " + createdBy.profile.fullName;

  const { bstCond, logisticCond, financeCond, securityCond } =
    Core.getApprovalQueries(createdBy);

  const {
    APPROVED_BY_PM,
    REJECTED_BY_PM,
    APPROVED_BY_HOC,
    REJECTED_BY_HOC,
    APPROVED_BY_HOD,
    REJECTED_BY_HOD,
    APPROVED_BY_BUDGETHOLDER,
    REJECTED_BY_BUDGETHOLDER,
    APPROVED_BY_MD,
    REJECTED_BY_MD,
    APPROVED_BY_GCOO,
    REJECTED_BY_GCOO,
    APPROVED_BY_GCEO,
    REJECTED_BY_GCEO,
    PROCESSED_BY_BST,
    PROCESSED_BY_LOGISTICS,
  } = Core.ALL_TRAVEL_STATUS;

  const {
    PM,
    HOC,
    HOD,
    BUDGETHOLDER,
    MD,
    GCOO,
    GCEO,
    BST,
    LOGISTICS,
    FINANCE,
    SECURITY,
  } = Core.Approvals;

  // JUST APPROVED BY:
  const isBUDGETHOLDER = receiverID === BUDGETHOLDER;
  const isPM = receiverID === PM;
  const isHOC = receiverID === HOC;
  const isHOD = receiverID === HOD;
  const isMD = receiverID === MD;
  const isGCOO = receiverID === GCOO;
  const isGCEO = receiverID === GCEO;
  const isBST = receiverID === BST;
  const isLOGISTICS = receiverID === LOGISTICS;

  // NEXT APPROVAL BY:
  const nextBUDGETHOLDER = nextUserID === BUDGETHOLDER;
  const nextPM = nextUserID === PM;
  const nextHOC = nextUserID === HOC;
  const nextHOD = nextUserID === HOD;
  const nextMD = nextUserID === MD;
  const nextGCOO = nextUserID === GCOO;
  const nextGCEO = nextUserID === GCEO;
  const nextBST = nextUserID === BST;
  const nextLOGISTICS = nextUserID === LOGISTICS;

  if (
    isBUDGETHOLDER &&
    currentTravelRequest.status === APPROVED_BY_BUDGETHOLDER
  ) {
    createdBySubject =
      `${BUDGETHOLDER}: ` +
      budgetHolder.profile.fullName +
      " has approved your travel request";
    budgetHolderSubject =
      "You have approved " + createdBy.profile.fullName + "'s travel request";
  }

  if (isPM && currentTravelRequest.status === APPROVED_BY_PM) {
    createdBySubject =
      `${PM}: ` +
      pm.profile.fullName +
      " has approved your travel request";
    pmSubject =
      "You have approved " + createdBy.profile.fullName + "'s travel request";
  }

  if (isHOC && currentTravelRequest.status === APPROVED_BY_HOC) {
    createdBySubject =
      `${HOD}: ` +
      hoc.profile.fullName +
      " has approved your travel request";
    hocSubject =
      "You have approved " + createdBy.profile.fullName + "'s travel request";
  }

  if (isHOD && currentTravelRequest.status === APPROVED_BY_HOD) {
    createdBySubject =
      `${HOD}: ` +
      supervisor.profile.fullName +
      " has approved your travel request";
    supervisorSubject =
      "You have approved " + createdBy.profile.fullName + "'s travel request";
  }

  if (isMD && currentTravelRequest.status === APPROVED_BY_MD) {
    createdBySubject =
      `${MD}: ` +
      manager.profile.fullName +
      " has approved your travel request";
    managerSubject =
      "You have approved " + createdBy.profile.fullName + "'s travel request";
  }

  if (isGCOO && currentTravelRequest.status === APPROVED_BY_GCOO) {
    createdBySubject =
      `${GCOO}: ` + gcoo.profile.fullName + " has approved your travel request";
    gcooSubject =
      "You have approved " + createdBy.profile.fullName + "'s travel request";
  }

  if (isGCEO && currentTravelRequest.status === APPROVED_BY_GCEO) {
    createdBySubject =
      `${GCEO}: ` + gceo.profile.fullName + " has approved your travel request";
    gceoSubject =
      "You have approved " + createdBy.profile.fullName + "'s travel request";
  }

  if (isBST && currentTravelRequest.status === PROCESSED_BY_BST) {
    // createdBySubject =
    //   `${BST}: ` + bst.profile.fullName + " has processed your travel request";
    const bstGuy = Meteor.user();
    const getBstGuyName = () => (bstGuy && bstGuy.profile && bstGuy.profile.fullName) || '';

    createdBySubject =
      `${BST}: ` + getBstGuyName() + " has processed your travel request";
    bstSubject =
      "You have processed " + createdBy.profile.fullName + "'s travel request";
  }

  if (isLOGISTICS && currentTravelRequest.status === PROCESSED_BY_LOGISTICS) {
    // createdBySubject =
    //   `${LOGISTICS}: ` + logistics.profile.fullName + " has processed your travel request";
    const logGuy = Meteor.user();
    const getLogGuyName = () => (logGuy && logGuy.profile && logGuy.profile.fullName) || '';

    createdBySubject =
      `${LOGISTICS}: ` + getLogGuyName() + " has processed your travel request";

    logisticsSubject =
      "You have processed " + createdBy.profile.fullName + "'s travel request";
  }

  // REJECTION SUBJECTS
  // BUDGET HOLDER
  if (
    isBUDGETHOLDER &&
    currentTravelRequest.status === REJECTED_BY_BUDGETHOLDER
  ) {
    createdBySubject =
      `${BUDGETHOLDER}: ` +
      budgetHolder.profile.fullName +
      " has rejected your travel request";
    budgetHolderSubject =
      "You have rejected " + createdBy.profile.fullName + "'s travel request";
  }

  // PM
  if (isPM && currentTravelRequest.status === REJECTED_BY_PM) {
    createdBySubject =
      `${PM}: ` +
      pm.profile.fullName +
      " has rejected your travel request";
    pmSubject =
      "You have rejected " + createdBy.profile.fullName + "'s travel request";
  }
  if (isHOC && currentTravelRequest.status === REJECTED_BY_HOC) {
    createdBySubject =
      `${HOD}: ` +
      hoc.profile.fullName +
      " has rejected your travel request";
    hocSubject =
      "You have rejected " + createdBy.profile.fullName + "'s travel request";
  }
  // HOD
  if (isHOD && currentTravelRequest.status === REJECTED_BY_HOD) {
    createdBySubject =
      `${HOD}: ` +
      supervisor.profile.fullName +
      " has rejected your travel request";
    supervisorSubject =
      "You have rejected " + createdBy.profile.fullName + "'s travel request";
  }
  // MD
  if (isMD && currentTravelRequest.status === REJECTED_BY_MD) {
    createdBySubject =
      `${MD}: ` +
      manager.profile.fullName +
      " has rejected your travel request";
    managerSubject =
      "You have rejected " + createdBy.profile.fullName + "'s travel request";
  }
  // GCOO
  if (isGCOO && currentTravelRequest.status === REJECTED_BY_GCOO) {
    createdBySubject =
      `${GCOO}: ` + gcoo.profile.fullName + " has rejected your travel request";
    gcooSubject =
      "You have rejected " + createdBy.profile.fullName + "'s travel request";
  }
  // GCEO
  if (isGCEO && currentTravelRequest.status === REJECTED_BY_GCEO) {
    createdBySubject =
      `${GCEO}: ` + gceo.profile.fullName + " has rejected your travel request";
    gceoSubject =
      "You have rejected " + createdBy.profile.fullName + "'s travel request";
  }
  // END OF REJECTION SUBJECTS

  if (createdBy.emails.length > 0) {
    createdByEmail = createdBy.emails[0].address;
    createdByEmail = createdByEmail + "," + otherPartiesEmail;
    console.log(createdByEmail);
  }

  const { tripFor } = currentTravelRequest;
  if (tripFor && tripFor.individuals && tripFor.individuals.length) {
    const { individuals } = tripFor;
    //  Send Notification to other individual going on this trip
    createdByEmail =
      createdByEmail +
      individuals.reduce((prev, curr) => prev + "," + curr.email, "");
  }

  if ((isBUDGETHOLDER || nextBUDGETHOLDER) && budgetHolder.emails.length > 0) {
    budgetHolderEmail = budgetHolder.emails[0].address;
    budgetHolderEmail =
      budgetHolderEmail +
      "," +
      otherPartiesEmail +
      "," +
      externalNotificationEmail;
    console.log(budgetHolderEmail);
  }

  if ((isPM || nextPM) && pm.emails.length > 0) {
    pmEmail = pm.emails[0].address;
    pmEmail = pmEmail + "," + otherPartiesEmail;
    console.log('pmEmail', pmEmail);
  }

  if ((isHOC || nextHOC) && hoc.emails.length > 0) {
    hocEmail = hoc.emails[0].address;
    hocEmail = hocEmail + "," + otherPartiesEmail;
    console.log('hocEmail', hocEmail);
  }

  if ((isHOD || nextHOD) && supervisor.emails.length > 0) {
    supervisorEmail = supervisor.emails[0].address;
    supervisorEmail = supervisorEmail + "," + otherPartiesEmail;
    console.log('supervisorEmail', supervisorEmail);
  }

  if ((isMD || nextMD) && manager.emails.length > 0) {
    managerEmail = manager.emails[0].address;
    managerEmail = managerEmail + "," + otherPartiesEmail;
    console.log('managerEmail', managerEmail);
  }

  if ((isGCOO || nextGCOO) && gcoo.emails.length > 0) {
    gcooEmail = gcoo.emails[0].address;
    gcooEmail = gcooEmail + "," + otherPartiesEmail;
    console.log('gcooEmail', gcooEmail);
  }

  if ((isGCEO || nextGCEO) && gceo.emails.length > 0) {
    gceoEmail = gceo.emails[0].address;
    gceoEmail = gceoEmail + "," + otherPartiesEmail;
    console.log('gceoEmail', gceoEmail);
  }

  if ((isBST || nextBST) && bsts.length && bsts[0].emails.length > 0) {
    bstEmails = bsts.map(bst => bst.emails && bst.emails[0].address);
    bstEmails = bstEmails + "," + otherPartiesEmail;
    if (securities.length && securities[0] && securities[0].emails.length > 0) {
      securitiesEmails = securities.map(security => security.emails && security.emails[0].address);
      securitiesEmails = securitiesEmails + "," + otherPartiesEmail;
      console.log('bst- securitiesEmails', securitiesEmails);
    }
    console.log('bstEmails', bstEmails);
  }

  if ((isLOGISTICS || nextLOGISTICS) && logistics.length && logistics[0].emails.length > 0) {
    // logisticsEmail = logistics.emails[0].address;
    logisticsEmails = logistics.map(logistic => logistic.emails && logistic.emails[0].address);
    logisticsEmails = logisticsEmails + "," + otherPartiesEmail;
    if (securities.length && securities[0] && securities[0].emails.length > 0) {
      securitiesEmails = securities.map(security => security.emails && security.emails[0].address);
      securitiesEmails = securitiesEmails + "," + otherPartiesEmail;
      console.log('logistic- securitiesEmails', securitiesEmails);
    }
    console.log('logisticsEmails', logisticsEmails);
  }

  //Send to requestor
  TravelRequestHelper.sendTravelRequestEmail(
    currentTravelRequest,
    createdByEmail,
    createdBySubject
  );

  //Send to Budegt Holder
  if (isBUDGETHOLDER || nextBUDGETHOLDER) {
    console.log("Email To: BUDGETHOLDER", budgetHolderEmail);
    console.log("budgetHolderSubject: ", budgetHolderSubject);
    TravelRequestHelper.sendTravelRequestEmail(
      currentTravelRequest,
      budgetHolderEmail,
      budgetHolderSubject
    );
  }

  //Send to PM
  if (isPM || nextPM) {
    console.log("Email To: PM", pmEmail);
    console.log("pmSubject: ", pmSubject);
    TravelRequestHelper.sendTravelRequestEmail(
      currentTravelRequest,
      pmEmail,
      pmSubject
    );
  }

  if (isHOC || nextHOC) {
    console.log("Email To: HOC", hocEmail);
    console.log("hocSubject: ", hocSubject);
    TravelRequestHelper.sendTravelRequestEmail(
      currentTravelRequest,
      hocEmail,
      hocSubject
    );
  }

  //Send to Supervisor
  if (isHOD || nextHOD) {
    console.log("Email To: HOD", supervisorEmail);
    console.log("supervisorSubject: ", supervisorSubject);
    TravelRequestHelper.sendTravelRequestEmail(
      currentTravelRequest,
      supervisorEmail,
      supervisorSubject
    );
  }

  //Send to Manager
  if (isMD || nextMD) {
    console.log("Email To: MD", managerEmail);
    console.log("managerSubject: ", managerSubject);
    TravelRequestHelper.sendTravelRequestEmail(
      currentTravelRequest,
      managerEmail,
      managerSubject
    );
  }

  //Send to GCOO
  if (isGCOO || nextGCOO) {
    console.log("Email To: GCOO", gcooEmail);
    console.log("gcooSubject: ", gcooSubject);
    TravelRequestHelper.sendTravelRequestEmail(
      currentTravelRequest,
      gcooEmail,
      gcooSubject
    );
  }

  //Send to GCEO
  if (isGCEO || nextGCEO) {
    console.log("Email To: GCEO", gceoEmail);
    console.log("gceoSubject: ", gceoSubject);
    TravelRequestHelper.sendTravelRequestEmail(
      currentTravelRequest,
      gceoEmail,
      gceoSubject
    );
  }

  //Send to BST
  if (isBST || nextBST) {
    console.log("Email To: BST", bstEmail);
    console.log("Email To: BSTS", bstEmails);
    console.log("bstSubject: ", bstSubject);
    TravelRequestHelper.sendTravelRequestEmail(
      currentTravelRequest,
      `${bstEmails}, ${bstEmail}`,
      bstSubject
    );

    // if (nextBST) {
    //   // Send to NEXT USER APPROVAL
    //   const { otherUserEmails, assignedFullName } = fetchOtherUsers(
    //     bsts,
    //     bstCond
    //   );
    //   console.log(
    //     `BST approval assigned to: ${assignedFullName}, then inform other bst members`,
    //     otherUserEmails
    //   );
    //   otherUserSubject =
    //     otherUserSubject +
    //     createdBy.profile.fullName +
    //     "has been assigned to " +
    //     assignedFullName;
    //   TravelRequestHelper.sendTravelRequestEmail(
    //     currentTravelRequest,
    //     otherUserEmails,
    //     otherUserSubject
    //   );
    // }

    let isTripByAir,
      agentCanProcessFlight = false;
    for (let i = 0; i < currentTravelRequest.trips.length; i++) {
      const trip = currentTravelRequest.trips[i];
      if (trip.transportationMode === "AIR") isTripByAir = true;
      if (trip.airlineId === "third_party_agent_flight")
        agentCanProcessFlight = true;
    }

    // Send to booking agent if it's approved by manager
    if (isBST && isTripByAir && agentCanProcessFlight) {
      console.log("--bookingAgentEmail--", bookingAgentEmail);
      TravelRequestHelper.sendTravelRequestEmail(
        currentTravelRequest,
        bookingAgentEmail,
        bookingAgentSubject,
        true,
        true
      );
    }

    TravelRequestHelper.sendTravelRequestEmail(
      currentTravelRequest,
      `${securitiesEmails}, ${securityDeptEmail}`,
      securityDeptSubject,
      true
    );
  }

  //Send to Supervisor
  if (isLOGISTICS || nextLOGISTICS) {
    console.log("Email To: LOGISTICS");
    TravelRequestHelper.sendTravelRequestEmail(
      currentTravelRequest,
      `${logisticsEmails}, Logistics@oilservltd-ng.com`,
      logisticsSubject
    );

    // if (nextLOGISTICS) {
    //   // Send to NEXT USER APPROVAL
    //   const { otherUserEmails, assignedFullName } = fetchOtherUsers(
    //     logistics,
    //     logisticCond
    //   );
    //   console.log(
    //     `LOGISTICS approval assigned to: ${assignedFullName}, then inform other logistics members`,
    //     otherUserEmails
    //   );
    //   otherUserSubject =
    //     otherUserSubject +
    //     createdBy.profile.fullName +
    //     "has been assigned to " +
    //     assignedFullName;
    //   TravelRequestHelper.sendTravelRequestEmail(
    //     currentTravelRequest,
    //     otherUserEmails,
    //     otherUserSubject
    //   );
    // }

    TravelRequestHelper.sendTravelRequestEmail(
      currentTravelRequest,
      `${securitiesEmails}, ${securityDeptEmail}`,
      securityDeptSubject,
      true
    );
  }
};

/**
 * @description Send Retirement Approval mail
 * @param {*} currentTravelRequest
 * @param {*} TravelRequestHelper
 * @param {*} recieverID
 * @param {*} nextUserID
 */
Core.sendRetirementApprovalMail = (
  currentTravelRequest,
  TravelRequestHelper,
  recieverID,
  nextUserID,
  subjects
) => {
  console.log(
    "currentTravelRequest.retirementStatus, recieverID, nextUserID",
    currentTravelRequest.retirementStatus,
    recieverID,
    nextUserID
  );
  let otherPartiesEmail =
    "bulkpay@c2gconsulting.com" + supportmail
      ? ` ${supportmail}, `
      : supportmail;
  const defaultUserData = { profile: {}, emails: [{ address: '' }] };

  let budgetCode = Budgets.findOne({
    businessId: currentTravelRequest.businessId,
  });
  console.log("budgetCode", budgetCode);
  // if (budgetCode) currentTravelRequest.budgetHolderId = budgetCode.employeeId;

  // otherPartiesEmail += "," + budgetCode.externalNotificationEmail;

  const createdBy =
    Meteor.users.findOne(currentTravelRequest.createdBy) || defaultUserData;
  const supervisor =
    Meteor.users.findOne(currentTravelRequest.supervisorId) || defaultUserData;
  const pm =
    Meteor.users.findOne(currentTravelRequest.pmId) || defaultUserData;
  const hoc =
    Meteor.users.findOne(currentTravelRequest.hocId) || defaultUserData;
  const budgetHolder =
    Meteor.users.findOne(currentTravelRequest.budgetHolderId) ||
    defaultUserData;
  const financeApprover =
    Meteor.users.findOne(currentTravelRequest.financeApproverId) ||
    defaultUserData;
  const bsts = getUsers(currentTravelRequest.bstIds) || [defaultUserData];
  // const bst =
  //   Meteor.users.findOne(currentTravelRequest.bstId) || defaultUserData;

  // const { businessId } = currentTravelRequest;
  // const bookingAgentEmail = Core.getOtherSubscribedParties(businessId, 'Booking');
  // const securityDeptEmail = Core.getOtherSubscribedParties(businessId, 'Security');
  let createdByEmail = "";
  let supervisorEmail = "";
  let pmEmail = "";
  let hocEmail = "";
  let budgetHolderEmail = "";
  let financeApproverEmail = "";
  let bstEmail = "";
  let bstEmails = "";

  let otherUserSubject = "Travel retirement process for ";
  // let bookingAgentSubject = "Ticket booking for " + createdBy.profile.fullName + "'s travel retirement";
  // let securityDeptSubject = "Security Notification for " + createdBy.profile.fullName + "'s travel retirement";
  let createdBySubject =
    subjects || "New travel retirement for " + createdBy.profile.fullName;
  let supervisorSubject =
    "Please approve travel retirement for " + createdBy.profile.fullName;
  let pmSubject =
    "Please approve travel retirement for " + createdBy.profile.fullName;
  let hocSubject =
    "Please approve travel retirement for " + createdBy.profile.fullName;
  let budgetHolderSubject =
    "Please approve travel retirement for " + createdBy.profile.fullName;
  let financeApproverSubject =
    "Please approve travel retirement for " + createdBy.profile.fullName;
  let bstSubject =
    "Please approve travel retirement for " + createdBy.profile.fullName;

  const { bstCond, financeCond, securityCond } =
    Core.getApprovalQueries(createdBy);

  const {
    RETIREMENT_APPROVED_BY_HOD,
    RETIREMENT_REJECTED_BY_HOD,
    RETIREMENT_APPROVED_BY_HOC,
    RETIREMENT_REJECTED_BY_HOC,
    RETIREMENT_APPROVED_BY_PM,
    RETIREMENT_REJECTED_BY_PM,
    RETIREMENT_APPROVED_BY_FINANCE,
    RETIREMENT_REJECTED_BY_FINANCE,
    RETIREMENT_APPROVED_BY_BUDGETHOLDER,
    RETIREMENT_REJECTED_BY_BUDGETHOLDER,
    RETIREMENT_APPROVED_BY_BST,
    RETIREMENT_REJECTED_BY_BST,
  } = Core.ALL_TRAVEL_STATUS;

  const { HOD, PM, FINANCE, BUDGETHOLDER, BST } = Core.Approvals;

  // JUST APPROVED BY:
  const isHOD = recieverID === HOD;
  const isPM = recieverID === PM;
  const isHOC = recieverID === HOC;
  const isBUDGETHOLDER = recieverID === BUDGETHOLDER;
  const isFINANCE = recieverID === FINANCE;
  const isBST = recieverID === BST;

  // NEXT APPROVAL BY:
  const nextHOD = nextUserID === HOD;
  const nextPM = nextUserID === PM;
  const nextHOC = nextUserID === HOC;
  const nextBUDGETHOLDER = nextUserID === BUDGETHOLDER;
  const nextFINANCE = nextUserID === FINANCE;
  const nextBST = nextUserID === BST;

  if (
    isHOD &&
    currentTravelRequest.retirementStatus === RETIREMENT_APPROVED_BY_HOD
  ) {
    createdBySubject =
      `${HOD}: ` +
      supervisor.profile.fullName +
      " has approved your travel retirement";
    supervisorSubject =
      "You have approved " +
      createdBy.profile.fullName +
      "'s travel retirement";
  }


  if (
    isPM &&
    currentTravelRequest.retirementStatus === RETIREMENT_APPROVED_BY_PM
  ) {
    createdBySubject =
      `${PM}: ` +
      pm.profile.fullName +
      " has approved your travel retirement";
    pmSubject =
      "You have approved " +
      createdBy.profile.fullName +
      "'s travel retirement";
  }


  if (
    isHOC &&
    currentTravelRequest.retirementStatus === RETIREMENT_APPROVED_BY_HOC
  ) {
    createdBySubject =
      `${HOD}: ` +
      hoc.profile.fullName +
      " has approved your travel retirement";
    hocSubject =
      "You have approved " +
      createdBy.profile.fullName +
      "'s travel retirement";
  }

  if (
    isBUDGETHOLDER &&
    currentTravelRequest.retirementStatus ===
      RETIREMENT_APPROVED_BY_BUDGETHOLDER
  ) {
    createdBySubject =
      `${BUDGETHOLDER}: ` +
      budgetHolder.profile.fullName +
      " has approved your travel retirement";
    budgetHolderSubject =
      "You have approved " +
      createdBy.profile.fullName +
      "'s travel retirement";
  }

  if (
    isFINANCE &&
    currentTravelRequest.retirementStatus === RETIREMENT_APPROVED_BY_FINANCE
  ) {
    createdBySubject =
      `${FINANCE}: ` +
      financeApprover.profile.fullName +
      " has approved your travel retirement";
    financeApproverSubject =
      "You have approved " +
      createdBy.profile.fullName +
      "'s travel retirement";
  }

  if (
    isBST &&
    currentTravelRequest.retirementStatus === RETIREMENT_APPROVED_BY_BST
  ) {
    // createdBySubject =
    //   `${BST}: ` +
    //   bst.profile.fullName +
    //   " has processed your travel retirement";
    const bstGuy = Meteor.user();
    const getBstGuyName = () => (bstGuy && bstGuy.profile && bstGuy.profile.fullName) || '';

    createdBySubject =
      `${BST}: ` + getBstGuyName() + " has processed your travel retirement";
    bstSubject =
      "You have approved " +
      createdBy.profile.fullName +
      "'s travel retirement";
  }

  // REJECTION SUBJECTS
  // HOD
  if (
    isHOD &&
    currentTravelRequest.retirementStatus === RETIREMENT_REJECTED_BY_HOD
  ) {
    createdBySubject =
      `${HOD}: ` +
      supervisor.profile.fullName +
      " has rejected your travel retirement";
    supervisorSubject =
      "You have rejected " +
      createdBy.profile.fullName +
      "'s travel retirement";
  }
  // PM
  if (
    isPM &&
    currentTravelRequest.retirementStatus === RETIREMENT_REJECTED_BY_PM
  ) {
    createdBySubject =
      `${PM}: ` +
      pm.profile.fullName +
      " has rejected your travel retirement";
    pmSubject =
      "You have rejected " +
      createdBy.profile.fullName +
      "'s travel retirement";
  }
  if (
    isHOC &&
    currentTravelRequest.retirementStatus === RETIREMENT_REJECTED_BY_HOC
  ) {
    createdBySubject =
      `${HOD}: ` +
      hoc.profile.fullName +
      " has rejected your travel retirement";
    hocSubject =
      "You have rejected " +
      createdBy.profile.fullName +
      "'s travel retirement";
  }
  // BUDGET HOLDER
  if (
    isBUDGETHOLDER &&
    currentTravelRequest.retirementStatus ===
      RETIREMENT_REJECTED_BY_BUDGETHOLDER
  ) {
    createdBySubject =
      `${BUDGETHOLDER}: ` +
      budgetHolder.profile.fullName +
      " has rejected your travel retirement";
    supervisorSubject =
      "You have rejected " +
      createdBy.profile.fullName +
      "'s travel retirement";
  }
  // FINANCE
  if (
    isFINANCE &&
    currentTravelRequest.retirementStatus === RETIREMENT_REJECTED_BY_FINANCE
  ) {
    createdBySubject =
      `${FINANCE}: ` +
      financeApprover.profile.fullName +
      " has rejected your travel retirement";
    financeApproverSubject =
      "You have rejected " +
      createdBy.profile.fullName +
      "'s travel retirement";
  }
  // BST
  if (
    isBST &&
    currentTravelRequest.retirementStatus === RETIREMENT_REJECTED_BY_BST
  ) {
    createdBySubject =
      `${BST}: ` +
      bst.profile.fullName +
      " has rejected your travel retirement";
    bstSubject =
      "You have rejected " +
      createdBy.profile.fullName +
      "'s travel retirement";
  }
  // END OF REJECTION SUBJECTS

  if (createdBy.emails.length > 0) {
    createdByEmail = createdBy.emails[0].address;
    createdByEmail = createdByEmail + "," + otherPartiesEmail;
    console.log(createdByEmail);
  }

  const { tripFor } = currentTravelRequest;
  if (tripFor && tripFor.individuals && tripFor.individuals.length) {
    const { individuals } = tripFor;
    //  Send Notification to other individual going on this trip
    createdByEmail =
      createdByEmail +
      individuals.reduce((prev, curr) => prev + "," + curr.email, "");
  }

  if ((isBUDGETHOLDER || nextBUDGETHOLDER) && budgetHolder.emails.length > 0) {
    budgetHolderEmail = budgetHolder.emails[0].address;
    budgetHolderEmail = budgetHolderEmail + "," + otherPartiesEmail;
    console.log(budgetHolderEmail);
  }

  if ((isHOD || nextHOD) && supervisor.emails.length > 0) {
    supervisorEmail = supervisor.emails[0].address;
    supervisorEmail = supervisorEmail + "," + otherPartiesEmail;
    console.log(supervisorEmail);
  }

  if ((isPM || nextPM) && pm.emails.length > 0) {
    pmEmail = pm.emails[0].address;
    pmEmail = pmEmail + "," + otherPartiesEmail;
    console.log(pmEmail);
  }

  if ((isHOC || nextHOC) && hoc.emails.length > 0) {
    hocEmail = hoc.emails[0].address;
    hocEmail = hocEmail + "," + otherPartiesEmail;
    console.log(hocEmail);
  }

  if ((isFINANCE || nextFINANCE) && financeApprover.emails.length > 0) {
    financeApproverEmail = financeApprover.emails[0].address;
    financeApproverEmail = financeApproverEmail + "," + otherPartiesEmail;
    console.log(financeApproverEmail);
  }

  if ((isBST || nextBST) && bst.emails.length > 0) {
    bstEmail = bst.emails[0].address;
    bstEmail = bstEmail + "," + otherPartiesEmail;
    console.log(bstEmail);
  }

  //Send to requestor
  TravelRequestHelper.sendTravelRetirementEmail(
    currentTravelRequest,
    createdByEmail,
    createdBySubject
  );

  //Send to Budegt Holder
  if (isBUDGETHOLDER || nextBUDGETHOLDER) {
    console.log("Email To: BUDGETHOLDER", budgetHolderEmail);
    console.log("budgetHolderSubject: ", budgetHolderSubject);
    TravelRequestHelper.sendTravelRetirementEmail(
      currentTravelRequest,
      budgetHolderEmail,
      budgetHolderSubject
    );
  }

  //Send to Supervisor
  if (isHOD || nextHOD) {
    console.log("Email To: HOD", supervisorEmail);
    console.log("supervisorSubject: ", supervisorSubject);
    TravelRequestHelper.sendTravelRetirementEmail(
      currentTravelRequest,
      supervisorEmail,
      supervisorSubject
    );
  }

  //Send to PM
  if (isPM || nextPM) {
    console.log("Email To: PM", pmEmail);
    console.log("pmSubject: ", pmSubject);
    TravelRequestHelper.sendTravelRetirementEmail(
      currentTravelRequest,
      pmEmail,
      pmSubject
    );
  }

  if (isHOC || nextHOC) {
    console.log("Email To: HOC", hocEmail);
    console.log("hocSubject: ", hocSubject);
    TravelRequestHelper.sendTravelRetirementEmail(
      currentTravelRequest,
      hocEmail,
      hocSubject
    );
  }

  //Send to Manager
  if (isFINANCE || nextFINANCE) {
    console.log("Email To: FINANCE", financeApproverEmail);
    console.log("financeApproverSubject: ", financeApproverSubject);
    TravelRequestHelper.sendTravelRetirementEmail(
      currentTravelRequest,
      financeApproverEmail,
      financeApproverSubject
    );

    if (nextFINANCE) {
      // Send to NEXT USER APPROVAL
      const { otherUserEmails, assignedFullName } = fetchOtherUsers(
        financeApprover,
        financeCond
      );
      console.log(
        `FINANCE approval assigned to: ${assignedFullName}, then inform other bst members`,
        otherUserEmails
      );
      otherUserSubject =
        otherUserSubject +
        createdBy.profile.fullName +
        "has been assigned to " +
        assignedFullName;
      TravelRequestHelper.sendTravelRetirementEmail(
        currentTravelRequest,
        otherUserEmails,
        otherUserSubject
      );
    }
  }

  //Send to BST
  if (isBST || nextBST) {
    console.log("Email To: BST", bstEmail);
    console.log("bstSubject: ", bstSubject);
    TravelRequestHelper.sendTravelRetirementEmail(
      currentTravelRequest,
      bstEmail,
      bstSubject
    );
  }
};

/**
 * @description Send Cancellation mail
 * @param {*} currentTravelRequest
 * @param {*} TravelRequestHelper
 * @param {*} recieverID
 * @param {*} nextUserID
 */
Core.sendUpdateOrCancellationMail = (
  currentTravelRequest,
  TravelRequestHelper,
  isUpdated
) => {
  let otherPartiesEmail =
    "bulkpay@c2gconsulting.com" + supportmail
      ? ` ${supportmail}, `
      : supportmail;
  const defaultUserData = { profile: {} };

  let budgetCode = Budgets.findOne({
    businessId: currentTravelRequest.businessId,
  });
  console.log("budgetCode", budgetCode);
  // if (budgetCode) currentTravelRequest.budgetHolderId = budgetCode.employeeId;

  // otherPartiesEmail += "," + budgetCode.externalNotificationEmail;

  const createdBy =
    Meteor.users.findOne(currentTravelRequest.createdBy) || defaultUserData;
  const supervisor =
    Meteor.users.findOne(currentTravelRequest.supervisorId) || defaultUserData;
  const pm =
    Meteor.users.findOne(currentTravelRequest.pmId) || defaultUserData;
  const hoc =
    Meteor.users.findOne(currentTravelRequest.hocId) || defaultUserData;
  const budgetHolder =
    Meteor.users.findOne(currentTravelRequest.budgetHolderId) ||
    defaultUserData;
  const manager =
    Meteor.users.findOne(currentTravelRequest.managerId) || defaultUserData;
  const gcoo =
    Meteor.users.findOne(currentTravelRequest.gcooId) || defaultUserData;
  const gceo =
    Meteor.users.findOne(currentTravelRequest.gceoId) || defaultUserData;
  const bst =
    Meteor.users.findOne(currentTravelRequest.bstId) || defaultUserData;
  const logistics =
    Meteor.users.findOne(currentTravelRequest.logisticsId) || defaultUserData;

  const { businessId } = currentTravelRequest;
  const bookingAgentEmail = Core.getOtherSubscribedParties(
    businessId,
    "Booking"
  );
  const securityDeptEmail = Core.getOtherSubscribedParties(
    businessId,
    "Security"
  );
  let createdByEmail = "";
  let supervisorEmail = "";
  let pmEmail = "";
  let hocEmail = "";
  let budgetHolderEmail = "";
  let managerEmail = "";
  let gcooEmail = "";
  let gceoEmail = "";
  let bstEmail = "";
  let logisticsEmail = "";

  let otherUserSubject = "Travel request process for ";
  let bookingAgentSubject =
    "Ticket booking cancellation: Travel Request for " +
    createdBy.profile.fullName +
    " has been cancelled by the Administrator";
  let securityDeptSubject =
    "Travel Request for: " +
    createdBy.profile.fullName +
    " has been cancelled by the Administrator";
  let createdBySubject =
    "Travel Request for: " +
    createdBy.profile.fullName +
    " has been cancelled by the Administrator";
  let supervisorSubject =
    "Travel Request for: " +
    createdBy.profile.fullName +
    " has been cancelled by the Administrator";
  let pmSubject =
    "Travel Request for: " +
    createdBy.profile.fullName +
    " has been cancelled by the Administrator";
  let hocSubject =
    "Travel Request for: " +
    createdBy.profile.fullName +
    " has been cancelled by the Administrator";
  let budgetHolderSubject =
    "Travel Request for: " +
    createdBy.profile.fullName +
    " has been cancelled by the Administrator";
  let managerSubject =
    "Travel Request for: " +
    createdBy.profile.fullName +
    " has been cancelled by the Administrator";
  let gcooSubject =
    "Travel Request for: " +
    createdBy.profile.fullName +
    " has been cancelled by the Administrator";
  let gceoSubject =
    "Travel Request for: " +
    createdBy.profile.fullName +
    " has been cancelled by the Administrator";
  let bstSubject =
    "Travel Request for: " +
    createdBy.profile.fullName +
    " has been cancelled by the Administrator";
  let logisticsSubject =
    "Travel Request for: " +
    createdBy.profile.fullName +
    " has been cancelled by the Administrator";

  if (isUpdated) {
    bookingAgentSubject =
      "Please Update Ticket for " + createdBy.profile.fullName;
    securityDeptSubject =
      "Please approve the updated travel request for " +
      createdBy.profile.fullName;
    createdBySubject =
      "Updated travel request for: " + createdBy.profile.fullName;
    supervisorSubject =
      "Please approve the updated travel request for " +
      createdBy.profile.fullName;
    pmSubject =
      "Please approve the updated travel request for " +
      createdBy.profile.fullName;
    hocSubject =
      "Please approve the updated travel request for " +
      createdBy.profile.fullName;
    budgetHolderSubject =
      "Please approve the updated travel request for " +
      createdBy.profile.fullName;
    managerSubject =
      "Please approve the updated travel request for " +
      createdBy.profile.fullName;
    gcooSubject =
      "Please approve the updated travel request for " +
      createdBy.profile.fullName;
    gceoSubject =
      "Please approve the updated travel request for " +
      createdBy.profile.fullName;
    bstSubject =
      "Please approve the updated travel request for " +
      createdBy.profile.fullName;
    logisticsSubject =
      "Please approve the updated travel request for " +
      createdBy.profile.fullName;
  }

  const { bstCond, logisticCond } = Core.getApprovalQueries(createdBy);

  const {
    PENDING,
    CANCELLED,
    APPROVED_BY_HOD,
    REJECTED_BY_HOD,
    APPROVED_BY_PM,
    REJECTED_BY_PM,
    APPROVED_BY_HOC,
    REJECTED_BY_HOC,
    APPROVED_BY_BUDGETHOLDER,
    REJECTED_BY_BUDGETHOLDER,
    APPROVED_BY_MD,
    REJECTED_BY_MD,
    APPROVED_BY_GCOO,
    REJECTED_BY_GCOO,
    APPROVED_BY_GCEO,
    REJECTED_BY_GCEO,
    PROCESSED_BY_BST,
    PROCESSED_BY_LOGISTICS,
  } = Core.ALL_TRAVEL_STATUS;

  if (createdBy.emails.length > 0) {
    createdByEmail = createdBy.emails[0].address;
    createdByEmail = createdByEmail + "," + otherPartiesEmail;
    console.log(createdByEmail);
  }

  const { tripFor } = currentTravelRequest;
  if (tripFor && tripFor.individuals && tripFor.individuals.length) {
    const { individuals } = tripFor;
    //  Send Notification to other individual going on this trip
    createdByEmail =
      createdByEmail +
      individuals.reduce((prev, curr) => prev + "," + curr.email, "");
  }

  if (budgetHolder && budgetHolder.emails.length > 0) {
    budgetHolderEmail = budgetHolder.emails[0].address;
    budgetHolderEmail = budgetHolderEmail + "," + otherPartiesEmail;
    console.log(budgetHolderEmail);
  }

  if (supervisor && supervisor.emails.length > 0) {
    supervisorEmail = supervisor.emails[0].address;
    supervisorEmail = supervisorEmail + "," + otherPartiesEmail;
    console.log(supervisorEmail);
  }

  if (hoc && hoc.emails.length > 0) {
    hocEmail = hoc.emails[0].address;
    hocEmail = hocEmail + "," + otherPartiesEmail;
    console.log(hocEmail);
  }

  if (pm && pm.emails.length > 0) {
    pmEmail = pm.emails[0].address;
    pmEmail = pmEmail + "," + otherPartiesEmail;
    console.log(pmEmail);
  }

  if (manager && manager.emails.length > 0) {
    managerEmail = manager.emails[0].address;
    managerEmail = managerEmail + "," + otherPartiesEmail;
    console.log(managerEmail);
  }

  if (gcoo && gcoo.emails.length > 0) {
    gcooEmail = gcoo.emails[0].address;
    gcooEmail = gcooEmail + "," + otherPartiesEmail;
    console.log(gcooEmail);
  }

  if (gceo && gceo.emails.length > 0) {
    gceoEmail = gceo.emails[0].address;
    gceoEmail = gceoEmail + "," + otherPartiesEmail;
    console.log(gceoEmail);
  }

  if (bst && bst.emails.length > 0) {
    bstEmail = bst.emails[0].address;
    bstEmail = bstEmail + "," + otherPartiesEmail;
    console.log(bstEmail);
  }

  if (logistics && logistics.emails.length > 0) {
    logisticsEmail = logistics.emails[0].address;
    logisticsEmail = logisticsEmail + "," + otherPartiesEmail;
    console.log(logisticsEmail);
  }

  //Send to requestor
  TravelRequestHelper.sendTravelRequestEmail(
    currentTravelRequest,
    createdByEmail,
    createdBySubject
  );
  // send to budget holder
  // TravelRequestHelper.sendTravelRequestEmail(
  //   currentTravelRequest,
  //   budgetHolderEmail,
  //   budgetHolderSubject
  // );

  if (currentTravelRequest.status === CANCELLED) {
    console.log('${supervisorEmail}, ${pmEmail}, ${managerEmail}, ${gcooEmail}, ${gceoEmail}, ${bstEmail}, ${logisticsEmail}, ${bookingAgentEmail}');
    console.log(`${supervisorEmail}, ${pmEmail}, ${managerEmail}, ${gcooEmail}, ${gceoEmail}, ${bstEmail}, ${logisticsEmail}, ${bookingAgentEmail}`);
    TravelRequestHelper.sendTravelRequestEmail(
      currentTravelRequest,
      `${supervisorEmail}, ${pmEmail}, ${managerEmail}, ${gcooEmail}, ${gceoEmail}, ${bstEmail}, ${logisticsEmail}, ${bookingAgentEmail}`,
      supervisorSubject
    );
    return CANCELLED;
  }

  // Send to Supervisor
  if (
    (currentTravelRequest.status === APPROVED_BY_HOD ||
    currentTravelRequest.status === REJECTED_BY_HOD ||
    currentTravelRequest.status === PENDING) &&
   (currentTravelRequest.costCenter !== 'Department' ||
   currentTravelRequest.costCenter !== 'Project')
  ) {
    console.log("Email To: HOD", supervisorEmail);
    console.log("supervisorSubject: ", supervisorSubject);
    TravelRequestHelper.sendTravelRequestEmail(
      currentTravelRequest,
      supervisorEmail,
      supervisorSubject
    );
  }

  if (
    (currentTravelRequest.status === APPROVED_BY_HOC ||
    currentTravelRequest.status === REJECTED_BY_HOC ||
    currentTravelRequest.status === PENDING) &&
    currentTravelRequest.costCenter === 'Department'
  ) {
    console.log("Email To: HOC", hocEmail);
    console.log("hocSubject: ", hocSubject);
    TravelRequestHelper.sendTravelRequestEmail(
      currentTravelRequest,
      hocEmail,
      hocSubject
    );
  }

  // Send to pm
  if (
    (currentTravelRequest.status === APPROVED_BY_PM ||
    currentTravelRequest.status === REJECTED_BY_PM ||
    currentTravelRequest.status === PENDING) &&
    currentTravelRequest.costCenter === 'Project'
  ) {
    console.log("Email To: PM", pmEmail);
    console.log("pmSubject: ", pmSubject);
    TravelRequestHelper.sendTravelRequestEmail(
      currentTravelRequest,
      pmEmail,
      pmSubject
    );
  }

  // Send to Manager
  if (
    currentTravelRequest.status === APPROVED_BY_MD ||
    currentTravelRequest.status === REJECTED_BY_MD
  ) {
    console.log("Email To: MD", managerEmail);
    console.log("managerSubject: ", managerSubject);
    TravelRequestHelper.sendTravelRequestEmail(
      currentTravelRequest,
      managerEmail,
      managerSubject
    );
  }

  //Send to GCOO
  if (
    currentTravelRequest.status === APPROVED_BY_GCOO ||
    currentTravelRequest.status === REJECTED_BY_GCOO
  ) {
    console.log("Email To: GCOO", gcooEmail);
    console.log("gcooSubject: ", gcooSubject);
    TravelRequestHelper.sendTravelRequestEmail(
      currentTravelRequest,
      gcooEmail,
      gcooSubject
    );
  }

  //Send to GCEO
  if (
    currentTravelRequest.status === APPROVED_BY_GCEO ||
    currentTravelRequest.status === REJECTED_BY_GCEO
  ) {
    console.log("Email To: GCEO", gceoEmail);
    console.log("gceoSubject: ", gceoSubject);
    TravelRequestHelper.sendTravelRequestEmail(
      currentTravelRequest,
      gceoEmail,
      gceoSubject
    );
  }

  //Send to BST
  if (currentTravelRequest.status === PROCESSED_BY_BST) {
    console.log("Email To: BST", bstEmail);
    console.log("bstSubject: ", bstSubject);
    TravelRequestHelper.sendTravelRequestEmail(
      currentTravelRequest,
      bstEmail,
      bstSubject
    );

    const { otherUserEmails, assignedFullName } = fetchOtherUsers(bst, bstCond);
    TravelRequestHelper.sendTravelRequestEmail(
      currentTravelRequest,
      otherUserEmails,
      bstSubject
    );

    let isTripByAir,
      agentCanProcessFlight = false;
    for (let i = 0; i < currentTravelRequest.trips.length; i++) {
      const trip = currentTravelRequest.trips[i];
      if (trip.transportationMode === "AIR") isTripByAir = true;
      if (trip.airlineId === "third_party_agent_flight")
        agentCanProcessFlight = true;
    }

    // Send to booking agent if it's approved by manager
    if (isBST && isTripByAir && agentCanProcessFlight) {
      console.log("--bookingAgentEmail--", bookingAgentEmail);
      TravelRequestHelper.sendTravelRequestEmail(
        currentTravelRequest,
        bookingAgentEmail,
        bookingAgentSubject,
        true,
        true
      );
    }

    TravelRequestHelper.sendTravelRequestEmail(
      currentTravelRequest,
      securityDeptEmail,
      securityDeptSubject,
      true
    );
  }

  //Send to LOGISTICS
  if (currentTravelRequest.status === PROCESSED_BY_LOGISTICS) {
    console.log("Email To: LOGISTICS");
    TravelRequestHelper.sendTravelRequestEmail(
      currentTravelRequest,
      logisticsEmail,
      logisticsSubject
    );

    const { otherUserEmails, assignedFullName } = fetchOtherUsers(
      logistics,
      logisticCond
    );
    TravelRequestHelper.sendTravelRequestEmail(
      currentTravelRequest,
      otherUserEmails,
      logisticsSubject
    );

    TravelRequestHelper.sendTravelRequestEmail(
      currentTravelRequest,
      securityDeptEmail,
      securityDeptSubject,
      true
    );
  }
};

/**
 * @description Send Travel Update mail
 * @param {*} currentTravelRequest
 * @param {*} TravelRequestHelper
 * @param {*} recieverID
 * @param {*} nextUserID
 */
Core.sendRetirementUpdateMail = (currentTravelRequest, TravelRequestHelper) => {
  let otherPartiesEmail =
    "bulkpay@c2gconsulting.com" + supportmail
      ? ` ${supportmail}, `
      : supportmail;
  const defaultUserData = { profile: {} };

  let budgetCode = Budgets.findOne({
    businessId: currentTravelRequest.businessId,
  });
  console.log("budgetCode", budgetCode);
  // if (budgetCode) currentTravelRequest.budgetHolderId = budgetCode.employeeId;

  // otherPartiesEmail += "," + budgetCode.externalNotificationEmail;

  const createdBy =
    Meteor.users.findOne(currentTravelRequest.createdBy) || defaultUserData;
  const supervisor =
    Meteor.users.findOne(currentTravelRequest.supervisorId) || defaultUserData;
  const pm =
    Meteor.users.findOne(currentTravelRequest.pmId) || defaultUserData;
  const hoc =
    Meteor.users.findOne(currentTravelRequest.hocId) || defaultUserData;
  const budgetHolder =
    Meteor.users.findOne(currentTravelRequest.budgetHolderId) ||
    defaultUserData;
  const manager =
    Meteor.users.findOne(currentTravelRequest.managerId) || defaultUserData;
  const gcoo =
    Meteor.users.findOne(currentTravelRequest.gcooId) || defaultUserData;
  const gceo =
    Meteor.users.findOne(currentTravelRequest.gceoId) || defaultUserData;
  const bst =
    Meteor.users.findOne(currentTravelRequest.bstId) || defaultUserData;
  const logistics =
    Meteor.users.findOne(currentTravelRequest.logisticsId) || defaultUserData;

  const { businessId } = currentTravelRequest;
  const bookingAgentEmail = Core.getOtherSubscribedParties(
    businessId,
    "Booking"
  );
  const securityDeptEmail = Core.getOtherSubscribedParties(
    businessId,
    "Security"
  );
  let createdByEmail = "";
  let supervisorEmail = "";
  let pmEmail = "";
  let hocEmail = "";
  let budgetHolderEmail = "";
  let managerEmail = "";
  let gcooEmail = "";
  let gceoEmail = "";
  let bstEmail = "";
  let logisticsEmail = "";

  let otherUserSubject = "Travel retirement process for ";
  let bookingAgentSubject =
    "Please Update Ticket for " + createdBy.profile.fullName;
  let securityDeptSubject =
    "Please approve the updated travel retirement for " +
    createdBy.profile.fullName;
  let createdBySubject =
    "Updated travel retirement for: " + createdBy.profile.fullName;
  let supervisorSubject =
    "Please approve the updated travel retirement for " +
    createdBy.profile.fullName;
  let pmSubject =
    "Please approve the updated travel retirement for " +
    createdBy.profile.fullName;
  let hocSubject =
    "Please approve the updated travel retirement for " +
    createdBy.profile.fullName;
  let budgetHolderSubject =
    "Please approve the updated travel retirement for " +
    createdBy.profile.fullName;
  let managerSubject =
    "Please approve the updated travel retirement for " +
    createdBy.profile.fullName;
  let gcooSubject =
    "Please approve the updated travel retirement for " +
    createdBy.profile.fullName;
  let gceoSubject =
    "Please approve the updated travel retirement for " +
    createdBy.profile.fullName;
  let bstSubject =
    "Please approve the updated travel retirement for " +
    createdBy.profile.fullName;
  let logisticsSubject =
    "Please approve the updated travel retirement for " +
    createdBy.profile.fullName;

  const { bstCond, logisticCond } = Core.getApprovalQueries(createdBy);

  const {
    RETIREMENT_APPROVED_BY_HOD,
    RETIREMENT_REJECTED_BY_HOD,
    RETIREMENT_APPROVED_BY_PM,
    RETIREMENT_REJECTED_BY_PM,
    RETIREMENT_APPROVED_BY_HOC,
    RETIREMENT_REJECTED_BY_HOC,
    RETIREMENT_APPROVED_BY_FINANCE,
    RETIREMENT_REJECTED_BY_FINANCE,
    RETIREMENT_APPROVED_BY_BUDGETHOLDER,
    RETIREMENT_REJECTED_BY_BUDGETHOLDER,
    RETIREMENT_APPROVED_BY_BST,
    RETIREMENT_REJECTED_BY_BST,
  } = Core.ALL_TRAVEL_STATUS;

  if (createdBy.emails.length > 0) {
    createdByEmail = createdBy.emails[0].address;
    createdByEmail = createdByEmail + "," + otherPartiesEmail;
    console.log(createdByEmail);
  }

  const { tripFor } = currentTravelRequest;
  if (tripFor && tripFor.individuals && tripFor.individuals.length) {
    const { individuals } = tripFor;
    //  Send Notification to other individual going on this trip
    createdByEmail =
      createdByEmail +
      individuals.reduce((prev, curr) => prev + "," + curr.email, "");
  }

  if (budgetHolder && budgetHolder.emails.length > 0) {
    budgetHolderEmail = budgetHolder.emails[0].address;
    budgetHolderEmail = budgetHolderEmail + "," + otherPartiesEmail;
    console.log(budgetHolderEmail);
  }

  if (supervisor && supervisor.emails.length > 0) {
    supervisorEmail = supervisor.emails[0].address;
    supervisorEmail = supervisorEmail + "," + otherPartiesEmail;
    console.log(supervisorEmail);
  }

  if (pm && pm.emails.length > 0) {
    pmEmail = pm.emails[0].address;
    pmEmail = pmEmail + "," + otherPartiesEmail;
    console.log('pmEmail', pmEmail);
  }

  if (hoc && hoc.emails.length > 0) {
    hocEmail = hoc.emails[0].address;
    hocEmail = hocEmail + "," + otherPartiesEmail;
    console.log('hocEmail', hocEmail);
  }

  if (manager && manager.emails.length > 0) {
    managerEmail = manager.emails[0].address;
    managerEmail = managerEmail + "," + otherPartiesEmail;
    console.log(managerEmail);
  }

  if (gcoo && gcoo.emails.length > 0) {
    gcooEmail = gcoo.emails[0].address;
    gcooEmail = gcooEmail + "," + otherPartiesEmail;
    console.log(gcooEmail);
  }

  if (gceo && gceo.emails.length > 0) {
    gceoEmail = gceo.emails[0].address;
    gceoEmail = gceoEmail + "," + otherPartiesEmail;
    console.log(gceoEmail);
  }

  if (bst && bst.emails.length > 0) {
    bstEmail = bst.emails[0].address;
    bstEmail = bstEmail + "," + otherPartiesEmail;
    console.log(bstEmail);
  }

  if (logistics && logistics.emails.length > 0) {
    logisticsEmail = logistics.emails[0].address;
    logisticsEmail = logisticsEmail + "," + otherPartiesEmail;
    console.log(logisticsEmail);
  }

  //Send to requestor
  TravelRequestHelper.sendTravelRetirementEmail(
    currentTravelRequest,
    createdByEmail,
    createdBySubject
  );
  // send to budget holder
  TravelRequestHelper.sendTravelRetirementEmail(
    currentTravelRequest,
    budgetHolderEmail,
    budgetHolderSubject
  );

  //Send to Supervisor
  if (
    currentTravelRequest.retirementStatus === RETIREMENT_APPROVED_BY_HOD ||
    currentTravelRequest.retirementStatus === RETIREMENT_REJECTED_BY_HOD
  ) {
    console.log("Email To: HOD", supervisorEmail);
    console.log("supervisorSubject: ", supervisorSubject);
    TravelRequestHelper.sendTravelRetirementEmail(
      currentTravelRequest,
      supervisorEmail,
      supervisorSubject
    );
  }

  if (
    currentTravelRequest.retirementStatus === RETIREMENT_APPROVED_BY_PM ||
    currentTravelRequest.retirementStatus === RETIREMENT_REJECTED_BY_PM
  ) {
    console.log("Email To: PM", pmEmail);
    console.log("pmSubject: ", pmSubject);
    TravelRequestHelper.sendTravelRetirementEmail(
      currentTravelRequest,
      pmEmail,
      pmSubject
    );
  }

  if (
    currentTravelRequest.retirementStatus === RETIREMENT_APPROVED_BY_HOC ||
    currentTravelRequest.retirementStatus === RETIREMENT_REJECTED_BY_HOC
  ) {
    console.log("Email To: HOC", hocEmail);
    console.log("hocSubject: ", hocSubject);
    TravelRequestHelper.sendTravelRetirementEmail(
      currentTravelRequest,
      hocEmail,
      hocSubject
    );
  }

  //Send to Manager
  if (
    currentTravelRequest.retirementStatus === RETIREMENT_APPROVED_BY_FINANCE ||
    currentTravelRequest.retirementStatus === RETIREMENT_REJECTED_BY_FINANCE
  ) {
    console.log("Email To: FINANCE", financeApproverEmail);
    console.log("financeApproverSubject: ", financeApproverSubject);
    TravelRequestHelper.sendTravelRetirementEmail(
      currentTravelRequest,
      financeApproverEmail,
      financeApproverSubject
    );

    if (nextBST) {
      // Send to NEXT USER APPROVAL
      const { otherUserEmails, assignedFullName } = fetchOtherUsers(
        financeApprover,
        financeCond
      );
      console.log(
        `FINANCE approval assigned to: ${assignedFullName}, then inform other bst members`,
        otherUserEmails
      );
      otherUserSubject =
        otherUserSubject +
        createdBy.profile.fullName +
        "has been assigned to " +
        assignedFullName;
      TravelRequestHelper.sendTravelRetirementEmail(
        currentTravelRequest,
        otherUserEmails,
        otherUserSubject
      );
    }
  }

  //Send to Supervisor
  if (
    currentTravelRequest.retirementStatus === RETIREMENT_APPROVED_BY_BST ||
    currentTravelRequest.retirementStatus === RETIREMENT_REJECTED_BY_BST
  ) {
    console.log("Email To: BST", bstEmail);
    console.log("bstSubject: ", bstSubject);
    TravelRequestHelper.sendTravelRetirementEmail(
      currentTravelRequest,
      bstEmail,
      bstSubject
    );

    if (nextBST) {
      // Send to NEXT USER APPROVAL
      const { otherUserEmails, assignedFullName } = fetchOtherUsers(
        bst,
        bstCond
      );
      console.log(
        `BST approval assigned to: ${assignedFullName}, then inform other bst members`,
        otherUserEmails
      );
      otherUserSubject =
        otherUserSubject +
        createdBy.profile.fullName +
        "has been assigned to " +
        assignedFullName;
      TravelRequestHelper.sendTravelRetirementEmail(
        currentTravelRequest,
        otherUserEmails,
        otherUserSubject
      );
    }

    console.log("--bookingAgentEmail--", bookingAgentEmail);
    TravelRequestHelper.sendTravelRetirementEmail(
      currentTravelRequest,
      bookingAgentEmail,
      bookingAgentSubject,
      true,
      true
    );

    TravelRequestHelper.sendTravelRetirementEmail(
      currentTravelRequest,
      securityDeptEmail,
      securityDeptSubject,
      true
    );
  }
};
