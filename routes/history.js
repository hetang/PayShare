var paypal = require('paypal-rest-sdk');
var currency_symbols = {
    'USD': '$', // US Dollar
    'EUR': '€', // Euro
    'CRC': '₡', // Costa Rican Colón
    'GBP': '£', // British Pound Sterling
    'ILS': '₪', // Israeli New Sheqel
    'INR': '₹', // Indian Rupee
    'JPY': '¥', // Japanese Yen
    'KRW': '₩', // South Korean Won
    'NGN': '₦', // Nigerian Naira
    'PHP': '₱', // Philippine Peso
    'PLN': 'zł', // Polish Zloty
    'PYG': '₲', // Paraguayan Guarani
    'THB': '฿', // Thai Baht
    'UAH': '₴', // Ukrainian Hryvnia
    'VND': '₫', // Vietnamese Dong
};

function formatDateTime(datetime) {
	var updateDate = new Date(datetime);
	var dd = updateDate.getDate();
	var mm = updateDate.getMonth()+1;
	var yyyy = updateDate.getFullYear();

	return mm + '/' + dd + '/' + yyyy;
}

exports.init = function(c){
  paypal.configure(c.api);
};

exports.history = function(req, res){
	var startIndex = req.query.sindex || 1;
	var count = req.query.ipg || 20;
	paypal.payment.list({ "count" : count, "start_index" : startIndex, "sort_by" : "update_time", "sort_order" : "desc"}, 
		function(error, payment_history){
			if(error){
				res.send(error);
			} else {
				var transaction = [];
				if(typeof payment_history !== 'undefined'){
					var list = payment_history['payments'];
					for (var i in list) {
						var eachTrxn = {};
						var time = undefined;
						var amount = undefined;
						var desc = undefined;
						var obj = list[i];
						if(obj.hasOwnProperty('update_time')){
							var time = obj.update_time;
							time = formatDateTime(time);
						}
						if(obj.hasOwnProperty('transactions')){
							var trxns = obj.transactions;
							for (var index in trxns) {
								var trx = trxns[index];
								eachTrxn['date'] = time;
								if(trx.hasOwnProperty('amount')) {
									var amount = trx.amount;
									var symbol = currency_symbols[amount.currency];
									eachTrxn['amount'] = (typeof symbol !== 'undefined'?symbol: amount.currency) + amount.total;
								}

								if(trx.hasOwnProperty('description')) {
									eachTrxn['name'] = trx.description;
								} else {
									eachTrxn['name'] = 'Not Available';
								}
							};
						}
						transaction.push(eachTrxn);
					};
				}
				res.send({data : transaction});
			}
	});
};

exports.pay = function(req, res) {
	var receiver = req.body.sndrMail;
	var amount = Number(req.body.amount);
	if(typeof receiver !== 'undefined' && typeof amount !== 'undefined' && typeof amount === "number") {
		var currency = req.body.currency || 'USD';
		var desc = req.body.msg || 'Trasfering to ' + receiver;
		var srvTyp = req.body.srvTyp || 0;
		var feesPayer = 'EACHRECEIVER';
		switch(srvTyp) {
			case 1: feesPayer = 'SENDER';
					break;
		}
		var paypal_pay = require('paypal-pay')({
		      'userId': 'shah_it2000_api1.yahoo.com',
		      'password': 'MJ3THYBKJBWVH8WL',
		      'signature' : 'AFcWxV21C7fd0v3bYYYRCpSSRl31AAspCnlZSNsgJs52Mdp93l1MEU5N',
		      'senderEmail' : 'shah_it2000@yahoo.com',
		      'sandbox': true,
		      'feesPayer': feesPayer,
		      'currencyCode': currency,
		});

		paypal_pay(receiver, amount, desc, function(err, response){
		    if(err){
		        res.send({success: false});
		    } else {
		    	res.send({success: true});
		    }
		});
	} else {
		res.send({success: false});
	}
}