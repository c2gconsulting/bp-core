import _ from 'underscore';
import { HTTP } from 'meteor/http'


let SapIntegration = {}
SapIntegration.processPayrunResultsForSap = (businessUnitSapConfig, payRunResults) => {
    let unitsBulkSum = {}

    //Be patient. The main processing happens after this function definition
    let initializeUnitBulkSum = (unitId, costCenterCode, aPayrunResult) => {
        unitsBulkSum[unitId] = {}
        unitsBulkSum[unitId]['costCenterCode'] = costCenterCode
        unitsBulkSum[unitId]['payments'] = aPayrunResult.payment.map(aPayment => {
            let sapPayTypeDetails = _.find(businessUnitSapConfig.payTypes, function (aPayType) {
                return aPayType.payTypeId === aPayment.id;
            })
            console.log(`sapPayTypeDetails: ${JSON.stringify(sapPayTypeDetails)}`)
            //--
            let payTypeDebitAccountCode = ""
            if(sapPayTypeDetails && sapPayTypeDetails.payTypeDebitAccountCode) {
                payTypeDebitAccountCode = sapPayTypeDetails.payTypeDebitAccountCode
            }
            let payTypeCreditAccountCode = ""
            if(sapPayTypeDetails && sapPayTypeDetails.payTypeCreditAccountCode) {
                payTypeDebitAccountCode = sapPayTypeDetails.payTypeCreditAccountCode
            }
            return {
                payTypeId : aPayment.id,
                amountLC : aPayment.amountLC,
                payTypeDebitAccountCode: payTypeDebitAccountCode,
                payTypeCreditAccountCode: payTypeCreditAccountCode
            }
        })
    }

    //--Main processing happens here
    payRunResults.forEach((aPayrunResult) => {
        let employeeId = aPayrunResult.employeeId

        let employee = Meteor.users.findOne({_id: employeeId})
        let employeePositionId = employee.employeeProfile.employment.position
        let position = EntityObjects.findOne({_id: employeePositionId, otype: 'Position'})

        if(position && position.parentId) {
            let unitId = position.parentId

            let sapUnitCostCenterDetails = _.find(businessUnitSapConfig.units, (aUnit) => {
                return aUnit.unitId === unitId;
            })
            if(sapUnitCostCenterDetails) {
                let unitToWorkWith = unitsBulkSum[unitId]
                if(unitToWorkWith) {
                    aPayrunResult.payment.forEach(aPayment => {
                        let paymentToAccumulate = _.find(unitToWorkWith.payments, (aUnitPayment) => {
                            return aUnitPayment.payTypeId === aPayment.id
                        })
                        if(paymentToAccumulate) {
                            paymentToAccumulate.amountLC += aPayment.amountLC
                        }
                    })
                } else {
                    // This function call adds an object to unitsBulkSum object
                    initializeUnitBulkSum(unitId, sapUnitCostCenterDetails.costCenterCode, aPayrunResult)
                }
            }
        }
    })
    let getUnitForPosition = (unit) => {

    }

    return unitsBulkSum
}



/**
 *  SAP B1 Integration Methods
 */
Meteor.methods({
    'sapB1integration/testConnection': (businessUnitId, sapConfig) => {
        if (!this.userId && Core.hasPayrollAccess(this.userId)) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();
        //--
        if(sapConfig) {
          console.log(`Business unit id: ${businessUnitId} sap-server-ip: ${sapConfig.ipAddress}`)
          let connectionUrl = `http://${sapConfig.ipAddress}:19080/api/connectiontest`

          let postData = JSON.stringify({companyDatabaseName: sapConfig.sapCompanyDatabaseName})
          let requestHeaders = {'Content-Type': 'application/json'}
          let errorResponse = null
          try {
              let connectionTestResponse = HTTP.call('POST', connectionUrl, {data: postData, headers: requestHeaders});
              let actualServerResponse = connectionTestResponse.data.replace(/\//g, "")

              let serverResponseObj = JSON.parse(actualServerResponse)

              if(serverResponseObj.status === true) {
                  let businessUnitSapConfig = SapBusinessUnitConfigs.findOne({businessUnitId: businessUnitId});
                  if(businessUnitSapConfig) {
                      SapBusinessUnitConfigs.update(businessUnitSapConfig._id, {$set : sapConfig});
                  } else {
                      SapBusinessUnitConfigs.insert({
                          businessUnitId: businessUnitId,
                          ipAddress: sapConfig.ipAddress,
                          sapCompanyDatabaseName : sapConfig.sapCompanyDatabaseName,
                          protocol: sapConfig.protocol
                      })
                  }
              }
              return actualServerResponse.replace(/\//g, "")
          } catch(e) {
              console.log(`Error in testing connection! ${e.message}`)
              errorResponse = '{"status": false, "message": "An error occurred in testing connection. Please be sure of the details."}'
          }
          return errorResponse;
        } else {
            return '{"status": false, "message": "SAP Config empty"}'
        }
    },
    "sapB1integration/updateUnitCostCenters": function(businessUnitId, unitCostCenterCodesArray){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        //update can only be done by authorized user. so check permission
        check(businessUnitId, String);

        //--
        if(unitCostCenterCodesArray && unitCostCenterCodesArray.length > 0) {
            let businessUnitSapConfig = SapBusinessUnitConfigs.findOne({businessUnitId: businessUnitId});
            if(businessUnitSapConfig) {
                SapBusinessUnitConfigs.update(businessUnitSapConfig._id, {$set : {units: unitCostCenterCodesArray}});
            } else {
                SapBusinessUnitConfigs.insert({businessUnitId: businessUnitId, units: unitCostCenterCodesArray})
            }
            return true;
        } else {
            throw new Meteor.Error(404, "Empty cost centers data for units");
        }
    },
    "sapB1integration/updateProjectCodes": function(businessUnitId, projectCodesArray){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        //update can only be done by authorized user. so check permission
        check(businessUnitId, String);

        //--
        if(projectCodesArray && projectCodesArray.length > 0) {
            let businessUnitSapConfig = SapBusinessUnitConfigs.findOne({businessUnitId: businessUnitId});
            if(businessUnitSapConfig) {
                SapBusinessUnitConfigs.update(businessUnitSapConfig._id, {$set : {projects: projectCodesArray}});
            } else {
                SapBusinessUnitConfigs.insert({businessUnitId: businessUnitId, projects: projectCodesArray})
            }
            return true;
        } else {
            throw new Meteor.Error(404, "Empty project codes data");
        }
    },
    "sapB1integration/updatePayTypeGlAccountCodes": function(businessUnitId, payTypesGLAccountCodesArray){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        //update can only be done by authorized user. so check permission
        check(businessUnitId, String);

        //--
        if(payTypesGLAccountCodesArray && payTypesGLAccountCodesArray.length > 0) {
            let businessUnitSapConfig = SapBusinessUnitConfigs.findOne({businessUnitId: businessUnitId});
            if(businessUnitSapConfig) {
                SapBusinessUnitConfigs.update(businessUnitSapConfig._id, {$set : {payTypes: payTypesGLAccountCodesArray}});
            } else {
                SapBusinessUnitConfigs.insert({businessUnitId: businessUnitId, payTypes: payTypesGLAccountCodesArray})
            }
            return true;
        } else {
            throw new Meteor.Error(404, "Empty GL accounts data for pay types");
        }
    },
    'sapB1integration/postPayrunResults': (businessUnitId, period) => {
        if (!this.userId && Core.hasPayrollAccess(this.userId)) {
            throw new Meteor.Error(401, "Unauthorized");
        }

        let errorResponse = null
        try {
            let payRunResult = Payruns.find({period: period}).fetch();
            console.log(`Period: ${period}`)
            let businessUnitSapConfig = SapBusinessUnitConfigs.findOne({businessUnitId: businessUnitId})

            if(businessUnitSapConfig) {
                let unitsBulkSumsForSap = SapIntegration.processPayrunResultsForSap(businessUnitSapConfig, payRunResult)
                //console.log(`unitsBulkSumsForSap: ${JSON.stringify(unitsBulkSumsForSap)}`)

                let connectionUrl = `${businessUnitSapConfig.protocol}://${businessUnitSapConfig.ipAddress}:19080/api/payrun`
                let postData = JSON.stringify({period: period, data: unitsBulkSumsForSap})
                let requestHeaders = {'Content-Type': 'application/json'}

                let serverRes = HTTP.call('POST', connectionUrl, {data: postData, headers: requestHeaders});
                let actualServerResponse = serverRes.data.replace(/\//g, "")

                let serverResponseObj = JSON.parse(actualServerResponse)

                if(serverResponseObj.status === true) {
                    console.log(`Payrun post to SAP was successful`)
                }
                return actualServerResponse.replace(/\//g, "")
            } else {
                return JSON.stringify({
                    "status": false,
                    "message": "Your company's sap integration setup has not been done"
                })
            }
        } catch(e) {
            console.log(`Error in testing connection! ${e.message}`)
            errorResponse = '{"status": false, "message": "An error occurred in posting payrun results."}'
        }
        return errorResponse;
    }
});