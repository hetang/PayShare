var paypal = require('paypal-rest-sdk');
var config = {};
 
/*
 * SDK configuration
 */
 
exports.init = function(c){
  config = c;
  paypal.configure(c.api);
}