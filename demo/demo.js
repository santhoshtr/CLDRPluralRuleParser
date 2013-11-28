/*globals pluralRuleParser, jQuery, document */
(function($) {
	"use strict";

	// Start AJAX right away
	$.ajax({
		type: 'GET',
		url: '../plurals.xml',
		dataType: 'xml'
	}).done(function(xmldata) {
		// When document is ready as well, do init.
		$(document).ready(function() {
			init(xmldata);
		});
	});

	function init(xmlDoc) {
		$('#button-calc').click(function(e) {
			showCalcuate(xmlDoc, {
				locale: $('#input-language').val(),
				number: $('#input-number').val()
			});

			e.preventDefault();
		});
		$('#button-reset').click(function(e) {
			$('.result').hide().empty();
			// Don't prevent default, type=reset will clear the form :)
		});
	}

	function showCalcuate(xml, options) {
		var pluralRules, i, localeStr, locales, plurals,
			j, rule, result, $resultdiv;

		$('.result').hide().empty();
		pluralRules = xml.getElementsByTagName('pluralRules');
		for (i = 0; i < pluralRules.length; i++) {
			localeStr = pluralRules[i].getAttribute('locales');
			locales = localeStr.split(' ');
			if ($.inArray(options.locale, locales) !== -1) {
				plurals = pluralRules[i].getElementsByTagName('pluralRule');
				for (j = 0; j < plurals.length; j++) {
					rule = plurals[j].textContent;
					$resultdiv = $('<div>')
						.addClass('alert alert-error')
						.html(plurals[j].getAttribute('count') + ' : ' + rule);

					if (!result) {
						result = pluralRuleParser(rule + '', options.number);
						if (result) {
							$resultdiv.removeClass('alert-error').addClass('alert-success');
						}
					}

					$('.result').append($resultdiv);

				}
				$('.result').show();
			}
		}
	}

}(jQuery));
