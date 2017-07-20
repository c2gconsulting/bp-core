import _ from 'underscore';
import moment from 'moment';



// use oop
// instantiate payment object for employee with props for all methods required
processEmployeePay = function (currentUserId, employees, includedAnnuals, businessId, period) {
    let paygrades = [];
    let payresult = [];  // holds result that will be sent to client
    let payrun = [];  //holds payrun for storing if not simulation
    let specifiedAsProcess = function (paytype) {
        return _.indexOf(includedAnnuals, paytype) !== -1 ? true : false;
    };
    processingError = [];

    let count = 0;

    const periodFormat = period.month + period.year;// format is 012017 ex.

    let tenantId = Core.getTenantId(currentUserId)
    let tenant = Tenants.findOne(tenantId)

    let currencyRatesForPeriod = Currencies.find({businessId: businessId, period: periodFormat}).fetch()

    let runPayrun = (counter) => {
        let x = employees[counter];
        if (x) {
            //first check if result exist for employee for that period and if not, continue processing.
            result = Payruns.findOne({employeeId: x._id, period: periodFormat, businessId: businessId});
            if (result){
                //add relevant errors
                const error  = {};
                error.employee = `${x.employeeProfile.employeeId} - ${x.profile.fullName}`;
                error.reason = `Payment Exists for Period ${periodFormat}`;
                error.details = `Cannot Process Payroll for Employee ... as Payment for this period exists. To run payroll, Contact Admin to cross-check and delete previous payment data if neccessary`;
                processingError.push(error);

            } else {
                const employeeResult = {
                    businessId: businessId, 
                    employeeId: x._id, 
                    period: periodFormat, 
                    payment : []
                }; //holds every payment to be saved for employee in payrun
                //--
                const year = period.year;
                const month = period.month;

                const firsDayOfPeriod = `${month}-01-${year} GMT`;
                const firsDayOfPeriodAsDate = new Date(firsDayOfPeriod);

                let numDaysEmployeeCanWorkInMonth = getDaysEmployeeCanWorkInMonth(x, firsDayOfPeriodAsDate)
                let totalNumWeekDaysInMonth = getWeekDays(firsDayOfPeriodAsDate, moment(firsDayOfPeriodAsDate).endOf('month').toDate()).length
                
                //--
                //--Time recording things
                const projectsPayDetails = 
                    getFractionForCalcProjectsPayValue(businessId, period.month, period.year, x._id)
                // {duration: , fraction: }
                
                const costCentersPayDetails = 
                    getFractionForCalcCostCentersPayValue(businessId, period.month, period.year, x._id)
                // {duration: , fraction: }                

                let totalHoursWorkedInPeriod = projectsPayDetails.duration + costCentersPayDetails.duration
                //--

                const pg = x.employeeProfile.employment.paygrade;  //paygrade
                let pt = x.employeeProfile.employment.paytypes;  //paytype

                let grade, pgp;  //grade(paygrade) && pgp(paygroup);
                const gradeIndex = _.findLastIndex(paygrades, {_id: pg});
                let empSpecificType;  //contains employee payments derived from paygrade
                if (gradeIndex !== -1) {
                    grade = paygrades[gradeIndex];
                    empSpecificType = determineRule(pt, grade);
                } else {
                    //get paygrade and update paygrades
                    grade = getEmployeeGrade(pg);
                    if (grade) {
                        paygrades.push(grade);
                        empSpecificType = determineRule(pt, grade);
                    }
                }

                if (grade && grade.hasOwnProperty('payGroups') && grade.payGroups.length > 0) {
                    pgp = grade.payGroups[0]; //first element of paygroup// {review}
                }
                //payElemnts derivation;
                const {tax, pension} = getPaygroup(pgp);

                let defaultTaxBucket = 0, pensionBucket = 0, log = [];  //check if pagrade uses default tax bucket
                let assignedTaxBucket, grossIncomeBucket = 0, totalsBucket = 0, reliefBucket = 0;
                let empDerivedPayElements = [];
                let benefit = [], deduction = [], others = [];
                let rules = new ruleJS();

                rules.init();
                let skipToNextEmployee = false;
                //--
                let paymentsAccountingForCurrency = {benefit: {}, deduction: {}, others: {}}
                // Each key in each of the above keys will be a currency code
                // Each object for each currency code will be an array of payments
                //--

                try {
                    //let formular = x.value
                    let paytypes = empSpecificType.map(x => {    //changes paygrades of currently processed employee to include paytypes
                        let ptype = PayTypes.findOne({_id: x.paytype, 'status': 'Active'});
                        delete x.paytype;
                        _.extend(x, ptype);

                        return x;
                    });

                    //import additonal pay and duduction value based on employeeProfile.employeeId for period in collection AdditionalPayments.
                    const addPay = AdditionalPayments.find({businessId: businessId, employee: x.employeeProfile.employeeId, period: periodFormat}).fetch();
                    //include additional pay to match paytype values
                    if(addPay && addPay.length > 0) {
                        let formattedPay = getPaytypeIdandValue(addPay, businessId) || [];
                        if(formattedPay && formattedPay.length > 0) {
                            formattedPay.forEach(x => {
                                let index = _.findLastIndex(paytypes, {_id: x._id});
                                if (index > -1) { //found
                                    paytypes[index].value = x.value;
                                    paytypes[index].additionalPay = true;
                                    //add additional pay flag to skip monthly division
                                }
                            });
                        }
                    }

                    paytypes.forEach((x, index) => {
                        //skip processing of Annual non selected annual paytypes
                        //revisit this to factor in all payment frequency and create a logic on how processing is made
                        if (x.frequency !== 'Annually' || (x.frequency === 'Annually' && specifiedAsProcess(x._id))) {
                            let input = [], processing = [];

                            input.push({
                                code: 'Number of days employee can work in month',
                                value: numDaysEmployeeCanWorkInMonth
                            })
                            input.push({
                                code: 'Number of hours employee can work in month',
                                value: numDaysEmployeeCanWorkInMonth * 8
                            })

                            input.push({
                                code: 'Number of week days in month',
                                value: totalNumWeekDaysInMonth
                            })


                            if(x.isTimeWritingDependent) {
                                input.push({
                                    code: 'Hours worked on projects in month',
                                    value: projectsPayDetails.duration
                                })
                                input.push({
                                    code: 'Hours worked on cost centers in month',
                                    value: costCentersPayDetails.duration
                                })
                                input.push({
                                    code: 'Pay from cost-centers multiplier fraction',
                                    value: costCentersPayDetails.fraction
                                })
                            }

                            let boundary = [...paytypes]; //available types as at current processing
                            boundary.length = index + 1;
                            //format boundary for display in log
                            let clone = boundary.map(x => {
                                let b = {};
                                b.code = x.code;
                                b.value = x.value;
                                return b;
                            });
                            input = input.concat(clone);
                            let formula = x.value;
                            let old = formula;
                            if (formula) {
                                //replace all wagetypes with values
                                for (var i = 0; i < index; i++) {
                                    const code = paytypes[i].code ? paytypes[i].code.toUpperCase() : paytypes[i].code;
                                    const pattern = `\\b${code}\\b`;
                                    const regex = new RegExp(pattern, "g");
                                    formula = formula.replace(regex, paytypes[i].value);

                                }
                                //do the same for all contansts and replace the values
                                //will find a better way of doing this... NOTE
                                let k = Constants.find({'businessId': businessId, 'status': 'Active'}).fetch();  //limit constant to only Bu constant
                                k.forEach(c => {
                                    const code = c.code ? c.code.toUpperCase() : c.code;
                                    const pattern = `\\b${code}\\b`;
                                    const regex = new RegExp(pattern, "g");
                                    formula = formula.replace(regex, c.value);

                                });
                                processing.push({code: x.code, previous: old, derived: formula});
                                var parsed = rules.parse(formula, '');

                                if (parsed.result !== null && !isNaN(parsed.result)) {
                                    //negate value if paytype is deduction.
                                    x.parsedValue = x.type === 'Deduction' ? parsed.result.toFixed(2) * -1 : parsed.result.toFixed(2);  //defaulting to 2 dp ... Make configurable;
                                    //--    
                                    let netPayTypeAmount; //net amount used if payment type is monthly
                                    if(x.frequency === 'Monthly' && !x.additionalPay){
                                        netPayTypeAmount = (x.parsedValue / 12).toFixed(2);
                                        processing.push({code: `${x.code} - Monthly(NET)`, derived: netPayTypeAmount});
                                    }

                                    //if add to total, add wt to totalsBucket
                                    totalsBucket += x.addToTotal ? parseFloat(x.parsedValue) : 0;
                                    
                                    //--
                                    //add parsed value to defaultTax bucket if paytype is taxable
                                    if(tenant.baseCurrency.iso === x.currency) {
                                        defaultTaxBucket += x.taxable ? parseFloat(x.parsedValue) : 0;
                                    } else {
                                        defaultTaxBucket += x.taxable ? getPayAmountInForeignCurrency(x, parseFloat(x.parsedValue), currencyRatesForPeriod) : 0
                                    }
                                    // console.log(`defaultTaxBucket`, defaultTaxBucket)
                                    
                                    //--
                                    //for reliefs add to relief bucket
                                    if(tenant.baseCurrency.iso === x.currency) {
                                        reliefBucket += x.reliefFromTax ? parseFloat(x.parsedValue) : 0;
                                    } else {
                                        reliefBucket += x.reliefFromTax ? getPayAmountInForeignCurrency(x, parseFloat(x.parsedValue), currencyRatesForPeriod) : 0
                                    }

                                    //assigned bucket if one of the paytype is selected as tax bucket
                                    if(tenant.baseCurrency.iso === x.currency) {
                                        if(x._id === tax.bucket) {
                                            assignedTaxBucket = {
                                                title: x.title,
                                                code: x.code,
                                                currency: x.currency || "",
                                                value: parseFloat(x.parsedValue)
                                            }
                                        } else {
                                            assignedTaxBucket = null
                                        }
                                    } else {
                                        if(x._id === tax.bucket) {
                                            assignedTaxBucket = {
                                                title: x.title,
                                                code: x.code,
                                                currency: x.currency || "",
                                                value: getPayAmountInForeignCurrency(x, parseFloat(x.parsedValue), currencyRatesForPeriod)
                                            }
                                        } else {
                                            assignedTaxBucket = null
                                        }
                                    }
                                    // console.log(`assignedTaxBucket`, assignedTaxBucket)

                                    processing.push({code: x.code, taxBucket: defaultTaxBucket});

                                    //if paytype in pension then add to default pension buket
                                    const ptIndex = pension && _.indexOf(pension.payTypes, x._id);
                                    pensionBucket += ptIndex !== -1 ? parseFloat(x.parsedValue) : 0; // add parsed value to pension bucket if paytype is found
                                    //gross income for pension relief;

                                    if(tenant.baseCurrency.iso === x.currency) {
                                        grossIncomeBucket += tax.grossIncomeBucket === x._id ? parseFloat(x.parsedValue) : 0;
                                    } else {
                                        grossIncomeBucket += tax.grossIncomeBucket === x._id ? getPayAmountInForeignCurrency(x, parseFloat(x.parsedValue), currencyRatesForPeriod) : 0
                                    }
                                    processing.push({code: x.code, pensionBucket: pensionBucket});

                                    //set value
                                    let value = 0
                                    if(netPayTypeAmount) {
                                        value = netPayTypeAmount
                                    } else {
                                        value = parseFloat(x.parsedValue);
                                    }
                                    //--
                                    let projectPayAmount = 0
                                    let costCenterPayAmount = 0
                                    let projectsPay = []

                                    if(x.isTimeWritingDependent) {
                                        if(totalHoursWorkedInPeriod > 0 && !x.additionalPay) {
                                            let totalWorkHoursInYear = 2080
                                            let numberOfMonthsInYear = 12
                                            
                                            projectsPayDetails.projectDurations.forEach(aProject => {
                                                // const fraction = aProject.duration * (numberOfMonthsInYear / totalWorkHoursInYear)
                                                const fraction = aProject.duration / (numDaysEmployeeCanWorkInMonth * 8)
                                                let projectPayAmount = fraction * value

                                                projectsPay.push({
                                                    projectId: aProject.project,
                                                    durationInHours: aProject.duration,
                                                    payAmount: projectPayAmount
                                                })
                                            })
                                            projectPayAmount = projectsPayDetails.fraction * value
                                            costCenterPayAmount = costCentersPayDetails.fraction * value
                                            value = projectPayAmount + costCenterPayAmount

                                            processing.push({code: "Pay from projects", derived: projectPayAmount});
                                            processing.push({code: "Pay from cost centers", derived: costCenterPayAmount});

                                            processing.push({code: x.code, derived: "(Pay from projects) + (Pay from cost-center)"});
                                            processing.push({code: x.code, derived: value});
                                        } else {
                                            value = 0
                                            processing.push({code: x.code, derived: value});
                                        }
                                    } else {
                                        processing.push({code: x.code, derived: value});
                                        let totalWorkHoursInYear = 2080
                                        let numberOfMonthsInYear = 12

                                        processing.push({code: x.code + " - (Payment accounting for resumption date)", derived: ` ${value} * (${numDaysEmployeeCanWorkInMonth}) / ${totalNumWeekDaysInMonth})`});

                                        costCenterPayAmount = value * ((numDaysEmployeeCanWorkInMonth) / totalNumWeekDaysInMonth)

                                        value = costCenterPayAmount

                                        processing.push({code: x.code, derived: value});
                                    }
                                    //--
                                    let valueInForeignCurrency = value
                                    if(tenant.baseCurrency.iso !== x.currency) {
                                        let currencyRateForPayType = _.find(currencyRatesForPeriod, (aCurrency) => {
                                            return aCurrency.code === x.currency
                                        })
                                        // if(currencyRateForPayType) {
                                        //     if(!isNaN(currencyRateForPayType.rateToBaseCurrency)) {
                                        //         value = value * currencyRateForPayType.rateToBaseCurrency
                                        //     }
                                        // }
                                    }
                                    //--
                                    switch (x.type) {
                                        case 'Benefit':                                            
                                            //add to payslip benefit if display in payslip
                                            if (x.addToTotal) {
                                                let paymentObj = {
                                                    title: x.title,
                                                    code: x.code,
                                                    currency: x.currency || "",
                                                    value, 
                                                    valueInForeignCurrency
                                                }
                                                benefit.push(paymentObj);
                                                let paymentsForCurrency = paymentsAccountingForCurrency.benefit[x.currency]
                                                if(!paymentsForCurrency) {
                                                    paymentsAccountingForCurrency.benefit[x.currency] = {payments: []}
                                                }
                                                paymentsAccountingForCurrency.benefit[x.currency].payments.push({
                                                    title: x.title,
                                                    code: x.code,
                                                    currency: x.currency,
                                                    taxable: x.taxable,
                                                    value
                                                })
                                            } else if(!x.addToTotal){
                                                others.push({
                                                    title: x.title,
                                                    code: x.code,
                                                    currency: x.currency || "",
                                                    value,
                                                    valueInForeignCurrency
                                                });
                                                let paymentsForCurrency = paymentsAccountingForCurrency.others[x.currency]
                                                if(!paymentsForCurrency) {
                                                    paymentsAccountingForCurrency.others[x.currency] = {payments: []}
                                                }
                                                paymentsAccountingForCurrency.others[x.currency].payments.push({
                                                    title: x.title,
                                                    code: x.code,
                                                    currency: x.currency,
                                                    taxable: x.taxable,
                                                    value
                                                })
                                            }
                                            break;
                                        case 'Deduction':
                                            if (x.addToTotal){
                                                deduction.push({
                                                    title: x.title,
                                                    code: x.code,
                                                    currency: x.currency || "",
                                                    value,
                                                    valueInForeignCurrency: ''
                                                });
                                                let paymentsForCurrency = paymentsAccountingForCurrency.deduction[x.currency]
                                                if(!paymentsForCurrency) {
                                                    paymentsAccountingForCurrency.deduction[x.currency] = {payments: []}
                                                }
                                                paymentsAccountingForCurrency.deduction[x.currency].payments.push({
                                                    title: x.title,
                                                    code: x.code,
                                                    currency: x.currency,
                                                    taxable: x.taxable,  // redundant. Deductions can't be taxable
                                                    value
                                                })
                                            } else if(!x.addToTotal){
                                                others.push({
                                                    title: x.title,
                                                    code: x.code,
                                                    currency: x.currency || "",
                                                    value,
                                                    valueInForeignCurrency
                                                });
                                                let paymentsForCurrency = paymentsAccountingForCurrency.others[x.currency]
                                                if(!paymentsForCurrency) {
                                                    paymentsAccountingForCurrency.others[x.currency] = {payments: []}
                                                }
                                                paymentsAccountingForCurrency.others[x.currency].payments.push({
                                                    title: x.title,
                                                    code: x.code,
                                                    currency: x.currency,
                                                    taxable: x.taxable,
                                                    value
                                                })
                                            }
                                    }
                                    
                                    //add value to result
                                    employeeResult.payment.push({
                                        id: x._id, reference: 'Paytype', 
                                        amountLC: value, amountPC: valueInForeignCurrency, 
                                        
                                        projectPayAmount: projectPayAmount, 
                                        costCenterPayAmount: costCenterPayAmount,
                                        projectsPay: projectsPay,

                                        code: x.code, description: x.title, 
                                        type: (x.displayInPayslip && !x.addToTotal) ? 'Others': x.type 
                                    });
                                    log.push({paytype: x.code, input: input, processing: processing});
                                } else {
                                    //when there is an error, stop processing this employee and move to the next one
                                    processing.push({code: x.code, derived: `Unable to handle Paytype Derivative ${formula}  = ${parsed}`});
                                    log.push({paytype: x.code, input: input, processing: processing});
                                    throw new PaytypeException('Unable to handle Paytype Derivative', `${formula}  = ${parsed.error}`);
                                }
                                empDerivedPayElements.push(x);
                                //
                            }
                        }
                    })
                    // console.log(`paymentsAccountingForCurrency: `, JSON.stringify(paymentsAccountingForCurrency))
                } catch (e) {
                    const error  = {};
                    error.employee = `${x.employeeProfile.employeeId} - ${x.profile.fullName}`;
                    error.reason = e.message;
                    error.details = e.paytype;
                    processingError.push(error);

                    //set processing to false and do not save result.
                    skipToNextEmployee = true
                }

                if(!skipToNextEmployee) {//further processing after evaluation of all paytypes! pension calculation and tax calculation
                    //get employee and employer contribution
                    const {employerPenContrib, employeePenContrib, grossPension, pensionLog} = getPensionContribution(pensionBucket, pension);  //@@technicalPaytype
                    //populate result for employee and employer pension contribution
                    if(pension){
                        employeeResult.payment.push({id: pension._id, reference: 'Pension', amountLC: employeePenContrib, amountPC: employeePenContrib, code: pension.code + '_EE', description: pension.name + ' Employee', type: 'Deduction'});
                        employeeResult.payment.push({id: pension._id, reference: 'Pension', amountLC: employerPenContrib, amountPC: employerPenContrib, code: pension.code + '_ER', description: pension.name + ' Employer', type: 'Others'});

                    }
                   if(pensionLog)    //add pension calculation log
                        log.push(pensionLog);
                    //add employee to relief Bucket
                    reliefBucket += (grossPension || 0); //nagate employee Pension contribution and add to relief bucket

                    //--Tax processing follows
                    // let netTax = null
                    let netTaxLocal = 0
                    let netTaxForeign = 0
                    let taxLog = null
                    
                    const effectiveTaxDetails = Tax.findOne({isUsingEffectiveTaxRate: true, employees: x._id, status: 'Active'});
                    if(effectiveTaxDetails) {
                        const taxComputationInput = [
                            {code: 'Effective Tax Rate', value: effectiveTaxDetails.effectiveTaxRate}, 
                            // {code: 'TaxBucket', value: taxBucket}
                        ];

                        if(assignedTaxBucket) {
                            netTaxLocal = (assignedTaxBucket.value * effectiveTaxDetails.effectiveTaxRate)
                            taxComputationInput.push(
                                {code: 'TaxBucket', value: assignedTaxBucket.value}
                            )
                            const taxProcessing = [];
                            taxProcessing.push({code: 'Tax', derived: '(taxBucket * Effective Tax Rate)'});
                            taxProcessing.push({code: 'Tax', derived: netTaxLocal });

                            netTaxLocal = parseFloat(netTaxLocal).toFixed(2)
                            taxLog = {paytype: effectiveTaxDetails.code, input: taxComputationInput, processing: taxProcessing};

                            //populate result for tax
                            if(tenant.baseCurrency.iso === assignedTaxBucket.currency) {
                                employeeResult.payment.push({id: tax._id, reference: 'Tax', amountLC: netTaxLocal, amountPC: netTaxLocal, code: tax.code, description: tax.name, type: 'Deduction'  });
                            } else {
                                employeeResult.payment.push({id: tax._id, reference: 'Tax', amountLC: '', amountPC: netTaxLocal, code: tax.code, description: tax.name, type: 'Deduction'  });
                            }
                        } else {
                            let taxableIncomeInDiffCurrencies = {}

                            let benefitsDeductionsAndOthers = Object.keys(paymentsAccountingForCurrency)
                            benefitsDeductionsAndOthers.forEach(aPayCategory => {
                                let payCategoryCurrencies = Object.keys(paymentsAccountingForCurrency[aPayCategory])
                                payCategoryCurrencies.forEach(aCurrency => {
                                    if(!taxableIncomeInDiffCurrencies[aCurrency]) {
                                        taxableIncomeInDiffCurrencies[aCurrency] = 0
                                    }

                                    let paymentsInCurrency = paymentsAccountingForCurrency[aPayCategory][aCurrency]
                                    paymentsInCurrency.payments.forEach(aPayment => {
                                        if(aPayment.taxable) {
                                            let paymentAsFloat = parseFloat(aPayment.value)
                                            if(!isNaN(paymentAsFloat)) {
                                                taxableIncomeInDiffCurrencies[aCurrency] += paymentAsFloat
                                            }
                                        }
                                    })
                                })
                            })
                            // console.log(`taxableIncomeInDiffCurrencies: `, JSON.stringify(taxableIncomeInDiffCurrencies))
                            //--
                            const taxProcessing = [];

                            let taxCurrencies = Object.keys(taxableIncomeInDiffCurrencies)
                            taxCurrencies.forEach(aCurrency => {
                                let taxableIncome = taxableIncomeInDiffCurrencies[aCurrency]        

                                if(!paymentsAccountingForCurrency.deduction[aCurrency]) {
                                    paymentsAccountingForCurrency.deduction[aCurrency] = {payments: []}
                                }

                                if(aCurrency === tenant.baseCurrency.iso) {
                                    netTaxLocal = (taxableIncome * effectiveTaxDetails.effectiveTaxRate)                                    
                                    paymentsAccountingForCurrency.deduction[aCurrency].payments.push({
                                        title: tax.name,
                                        code: tax.code,
                                        currency: aCurrency,
                                        // taxable: true,
                                        reference: 'Tax',
                                        value: netTaxLocal
                                    })
                                } else {
                                    netTaxForeign = (taxableIncome * effectiveTaxDetails.effectiveTaxRate)
                                    paymentsAccountingForCurrency.deduction[aCurrency].payments.push({
                                        title: tax.name,
                                        code: tax.code,
                                        currency: aCurrency,
                                        // taxable: true,
                                        reference: 'Tax',
                                        value: netTaxForeign
                                    })
                                }
                                //--
                                taxComputationInput.push({
                                    code: `TaxBucket(${aCurrency})`, 
                                    value: taxableIncome
                                })
                                //--
                                taxProcessing.push({code: `Tax(${aCurrency})`, derived: '(TaxBucket * Effective Tax Rate)'});
                                taxProcessing.push({code: `Tax(${aCurrency})`, derived: (taxableIncome * effectiveTaxDetails.effectiveTaxRate) });
                            })
                            //--
                            taxLog = {paytype: effectiveTaxDetails.code, input: taxComputationInput, processing: taxProcessing};

                            employeeResult.payment.push({
                                id: tax._id, reference: 'Tax', 
                                amountLC: netTaxLocal, amountPC: netTaxForeign, 
                                code: tax.code, description: tax.name, 
                                type: 'Deduction'
                            });
                        }
                    } else {
                        let taxBucket = null; 
                        if(assignedTaxBucket) {//automatically use default tax bucket if tax bucket not found
                            taxBucket = assignedTaxBucket.value
                        } else {
                            taxBucket = defaultTaxBucket
                        }
                        let taxCalculationResult = calculateTax(reliefBucket, taxBucket, grossIncomeBucket, tax);  //@@technicalPaytype

                        netTaxLocal = taxCalculationResult.netTax
                        taxLog = taxCalculationResult.taxLog

                        //populate result for tax
                        employeeResult.payment.push({id: tax._id, reference: 'Tax', amountLC: netTaxLocal, amountPC: netTaxLocal, code: tax.code, description: tax.name, type: 'Deduction'  });
                    }

                    if(taxLog)
                        log.push(taxLog);
                    //collate results and populate paySlip; and push to payresult
                    let final = {};
                    final.log = log; //payrun processing log

                    final.payslip = {benefit: benefit, deduction: deduction}; //pension and tax are also deduction
                    final.payslip.deduction.push({
                        title: tax.code, 
                        code: tax.name, 
                        value: netTaxLocal * -1, 
                        valueInForeignCurrency: netTaxForeign * -1
                    }); // negate add tax to deduction
                    //--End of Tax processing

                    if(pension) {
                        let valueInForeignCurrency = employeePenContrib * -1
                        final.payslip.deduction.push({title: `${pension.code}_EE`, code: pension.name, value: employeePenContrib * -1, valueInForeignCurrency});

                        if(pension.displayEmployerInPayslip) {                         
                            valueInForeignCurrency = employerPenContrib
                            final.payslip.others = others.concat([{title: `${pension.code}_ER`, code: `${pension.name} Employer`, value: employerPenContrib, valueInForeignCurrency}]); //if employer contribution (displayEmployerInPayslip) add to other payments
                        }
                    } else {
                        final.payslip.others = others
                    }
                    //--
                    final.payslipWithCurrencyDelineation = paymentsAccountingForCurrency
                    //--
                    let benefitsDeductionsAndOthers = Object.keys(paymentsAccountingForCurrency)
                    benefitsDeductionsAndOthers.forEach(aPayCategory => {
                        let payCategoryCurrencies = Object.keys(paymentsAccountingForCurrency[aPayCategory])

                        payCategoryCurrencies.forEach(aCurrency => {
                            let total = 0

                            let paymentsInCurrency = paymentsAccountingForCurrency[aPayCategory][aCurrency]
                            if(!paymentsInCurrency) {
                                paymentsAccountingForCurrency[aPayCategory][aCurrency] = {payments: []}
                                paymentsInCurrency = paymentsAccountingForCurrency[aPayCategory][aCurrency]
                            }
                            paymentsInCurrency.payments.forEach(aPayment => {
                                let paymentAsFloat = parseFloat(aPayment.value)
                                if(!isNaN(paymentAsFloat)) {
                                    total += paymentAsFloat
                                }
                            })
                            paymentsInCurrency.total = total
                        })
                    })
                    const employeeDetails = getDetailsInPayslip(x);
                    paymentsAccountingForCurrency.employee = employeeDetails;
                    paymentsAccountingForCurrency.employee.grade = grade.code;
                    paymentsAccountingForCurrency.employee.gradeId = grade._id;

                    //--
                    //calculate net payment as payment - deductions;
                    // negate and add pension to deduction
                    const totalPayment = sumPayments(final.payslip.benefit);
                    const totalDeduction = sumPayments(final.payslip.deduction);
                    const netPayment = parseFloat(totalPayment) + parseFloat(totalDeduction);    //@@technicalPaytype

                    //populate result for net payment
                    employeeResult.payment.push({reference: 'Standard', amountLC: netPayment, amountPC: getNetPayInForeignCurrency(netPayment, grade, currencyRatesForPeriod), code: 'NMP', description: 'Net Payment', type: 'netPayment' });
                    employeeResult.payment.push({reference: 'Standard-1', amountLC: totalDeduction, amountPC: getNetPayInForeignCurrency(totalDeduction, grade, currencyRatesForPeriod), code: 'TDEDUCT', description: 'Total Deduction', type: 'totalDeduction' });

                    final.payslip.totalPayment = totalPayment;
                    final.payslip.totalDeduction = totalDeduction;
                    final.payslip.netPayment = netPayment;


                    //Add currently process employee details to final.payslip.employee
                    const employee = getDetailsInPayslip(x);
                    final.payslip.employee = employee;
                    final.payslip.employee.grade = grade.code;
                    final.payslip.employee.gradeId = grade._id;
                    final.payslip.period = period

                    //payement will also be sent to result for factoring and storage;
                    payresult.push(final);

                    // also push employee result
                    payrun.push(employeeResult);

                    //factor payments for storage if not simulation

                    //map default buckets and paytypes used to assigned in config.
                } else {
                    //when there is an exception
                    let final = {};
                    final.log = log; //payrun processing log
                    final.payslip = {benefit: [], deduction: []};

                    //Add currently process employee details to final.payslip.employee
                    const employee = getDetailsInPayslip(x);
                    final.payslip.employee = employee;
                    if(grade) {
                        final.payslip.employee.grade = grade.code;
                    } else {
                        final.payslip.employee.grade = "";                        
                    }
                    final.error = true;

                    //payement will also be sent to result for factoring and storage;
                    payresult.push(final);
                }
            }

            count++;
            runPayrun(count);
        } else {
            // end of recursion

        }

    };

    runPayrun(count);
    //after the recurssion return result to calling function;
    return {result: payresult, error:processingError, payrun};
};

function getDaysEmployeeCanWorkInMonth(employee, firstDayOfMonthDateObj) {
    let employeeResumption = employee.employeeProfile.employment.hireDate
    // console.log(`\n employee id: `, employee._id)
    let employeeResumptionMoment = moment(employeeResumption)

    let monthDateMoment = moment(firstDayOfMonthDateObj)


    let endOfMonthDate = moment(firstDayOfMonthDateObj).endOf('month').toDate()

    let numDaysToWorkInMonth = 0

    if(employeeResumptionMoment.year() === monthDateMoment.year()) {
        if (employeeResumptionMoment.month() === monthDateMoment.month()) {
            numDaysToWorkInMonth = getWeekDays(employeeResumption, endOfMonthDate).length
        } else if(employeeResumptionMoment.month() > monthDateMoment.month()) {
            numDaysToWorkInMonth = 0
        } else {
            numDaysToWorkInMonth = getWeekDays(firstDayOfMonthDateObj, endOfMonthDate).length
        }
    } else if(employeeResumptionMoment.year() > monthDateMoment.year()) {
        numDaysToWorkInMonth = 0
    } else if(employeeResumptionMoment.year() < monthDateMoment.year()) {
        numDaysToWorkInMonth = getWeekDays(firstDayOfMonthDateObj, endOfMonthDate).length
    }

    return numDaysToWorkInMonth
}

function getWeekDays(startDate, endDate) {
    let startDateMoment = moment(startDate)
    let endDateMoment = moment(endDate)

    let numberOfDays = endDateMoment.diff(startDateMoment, 'days') + 1

    let startDateMomentClone = moment(startDateMoment); // use a clone
    let weekDates = []

    while (numberOfDays > 0) {
        if (startDateMomentClone.isoWeekday() !== 6 && startDateMomentClone.isoWeekday() !== 7) {
            weekDates.push(moment(startDateMomentClone).toDate())  // calling moment here cos I need a clone
        }
        startDateMomentClone.add(1, 'days');
        numberOfDays -= 1;
    }
    return weekDates
}

function getPayAmountInForeignCurrency(payTypeDetails, amountInLocalCurrency, currencyRatesForPeriod) {
    let amountInForeignCurrency = null

    let currencyRateForPayType = _.find(currencyRatesForPeriod, (aCurrency) => {
        return aCurrency.code === payTypeDetails.currency
    })
    if(currencyRateForPayType) {
        if(!isNaN(currencyRateForPayType.rateToBaseCurrency)) {
            amountInForeignCurrency = amountInLocalCurrency * currencyRateForPayType.rateToBaseCurrency
        }
    }
    return amountInForeignCurrency
}

/*
    This function can also be used for the total deduction
 */
function getNetPayInForeignCurrency(amountInLocalCurrency, payGrade, currencyRatesForPeriod) {
    if(payGrade) {
        let netPayAlternativeCurrency = payGrade.netPayAlternativeCurrency
    
        let currencyInPeriod = _.find(currencyRatesForPeriod, (aCurrency) => {
            return aCurrency.code === netPayAlternativeCurrency
        })

        if(currencyInPeriod) {
            let rateToBaseCurrency = currencyInPeriod.rateToBaseCurrency
            return (rateToBaseCurrency > 0) ? (amountInLocalCurrency / rateToBaseCurrency).toFixed(2) : amountInLocalCurrency
        } else {
            return amountInLocalCurrency
        }
    } else {
        return amountInLocalCurrency
    }
}

function getFractionForCalcProjectsPayValue(businessId, periodMonth, periodYear, employeeUserId) {
    const firsDayOfPeriod = `${periodMonth}-01-${periodYear} GMT`;

    const startDate = moment(new Date(firsDayOfPeriod)).startOf('month').toDate();
    const endDate = moment(startDate).endOf('month').toDate();

    let queryObj = {
        businessId: businessId, 
        project: {$exists : true},
        day: {$gte: startDate, $lt: endDate},
        employeeId: employeeUserId,
        status: 'Approved'
    }

    let allProjectTimesInMonth = TimeWritings.aggregate([
        { $match: queryObj},
        { $group: {
          _id: {
            "empUserId": "$employeeId",
            "project": "$project"
          }, 
          duration: { $sum: "$duration" }
        } }
    ]);
    //--
    let totalWorkHoursInYear = 2080
    let numberOfMonthsInYear = 12

    if(allProjectTimesInMonth) {
        if(allProjectTimesInMonth.length > 0) {
            // console.log(`allProjectTimesInMonth: `, allProjectTimesInMonth)
            let projectDurations = []

            let totalProjectsDuration = 0
            allProjectTimesInMonth.forEach(aProjectTime => {
                totalProjectsDuration += aProjectTime.duration
                projectDurations.push({
                    project: aProjectTime._id.project, 
                    duration: aProjectTime.duration
                })
            })
            const fraction = totalProjectsDuration * numberOfMonthsInYear / totalWorkHoursInYear
            return {duration: totalProjectsDuration, fraction, projectDurations}
        } else {
            return {duration: 0, fraction: 0, projectDurations: []}
        }
    } else {
        return {duration: 0, fraction: 0, projectDurations: []}
    }
}

function getFractionForCalcCostCentersPayValue(businessId, periodMonth, periodYear, employeeUserId) {
    const firsDayOfPeriod = `${periodMonth}-01-${periodYear} GMT`;

    const startDate = moment(new Date(firsDayOfPeriod)).startOf('month').toDate();
    const endDate = moment(startDate).endOf('month').toDate();

    let queryObj = {
        businessId: businessId, 
        costCenter: {$exists : true},
        day: {$gte: startDate, $lt: endDate},
        employeeId: employeeUserId,
        status: 'Approved'
    }

    let allCostCenterTimesInMonth = TimeWritings.aggregate([
        { $match: queryObj},
        { $group: {_id: "$employeeId", duration: { $sum: "$duration" }}}
    ]);
    //--
    let totalWorkHoursInYear = 2080
    let numberOfMonthsInYear = 12

    if(allCostCenterTimesInMonth) {
        if(allCostCenterTimesInMonth.length === 1) {
            const duration = allCostCenterTimesInMonth[0].duration
            const fraction = duration * numberOfMonthsInYear / totalWorkHoursInYear
            return {duration, fraction}
        } else {
            return {duration: 0, fraction: 0}
        }
    } else {
        return {duration: 0, fraction: 0}
    }
}


function derivePayElement(person) {
    let gradePaytypes = PayGrades.find({_id: person.employeeProfile.employment.paygrade});

    return "done";
    //get employee pay grade
}

function getEmployeeGrade(gradeId) {
    return PayGrades.findOne({_id: gradeId, status: 'Active'});
}

function determineRule(paytype, grade) {
    //grade contains processing rules while paytypes contains personal employee rules
    let pt = [...grade.payTypes];
    const empGrade = pt.map(x => {
        const newX = {...x}
        let index = _.findLastIndex(paytype, {'paytype': x.paytype});
        if (index !== -1) {
            //derive rule based on employee assigned if no value assinged, use grade derivative
            if (paytype[index].value) {
                newX.value = paytype[index].value;
            }
        }
        //return same rule
        return newX;
    });

    return empGrade;
}
function getPaygroup(paygrade) {
    const pg = PayGroups.findOne({_id: paygrade, status: 'Active'});
    const penTax = {};
    if (pg) {
        if (pg.tax) {
            const tax = Tax.findOne({_id: pg.tax, status: 'Active'});
            tax ? penTax.tax = tax : null;
        }
        if (pg.pension) {
            const pension = Pensions.findOne({_id: pg.pension, status: 'Active'});
            pension ? penTax.pension = pension : null;
        }
    }
    return penTax;

}


//return employer and employee contribution
function getPensionContribution(pensionBucket, pension) {
    //@import pension bucket float, pension doc.
    //all elements of pension already derived into pensionBucket
    //calculate employer and employee contribution
    if (pension) {
        const input = [{code: 'Pension Bucket', value: pensionBucket}];
        const processing = [];
        const eerate = pension.employeeContributionRate;
        const errate = pension.employerContributionRate;
        const employee = (eerate / 100) * pensionBucket;
        processing.push({code: `Employee rate`, derived: `(${eerate} / 100) * ${pensionBucket}` });
        processing.push({code: `Employee rate`, derived: employee });
        const employer = (errate / 100) * pensionBucket;
        processing.push({code: `Employer rate`, derived: `(${errate} / 100) * ${pensionBucket}` });
        processing.push({code: `Employer rate`, derived: employer });
        const netee = employee / 12;
        const neter = employer / 12;
        //log for net employee contribution
        processing.push({code: `Employer rate`, derived: `(${employer} / 12) ` });
        processing.push({code: `Employer Net Rate`, derived: neter });

        //log for net employee contribution
        processing.push({code: `Employee rate`, derived: `(${employee} / 12) ` });
        processing.push({code: `Employee Net Rate`, derived: netee });

        const log = {paytype: pension.code, input: input, processing: processing};
        return {employeePenContrib: parseFloat(netee).toFixed(2), employerPenContrib: parseFloat(neter).toFixed(2), grossPension: employee, pensionLog: log};
    } else {
        return {employeePenContrib: null, employerPenContrib: null}
    }

}

//from taxable income calculate tax and return value
function calculateTax(relief, taxBucket, grossIncomeBucket, tax) {
    //@import taxBucket (defualt tax bucket or valuated passed bucket)
    //@import tax (tax doc configured )
    //calculate reliefs
    //no checks done yet exceptions NAN undefined checkes
    //return result {finalTax: log[] }
    const input = [{code: 'Relief', value: relief}, {code: 'TaxBucket', value: taxBucket}, {code: 'GrossIncomeBucket', value: grossIncomeBucket}];
    const processing = [];
    const grossIncomeRelief = (tax.grossIncomeRelief / 100) * grossIncomeBucket;
    processing.push({code: 'Gross Income Relief', derived: '(grossIncomeRelief / 100) * grossIncomeBucket'});
    processing.push({code: 'Gross Income Relief', derived: grossIncomeRelief });

    const consolidatedRelief = tax.consolidatedRelief;
    processing.push({code: `Consolidated Relief defined in ${tax.code}`, derived: consolidatedRelief });
    
    const totalRelief = grossIncomeRelief + consolidatedRelief + relief;
    processing.push({code: `Total Relief`, derived: 'grossIncomeRelief + consolidatedRelief + relief' });
    processing.push({code: `Total Relief`, derived: totalRelief });
    
    let taxableIncome = taxBucket - totalRelief;
    processing.push({code: `Taxable Income`, derived: 'taxBucket - totalRelief' });
    processing.push({code: `Taxable Income`, derived: taxableIncome });

    let totalTax = 0;
    //apply tax rules on taxable income
    const rules = [...tax.rules];

    let isTaxableIncomeLessThanFirstUpperLimit =  false

    //add log for debugging
    //deduct upper limit from taxable income
    //no need to calcuate tax if taxable income-
    if (taxableIncome >= rules[0].upperLimit) {
        for (let i = 0; i < rules.length; i++) {
            let x = rules[i];
            if (x.range !== 'Over') {
                processing.push({code: `Total Tax(${x.range} ${x.upperLimit})`, derived: `${x.rate} * (${taxableIncome} - ${x.upperLimit}) / 100` });
                if (taxableIncome >= x.upperLimit) {
                    taxableIncome -= x.upperLimit;
                    totalTax += x.rate * (x.upperLimit / 100);
                } else {
                    totalTax += x.rate * (taxableIncome / 100);
                    break;
                }
                processing.push({code: `Total Tax(${x.range} ${x.upperLimit})`, derived: totalTax });
            } else {
                processing.push({code: `Total Tax(${x.range} ${x.upperLimit})`, derived: `${x.rate} * (${taxableIncome}) / 100` });
                totalTax += x.rate * (taxableIncome / 100);
                processing.push({code: `Total Tax(${x.range} ${x.upperLimit})`, derived: totalTax });
            }
        }
    } else {
        isTaxableIncomeLessThanFirstUpperLimit = true
    }
    const netTax = totalTax / 12;
    if(isTaxableIncomeLessThanFirstUpperLimit) {
        processing.push({code: `Net Tax(Total Tax / 12 ) - {Fail! Taxable income is less than first upper limit of tax rule}`, derived: `${totalTax}` / 12 });
        processing.push({code: `Net Tax - {Fail! Taxable income is less than first upper limit of tax rule}`, derived: netTax });
    } else {
        processing.push({code: `Net Tax(Total Tax / 12 )`, derived: `${totalTax}` / 12 });
        processing.push({code: `Net Tax`, derived: netTax });
    }
    const log = {paytype: tax.code, input: input, processing: processing};

    return {netTax: parseFloat(netTax).toFixed(2), taxLog: log};
}

/*
Sum payments in groups
@import array
 */

function sumPayments(payments){
    const newPay = [...payments];
    const sum = newPay.reduce(function(total, val) {
        return total + parseFloat(val.value);
    }, 0);
    return parseFloat(sum).toFixed(2) ;
}

/*
import employee doc.
return {} object containing employee details to be displayed on payslip
 */
function getDetailsInPayslip(employee){
    let details = {};
    details.employeeUserId = employee._id;
    details.employeeId = employee.employeeProfile.employeeId;
    details.fullname = employee.profile.fullName;
    details.accountNumber = employee.employeeProfile.payment.accountNumber || "";
    details.bank = employee.employeeProfile.payment.bank || "";
    // add other details

    return details;
}

function getPaytypeIdandValue(additionalPay, businessId) {
    let newAddPay = [...additionalPay];
    let paytypes = []; //lazyload paytypes to reduce number of database query.
    newAddPay.forEach(x => {
        const paytype = PayTypes.findOne({code: x.paytype, businessId: businessId, status: 'Active'});
        if(paytype)
            paytype.value = x.amount.toString();   // add the value as additional pay value
            paytypes.push(paytype);
    });
    return paytypes;
}

function PaytypeException(message, paytype) {
    this.message = message;
    this.name = 'PaytypeEvaluationException';
    this.paytype = paytype;
}