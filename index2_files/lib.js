var SimlictJs = (function(jsLib) {
	jsLib.Utils = (function () {
		var getRandomDigit = function (min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		};
		
		var isNumber = function (n) {
			return !isNaN(parseFloat(n)) && isFinite(n)
		};
		
		var scrollTop = function () {
			$(window).scroll(function () {
				if ($(this).scrollTop() > 50) {
					$('#back-to-top').fadeIn();
				} else {
					$('#back-to-top').fadeOut();
				}
			});
			// scroll body to 0px on click
			$('#back-to-top').click(function () {
				$('#back-to-top').tooltip('hide');
				$('body,html').animate({
					scrollTop: 0
				}, 500);
				return false;
			});
		};
		
		var createClipboard = function () {
			var clipboard = new Clipboard('.btn');
			clipboard.on('success', function(e) {
				copyText= e.text;
				e.clearSelection();
			});
			return clipboard;
		};
		
		var eventSupported = function( eventName ) { 
			var el = document.createElement("div"); 
			eventName = "on" + eventName; 

			var isSupported = (eventName in el); 
			if ( !isSupported ) { 
				el.setAttribute(eventName, "return;"); 
				isSupported = typeof el[eventName] === "function"; 
			} 
			el = null; 

			return isSupported; 
		};
		
		var searchHtml = function(container, filterElement, searchText) {
			var $doms = $('#' + container + ' ' + filterElement);
			searchText = SimlictJs.Utils.turkishToLower(searchText);
			
			var val = '^(?=.*' + $.trim(searchText).split(/\s+/).join(')(?=.*\\b') + ').*$';
			var reg = RegExp(val, 'i');
			var text;
			var headerRow = 0;
			
			$doms.show().filter(function() {
				text = $(this).text().replace(/\s+/g, ' ');
				if (headerRow == 0) {
					headerRow = 1;
					return false;
				}					
				return !reg.test(SimlictJs.Utils.turkishToLower(text));
			}).hide();
		};
		
		var displayAll = function(elements, cleanDom) {
			var $doms= $('#' + elements);
			
			$doms.filter(function() {
				$(this).show();
			});
			if ($('#'+cleanDom).length > 0) {
				$('#'+cleanDom).val("");
			}
		};
		
		var turkishToLower = function(str){
			var letters = { "İ": "i", "I": "i", "Ş": "ş", "Ğ": "ğ", "Ü": "ü", "Ö": "ö", "Ç": "ç", "ı": "i" };
			str = str.replace(/(([İIŞĞÜÇÖı]))/g, function(letter){ return letters[letter]; })
			return str.toLowerCase();
		}	
		
		return {
			randomDigit : getRandomDigit,
			isNumber : isNumber,
			scrollTop : scrollTop,
			clipboard : createClipboard,
			isEventSupported : eventSupported,
			searchHtml : searchHtml,
			displayAll : displayAll,
			turkishToLower : turkishToLower
		}
	})();
	
	jsLib.Validator = (function () {
		var validateTcNo = function () {
			var tcNo = $("#tcNoValidationInput").val();
			tcNo = tcNo.trim();
			var digits = ("" + tcNo).split("").map(Number);
			if (digits.length != 11)
				return false;
			for(i = 0; i < digits.length - 1; i++) {
				if(!SimlictJs.Utils.isNumber(digits[i]))
					return false;
			}
			var digit10 = ((digits[0] + digits[2] + digits[4] + digits[6] + digits[8]) * 7 - (digits[1] + digits[3] + digits[5] + digits[7])) % 10;
			var digit11 = (digits[0] + digits[1] + digits[2] + digits[3] + digits[4] + digits[5] + digits[6] + digits[7] + digits[8] + digit10) % 10
			
			if(digits[9] == digit10 && digits[10] == digit11)
				return true;
			
			return false;
		};
		
		var validateVergiNo = function () {
			var vergiNo = $("#vergiNoValidationInput").val();
			vergiNo = vergiNo.trim();
			var digits = ("" + vergiNo).split("").map(Number);
			var sum = 0;
			var tmp = 0;
			if (digits.length != 10)
				return false;
			for(i = 0; i < digits.length - 1; i++) {
				if(!SimlictJs.Utils.isNumber(digits[i]))
					return false;
				
				tmp = (digits[i] + 10 - ( i + 1 ) ) % 10;
				sum = (tmp == 9 ? sum + tmp : sum + ((tmp * (Math.pow(2, 10 - ( i + 1 ))) ) % 9));	
			}
			if (digits[digits.length -1] == (10 - (sum % 10)) % 10)
				return true;
				
			return false;
		};
		
		return {
			validateTcNo : validateTcNo,
			validateVergiNo : validateVergiNo
		}
	})();
	 
	jsLib.Generator = (function () {
		var processValidation = function (validateFunction) {
			if(validateFunction() == true) {
				$("#successGif").removeClass('displayDisable');
				$("#failGif").addClass('displayDisable');
			} else {
				$("#successGif").addClass('displayDisable');
				$("#failGif").removeClass('displayDisable');
			}
		};
		
		var generateTcNo = function (targetDiv) {
			var digits = [];
			var tcNo = "";
			digits[0] = SimlictJs.Utils.randomDigit(1,9);
			for(i = 1; i < 9; i++) {
				digits[i] = SimlictJs.Utils.randomDigit(0,9);
			}
			digits[9] = ((digits[0] + digits[2] + digits[4] + digits[6] + digits[8]) * 7 - 
							(digits[1] + digits[3] + digits[5] + digits[7])) % 10;
			digits[10] = (digits[0] + digits[1] + digits[2] + digits[3] + digits[4] + digits[5] + 
						digits[6] + digits[7] + digits[8] + digits[9]) % 10;
						
			tcNo = digits[0].toString() + digits[1].toString() + digits[2].toString() + digits[3].toString() + 
					digits[4].toString() + digits[5].toString() + digits[6].toString() + digits[7].toString() + 
					digits[8].toString() + digits[9].toString() + digits[10].toString();
					
			$("#" + targetDiv).html(tcNo);
		};
		
		var generateVergiNo = function (targetDiv) {
			var digits = [];
			var vergiNo = "";
			var sum = 0;
			
			for(i =0; i < 9; i++) {
				digits[i] = SimlictJs.Utils.randomDigit(0,9);
			}
			
			for(i = 0; i < 9; i++) {
				var tmp = (digits[i] + 10 - ( i + 1 ) ) % 10;
				sum = (tmp == 9 ? sum + tmp : sum + ((tmp * (Math.pow(2, 10 - ( i + 1 ))) ) % 9));	
			}
			digits[9] = (10 - (sum % 10)) % 10
						
			vergiNo = digits[0].toString() + digits[1].toString() + digits[2].toString() + digits[3].toString() + 
					digits[4].toString() + digits[5].toString() + digits[6].toString() + digits[7].toString() + 
					digits[8].toString() + digits[9].toString();
					
			$("#" + targetDiv).html(vergiNo);
		};
		
		return {
			processValidation : processValidation,
			generateTcNo : generateTcNo,
			generateVergiNo : generateVergiNo
		}
	})();

	return jsLib;
}(SimlictJs || {}));
