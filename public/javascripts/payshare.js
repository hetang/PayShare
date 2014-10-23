var payShare = (function ($) {
	var payModule = {},
		elements = {
			mainContainer: $('#mainContainer .body'),
			optionDiv: $('#option'),
			currencyDropDown: $('#currency'),
			symbol: $('#symbol'),
			home: $('#home'),
			sendMoney: $('#sndMnyDiv'),
			trxHstry: $('#trxHstryDiv'),
			sendMoneyBtn: $('#sndMny'),
			sndMnyInlineBtn: $('#sndMnyInline'),
			sndMnyBdy: $('#sndMnyBdy'),
			msgDiv: $('#msgDiv'),
			viewTrxBtn: $('#vwTrx'),
			vwTrxInlineBtn: $('#vwTrxInline'),
			clearBtn: $('#clearForm'),
			nextBtn: $('#nextStep'),
			loadmore: $('#loadmore'),
			maskDiv: $('#maskId'),
			fullPageSpinner: $('#spinnerMsk'),
			transferForm: $('#mnyTrsfr'),
			mark: $('#mark'),
			msgText: $('#msgText'),
			transferBtnsDiv: $('#transferBtns'),
			homeBtns: $('#homeBtns'),
			trxnTable: $('#TrxnTable'),
			form: {
				email: $('#sndrMail'),
				amount: $('#amount'),
				msg: $('#msg'),
				currency: $('#currency')
			}
		},
		trxTemplate = undefined,
		historyItems = 0,
		totalItemPage = 20,
		trxAjxObj = undefined,
		sndMnyAjxObj = undefined,
		isLoadingTrx = false;

	function showMaskWithSpinner() {
		elements.maskDiv.addClass('show').addClass('fadeIn').removeClass('hidden');
		elements.fullPageSpinner.removeClass('hidden');
	}

	function hideMaskSpinner() {
		elements.maskDiv.removeClass('show').removeClass('fadeIn').addClass('hidden');
		elements.fullPageSpinner.addClass('hidden');
	}
	function showSendMoneyPage(isFromHistory) {
		if(!elements.home.hasClass('hidden')) {
			elements.home.addClass('hidden');
			elements.home.addClass('visuallyhidden');
		} else if(!elements.trxHstry.hasClass('hidden')) {
			elements.trxHstry.addClass('hidden');
			elements.trxHstry.addClass('visuallyhidden');
			$(window).off('scroll');
		}

		elements.sendMoney.removeClass('hidden');
		elements.sndMnyBdy.removeClass('hidden');
		elements.transferBtnsDiv.removeClass('hidden');
		elements.homeBtns.addClass('hidden');
		elements.msgDiv.addClass('hidden');
		setTimeout(function () {  
	    	elements.sendMoney.removeClass('visuallyhidden');  
		}, 20);

		if(!isFromHistory) {
			clearSendMoneyForm();
			var data = {
					url: window.location.href,
					userData: {
						type: 'sendMoney'
					}
			};
			historyState(data, false);
		}
	}

	function showHomePage() {
		if(!elements.trxHstry.hasClass('hidden')) {
			elements.trxHstry.addClass('hidden');
			elements.trxHstry.addClass('visuallyhidden');
			$(window).off('scroll');
		} else if(!elements.sendMoney.hasClass('hidden')) {
			elements.sendMoney.addClass('hidden');
			elements.sendMoney.addClass('visuallyhidden');
		}
		elements.sendMoney.addClass('hidden');
		elements.sendMoney.addClass('visuallyhidden');
		elements.home.removeClass('hidden')
		setTimeout(function () {  
	    	elements.home.removeClass('visuallyhidden');  
		}, 20);
	}

	function showTransactionDetails(isFromHistory) {
		if(!elements.home.hasClass('hidden')) {
			elements.home.addClass('hidden');
			elements.home.addClass('visuallyhidden');
		} else if(!elements.sendMoney.hasClass('hidden')) {
			elements.sendMoney.addClass('hidden');
			elements.sendMoney.addClass('visuallyhidden');
		}
		
		elements.trxHstry.removeClass('hidden');
		setTimeout(function () {  
	    	elements.trxHstry.removeClass('visuallyhidden');  
		}, 20);

		if(!isFromHistory) {
			fetchHistoryTrx(false);
			var data = {
					url: window.location.href,
					userData: {
						type: 'transactionHistory'
					}
			};
			historyState(data, false);
		}

		$(window).on('scroll', function(){
		    if( $(window).scrollTop() >= ($(document).height() - $(window).height() - 65) && 
		    	$(window).scrollTop() != 0 && elements.trxnTable.children().length > 0) {
		    	if(!isLoadingTrx) {
		    		isLoadingTrx = true;
		        	fetchHistoryTrx(true);
		        }
		    }
		}).scroll();
	}

	function fetchHistoryTrx(isLoadmore) {
		if(isLoadmore) {
			elements.loadmore.removeClass('hidden');
		} else {
			showMaskWithSpinner();
		}
		if(typeof trxTemplate === 'undefined') {
			var source   = $("#payHistory").html();
			trxTemplate = Handlebars.compile(source);
		}

		if(typeof trxAjxObj !== 'undefined') {
			trxAjxObj.abort();
		}

		trxAjxObj = $.ajax({type: "GET",
  				url: "/hst",
  				data: { sindex: historyItems, ipg: totalItemPage }})
		.done(function(context) {
			//alert('done');
			if(typeof context !== 'undefined') {
				var html    = trxTemplate(context);
				elements.trxnTable.append(html);

				historyItems += totalItemPage + 1;
			}
		})
		.fail(function() {
		    //alert( "error" );
		})
		.always(function() {
		    //alert( "complete" );
		    isLoadingTrx = false;
		    if(isLoadmore) {
		    	elements.loadmore.addClass('hidden');
		    } else {
		    	hideMaskSpinner();
		    }
		});
	}

	function highlightErrorInput(elem) {
		if(typeof elem !== 'undefined') {
			elem.focus();
			elem.addClass('error');
			setTimeout(function() {
				elem.removeClass('error');
			}, 5000);
		}
	}

	function showMsg(msg, className) {
		elements.msgText.html(msg);
		elements.mark.addClass(className);
		elements.sndMnyBdy.addClass('hidden');
		elements.msgDiv.removeClass('hidden');
		elements.transferBtnsDiv.addClass('hidden');
		elements.homeBtns.removeClass('hidden');
	}

	function transferMoney() {
		elements.transferForm.submit(function(e) {
		    var postData = $(this).serializeArray(),
		    	formURL = $(this).attr("action"),
		    	email = elements.form.email.val(),
		    	amount = Number(elements.form.amount.val()),
		    	re_email = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    		if(!re_email.test(email)) {
    			highlightErrorInput(elements.form.email);
    			return false;
    		} else if(!(amount > 0.0)) {
    			highlightErrorInput(elements.form.amount);
    			return false;
    		}

    		showMaskWithSpinner();
    		if(typeof sndMnyAjxObj !== 'undefined') {
    			sndMnyAjxObj.abort();
    		}

		    sndMnyAjxObj = $.ajax({
		    	url : formURL,
		        type: "POST",
		        data : postData})
				.done(function(context) {
					//alert('done');
					if(typeof context !== 'undefined') {
						if(typeof context.success !== 'undefined' && context.success === true) {
							var currency = elements.form.currency.val(),
								currencySymbol = elements.form.currency.find(':selected').data('symbol'),
								msg = 'You have sent ' + currencySymbol + amount + ' ' + currency + ' to ' + email;
							
							showMsg(msg,'sucessMark');
							return true;
						}
					}
					var msg = 'Something went wrong. Please try again.';
					showMsg(msg,'failureMark');
				})
				.fail(function() {
				    //alert( "error" );
				    var msg = 'Looks like network issue. Please check your network.';
				    showMsg(msg,'failureMark');
				})
				.always(function() {
				    //alert( "complete" );
				    hideMaskSpinner();
				    sndMnyAjxObj = undefined;
				});
		    e.preventDefault(); //STOP default action
		});
	}

	function historyState (broswerData, isReplaceState){
		if(!history.pushState) return false;

		var src = null;
		if(typeof broswerData !== 'undefined' && typeof broswerData.url !== 'undefined' && typeof broswerData.url === 'string') {
			src = broswerData.url;
		}

		if(src == null) {
			src = window.location.href;
		}

		if(isReplaceState) {
			history.replaceState(broswerData, "", src);
		} else {
			history.pushState(broswerData, "", src);
		}
	}

	function backhandling(event) {
		var data = event.originalEvent.state;
		if(typeof data !== 'undefined') {
			if(typeof data.userData !== 'undefined') {
				switch(data.userData.type) {
					case 'sendMoney' :
						showSendMoneyPage(true);
						break;
					case 'transactionHistory':
						showTransactionDetails(true);
						break;
					default:
						showHomePage(true);
						break;
				}
			}
		}
	}

	function clearSendMoneyForm() {
		elements.form.email.val('');
		elements.form.amount.val('');
		elements.form.msg.val('');
		elements.form.currency.find('option[value="USD"]').prop('selected', true);
		elements.symbol.html(elements.currencyDropDown.find(":selected").data('symbol'));
		var srvType = $('.check');
		if(srvType.length > 0) {
			$.each(srvType, function (index, value) {
				if(index == 0) {
					$(value).addClass('selected');
				} else {
					$(value).removeClass('selected');
				}
			});
		}
	}

	function attachEvents() {
		$(window).resize(function (){
			elements.mainContainer.css({'height': (($(window).height())-124)+'px'});
		});

		elements.optionDiv.on('click','.check', function() {
			elements.optionDiv.find('.selected').removeClass('selected');
			$(this).addClass('selected');
			$('#srvTyp').val($(this).data('value'));
		});

		elements.currencyDropDown.change(function () {
			elements.symbol.html($(this).find(":selected").data('symbol'));
		});

		elements.sendMoneyBtn.bind('click', function () {
			showSendMoneyPage(false);
		});

		elements.sndMnyInlineBtn.bind('click', function () {
			clearSendMoneyForm();
			showSendMoneyPage(true);
		});

		elements.clearBtn.bind('click', function(event) {
			clearSendMoneyForm();
		});

		elements.viewTrxBtn.bind('click', function () {
			showTransactionDetails(false);
		});

		elements.vwTrxInlineBtn.bind('click', function () {
			showTransactionDetails(false);
		});

		elements.nextBtn.bind('click', function () {
			elements.transferForm.submit();
		});
		$(window).bind("popstate", $.proxy(backhandling, this));
	}

	payModule.init = function() {
		elements.mainContainer.css({'height': (($(window).height())-124)+'px'});
		elements.symbol.html(elements.currencyDropDown.find(":selected").data('symbol'));
		attachEvents();
		transferMoney();
		var data = {
				url: window.location.href,
				userData: {
					type: 'home'
				}
		};
		historyState(data, true);

	}
	return payModule;
}(jQuery));

$(document).ready(function () {
	payShare.init();
});