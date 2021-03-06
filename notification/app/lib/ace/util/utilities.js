/*
import accounting from 'accounting';

/!*
 *
 *  Spacebars helpers
 * See: http://docs.meteor.com/#/full/template_registerhelper
 *
 *!/

/!**
 * registerHelper monthOptions
 * @summary formats moment.js months into an array for autoform selector
 * @return {Array} returns array of months [value:, label:]
 *!/
Template.registerHelper("monthOptions", function () {
  let label = i18n.t("app.monthOptions") || "Choose month";
  let monthOptions = [{
    value: "",
    label: label
  }];
  let months = moment.months();
  for (let index in months) {
    if ({}.hasOwnProperty.call(months, index)) {
      let month = months[index];
      monthOptions.push({
        value: parseInt(index, 10) + 1,
        label: month
      });
    }
  }
  return monthOptions;
});

/!**
 * yearOptions
 * @summary formats moment.js next 9 years into array for autoform selector
 * @return {Array} returns array of years [value:, label:]
 *!/
Template.registerHelper("yearOptions", function () {
  let _i;
  let label = i18n.t("app.yearOptions") || "Choose year";
  let yearOptions = [{
    value: "",
    label: label
  }];
  let year = new Date().getFullYear();
  for (x = _i = 1; _i < 9; x = _i += 1) {
    yearOptions.push({
      value: year,
      label: year
    });
    year++;
  }
  return yearOptions;
});

/!**
 * timezoneOptions
 * @summary formats moment.js timezones into array for autoform selector
 * @return {Array} returns array of timezones [value:, label:]
 *!/
Template.registerHelper("timezoneOptions", function () {
  let label = i18n.t("app.timezoneOptions") || "Choose timezone";
  let timezoneOptions = [{
    value: "",
    label: label
  }];
  let timezones = moment.tz.names();
  for (let timezone of timezones) {
    timezoneOptions.push({
      value: timezone,
      label: timezone
    });
  }
  return timezoneOptions;
});

/!**
 * pathForSEO
 * @summary get current router path
 * @param {String} path - path to featch
 * @param {Object} params - url params
 * @return {String} returns current router path
 *!/
Template.registerHelper("pathForSEO", function (path, params) {
  if (this[params]) {
    return "/" + path + "/" + this[params];
  }
  return Router.path(path, this);
});

/!**
 * camelToSpace
 * @summary convert a camelcased string to spaces
 * @param {String} str - camelcased string
 * @return {String} returns space formatted string
 *!/
Template.registerHelper("camelToSpace", function (str) {
  let downCamel;
  downCamel = str.replace(/\W+/g, "-").replace(/([a-z\d])([A-Z])/g, "$1 $2");
  return downCamel.toLowerCase();
});

/!**
 * toLowerCase
 * @summary convert a string to lower case
 * @param {String} str - string
 * @return {String} returns lowercased string
 *!/
Template.registerHelper("toLowerCase", function (str) {
  return str.toLowerCase();
});

/!**
 * toUpperCase
 * @summary convert a string to upper case
 * @param {String} str - string
 * @return {String} returns uppercased string
 *!/
Template.registerHelper("toUpperCase", function (str) {
  return str.toUpperCase();
});

/!**
 * capitalize
 * @summary capitalize first character of string
 * @param {String} str - string
 * @return {String} returns string with first letter capitalized
 *!/
Template.registerHelper("capitalize", function (str) {
  return s.capitalize(str);
});

/!**
 * toCamelCase
 * @summary camelCases a string
 * @param {String} str - string
 * @return {String} returns camelCased string
 *!/
Template.registerHelper("toCamelCase", function (str) {
  if (!!str) return str.toCamelCase();
});

/!**
 * activeRouteClass
 * @summary registerHelper activeRouteClass
 * @return {String} return "active" if this current path
 *!/
Template.registerHelper("activeRouteClass", function () {
  let args = Array.prototype.slice.call(arguments, 0);
  args.pop();
  let active = _.any(args, function (name) {
    return location.pathname === Router.path(name);
  });
  return active && "active";
});


/!*
 *  General helpers for template functionality
 *!/

/!**
 * condition
 * @summary conditional string comparison template helper
 * @example {{#if condition status "eq" ../value}}
 * @param {String} v1 - first variable to compare
 * @param {String} operator - eq,neq,ideq,or,lt,gt comparision operator
 * @param {String} v2 - second variable to compare
 * @return {Boolean} returns true/false
 *!/


/!**
 * orElse
 * @summary if this is true, or else this
 * @param {String} v1 - variable one
 * @param {String} v2 - variable two
 * @return {String} returns v1 || v2
 *!/
Template.registerHelper("orElse", function (v1, v2) {
  return v1 || v2;
});

/!**
 * key_value
 * @summary template helper pushing object key/value into array
 * @param {Object} context - object to parse into key / value
 * @return {Array} returns array[key:,value:]
 *!/
Template.registerHelper("key_value", function (context) {
  let result;
  result = [];
  _.each(context, function (value, key) {
    return result.push({
      key: key,
      value: value
    });
  });
  return result;
});

/!**
 * nl2br
 * @summary template helper nl2br - Converts new line (\n\r) to <br>
 * from http://phpjs.org/functions/nl2br:480
 * @param {String} text - text
 * @returns {String} returns formatted Spacebars.SafeString
 *!/
Template.registerHelper("nl2br", function (text) {
  let nl2br;
  nl2br = (text + "").replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, "$1" +
    "<br>" + "$2");
  return new Spacebars.SafeString(nl2br);
});

/!**
 * dateFormat
 * @description
 * format an ISO date using Moment.js
 * http://momentjs.com/
 * moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
 * @example {{dateFormat creation_date format="MMMM YYYY"}}
 * @param {String} context - moment context
 * @param {String} block - hash of moment options, ie: format=""
 * @return {Date} return formatted date
 *!/
Template.registerHelper("dateFormat", function (context, block) {
  let f;
  if (window.moment) {
    f = block.hash.format || "MMM DD, YYYY hh:mm:ss A";
    return moment(context).format(f);
  }
  return context;
});

/!**
 * pluralize
 * @summary general helper for plurization of strings
 * @example {{plurize "1 thing"}}
 * @param {String} nCount - number, ie "1 "
 * @param {String} pString - plural string ie " thing"
 * @todo adapt to, and use i18next
 *!/
Template.registerHelper("pluralize", function (nCount, pString) {
  if (nCount === 1) {
    return "1 " + pString;
  }
  return nCount + " " + pString + "s";
});

/!**
 * active
 * @summary general helper to return "active" when on current path
 * @example {{active "route"}}
 * @param {String} path - iron router path
 * @return {String} return 'active' or null
 *!/
Template.registerHelper("active", function (path) {
  let current;
  let routeName;
  current = Router.current();
  routeName = current && current.route.getName();
  if (routeName === path) {
    return "active";
  }
  return "";
});


/!**
 * navLink
 * @summary general helper to return "active" when on current path
 * @example {{navLink "projectsList" "icon-edit"}}
 * @param {String} page - iron-router path
 * @param {String} icon - icon class
 * @return {String} returns formatted, SafeString anchor html
 *!/
Template.registerHelper("navLink", function (page, icon) {
  let ret;
  ret = "<li ";
  if (Meteor.Router.page() === page) {
    ret += `class="active"`;
  }
  ret +=
    `><a href="${Meteor.Router.namedRoutes[page].path}"><i class="${icon}" icon-fixed-width"></i></a></li>`;
  return new Spacebars.SafeString(ret);
});*!/

/!**
 * today
 * @summary returns today's date
 * @return {Date} today's date
 *!/
Template.registerHelper("today", function () {
  return new Date; //moment().format('DD/MM/YYYY');
});

/!**
 * registerHelper formatTime
 *!/
Template.registerHelper('formatTime', function(datetime, options) {
  if (options === 'fromNow') return moment(datetime).fromNow();
  if (options === 'pretty' && datetime) return moment(datetime).format('MMMM DD, YYYY');
  if (options === 'withTime' && datetime) return moment(datetime).format('MMM Do YYYY, h:mm a');
  if(datetime) return moment(datetime).format('DD/MM/YYYY');
});

/!**
 * registerHelper formatMoney
 *!/
Template.registerHelper('formatMoney', function(amount, currency) {
  if(amount || amount === 0) {
    let formattedAmount = Core.numberWithCommas(amount); 
    if (_.isString(currency)) {
      return currency + " " + formattedAmount;
    }
    
    if (currency && currency.iso) {
      let currSymbol = currency.symbol ? currency.symbol : currency.iso; //default to ISO code if no symbol
      //currSymbol = currSymbol ? currSymbol : '';
      formattedAmount = currSymbol + " " + formattedAmount;
    }
    return formattedAmount;
  }
});

Template.registerHelper('formatMoneyD', function(amount, currency) {
  if(amount || amount === 0) {
    let formattedAmount = Core.numberWithDecimals(amount);
    if (_.isString(currency)) {
      return currency + " " + formattedAmount;
    }

    if (currency && currency.iso) {
      let currSymbol = currency.symbol ? currency.symbol : currency.iso; //default to ISO code if no symbol
      //currSymbol = currSymbol ? currSymbol : '';
      formattedAmount = currSymbol + " " + formattedAmount;
    }
    return formattedAmount;
  }
});

/!**
 * registerHelper formatMoneyClean - return nothing if 0
 *!/
Template.registerHelper('formatMoneyClean', function(amount, currency) {
  if(amount) {
    let formattedAmount = Core.numberWithCommas(amount); 
    if (_.isString(currency)) {
      return currency + " " + formattedAmount;
    }
    
    if (currency && currency.iso) {
      let currSymbol = currency.symbol ? currency.symbol : currency.iso; //default to ISO code if no symbol
      //currSymbol = currSymbol ? currSymbol : '';
      formattedAmount = currSymbol + " " + formattedAmount;
    }
    return formattedAmount;
  }
});

/!**
 * registerHelper formatNumber
 *!/
Template.registerHelper('formatNumber', function(amount, decimals) {
    decimals = decimals || 0;
    return amount === 0 ? '' : accounting.formatNumber(amount, decimals);
});

/!**
 * registerHelper formatNumberZ -> return 0 if 0
 *!/
Template.registerHelper('formatNumberZ', function(amount, decimals) {
    decimals = decimals || 0;
    return accounting.formatNumber(amount, decimals);
});


/!**
 * registerHelper postingKeyClass
 *!/
Template.registerHelper('postingKeyClass', function(amount) {
    if (amount < 0) return 'text-danger';
});



/!**
 * thisYear
 * @summary returns currentYear
 * @return {String} current year
 *!/
Template.registerHelper("thisYear", function () {
  return new Date().getFullYear();
});

/!**
 * isSame
 * @summary compare values
 * @param {String} v1 - variable one
 * @param {String} v2 - variable two
 * @return {String} returns v1 === v2
 *!/
Template.registerHelper("isSame", function (v1, v2) {
  return v1 === v2;
});

/!**
 * yesno
 * @summary convert true/false to yes/no
 * @param {Boolean} bool
 * @return {String} returns 'YES' or 'NO'
 *!/
Template.registerHelper("yesno", function (bool) {
  if (bool) return 'YES';
  return 'NO';
});

/!**
 * isDifferent
 * @summary compare values
 * @param {String} v1 - variable one
 * @param {String} v2 - variable two
 * @return {String} returns v1 !== v2
 *!/
Template.registerHelper("isDifferent", function (v1, v2) {
  return v1 !== v2;
});


/!**
 * lowerCase
 * @summary convert string to lowercase
 * @param {String} str - string to convert
 * @return {String} returns str.toLowerCase
 *!/
Template.registerHelper('lowerCase', function(str){
  let string = str.replace(/[_-]/g, " ");
  return string.toLowerCase();
});

/!**
 * prune
 * @summary return a substring of the provided string of the indicated length
 * @param {String} str - string to shorten
 * @param {Number} length - length to shorten to
 * @return {String} returns the shortened string 
 *!/
Template.registerHelper("prune", function (str, length) {
  return s.prune(str, length);
});
*/
