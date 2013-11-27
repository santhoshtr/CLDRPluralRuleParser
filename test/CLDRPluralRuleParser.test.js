/* global pluralRuleParser, QUnit, jQuery */
QUnit.module('pluralRuleParser');

jQuery.each({
	'n is 0 @integer 0 @decimal 0.0, 0.00, 0.000, 0.0000': {
		pass: [0, 0.0, 0.00, 0.000, 0.0000],
		fail: [1, 19]
	},
	'n is 1 @integer 1 @decimal 1.0, 1.00, 1.000, 1.0000': {
		pass: [1, 1.0, 1.00, 1.000, 1.0000],
		fail: 10
	},
	'n = 2 @integer 2 @decimal 2.0, 2.00, 2.000, 2.0000': {
		pass: [2, 2.0, 2.00, 2.000, 2.0000]
	},
	'n % 100 = 3..10 @integer 3~10, 103~110, 1003, … @decimal 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 103.0, 1003.0, …': {
		pass: [3, 10, 103, 104, 110, 206, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 103.0, 1003.0],
		fail: 11
	},
	'n % 100 = 11..99 @integer 11~26, 111, 1011, … @decimal 11.0, 12.0, 13.0, 14.0, 15.0, 16.0, 17.0, 18.0, 111.0, 1011.0, …': {
		pass: [11, 111, 1011, 11.0, 12.0, 13.0, 14.0, 15.0, 16.0, 17.0, 18.0, 111.0, 1011.0],
	},
	'n != 2 @integer 1 @decimal 2.0, 2.00, 2.000, 2.0000': {
		pass: [1, 3]
	},
	'n % 10 = 1 and n % 100 != 11 @integer 1, 21, 31, 41, 51, 61, 71, 81, 101, 1001, … @decimal 1.0, 21.0, 31.0, 41.0, 51.0, 61.0, 71.0, 81.0, 101.0, 1001.0, …': {
		pass: [1, 21, 31, 41, 51, 61, 71, 81, 101, 1001],
		fail: [2, 11, 12]
	},
	'n % 10 = 1 and n % 100 != 11..19 @integer 1, 21, 31, 41, 51, 61, 71, 81, 101, 1001, … @decimal 1.0, 21.0, 31.0, 41.0, 51.0, 61.0, 71.0, 81.0, 101.0, 1001.0, …': {
		pass: [1, 21, 31, 41, 51, 61, 71, 81, 101, 1001],
		fail: [2, 11, 12]
	},
	' @integer 100~102, 200~202, 300~302, 400~402, 500~502, 600, 1000, 10000, 100000, 1000000, … @decimal 0.1~0.9, 1.1~1.7, 10.1, 100.0, 1000.0, 10000.0, 100000.0, 1000000.0, …': {
		pass: [10, 11, 20, 21, 30, 110, 111, 120]
	},
	'i = 1 and v = 0 @integer 1': {
		fail: [0, 2, 3],
		pass: [1]
	},
	'v = 0 and n != 0..10 and n % 10 = 0 @integer 20, 30, 40, 50, 60, 70, 80, 90, 100, 1000, 10000, 100000, 1000000, …': {
		pass: [20, 30, 40, 50, 60, 70, 80, 90, 100],
		fail: [9, 4, 8, 10],
	},
	'v = 0 and i != 1 and i % 10 = 0..1 or v = 0 and i % 10 = 5..9 or v = 0 and i % 100 = 12..14 @integer 0, 5~19, 100, 1000, 10000, 100000, 1000000, …': {
		pass: [0, 5, 9],
		fail: [3, 4]
	},
	'n % 10 = 1 and n % 100 != 11,71,91 @integer 1, 21, 31, 41, 51, 61, 81, 101, 1001, … @decimal 1.0, 21.0, 31.0, 41.0, 51.0, 61.0, 81.0, 101.0, 1001.0, …': {
		pass: [1, 21, 31, 41, 51, 61, 81, 101, 1001],
		fail: [2, 33, 44, 55]
	},
	'n = 0,1 or i = 0 and f = 1 @integer 0, 1 @decimal 0.0, 0.1, 1.0, 0.00, 0.01, 1.00, 0.000, 0.001, 1.000, 0.0000, 0.0001, 1.0000': {
		pass: [0, 1],
		fail: [2, 33, 44, 55]
	},
	'i = 1 and v = 0 or i = 0 and t = 1 @integer 1 @decimal 0.1, 0.01, 0.10, 0.001, 0.010, 0.100, 0.0001, 0.0010, 0.0100, 0.1000': {
		pass: [1],
		//fail: [2,33,44,55]
	}
}, function(rule, expected) {
	QUnit.test(rule, function(assert) {
		// Turn into arrays
		var pass = expected.pass ?
			jQuery.isArray(expected.pass) ? expected.pass : [expected.pass] :
			[];
		var fail = expected.fail ?
			jQuery.isArray(expected.fail) ? expected.fail : [expected.fail] :
			[];

		jQuery.each(pass, function(i, number) {
			assert.strictEqual(
				pluralRuleParser(rule, number),
				true,
				'n=' + number + ' should pass'
			);
		});
		jQuery.each(fail, function(i, number) {
			assert.strictEqual(
				// pluralRuleParser returns null or false. Cast to boolean with !!.
				!! pluralRuleParser(rule, number),
				false,
				' n=' + number + ' should fail'
			);
		});
	});
});

// Make sure we can parse all plural rules with out errors
$.ajax({
	type: 'GET',
	url: '../plurals.xml',
	dataType: 'xml'
}).done(function(xml) {
	QUnit.test('Parsing test', function(assert) {
		var pluralRules, localeStr, locales, plurals,
			j, rule;
		plurals = xml.getElementsByTagName('pluralRule');
		console.log(plurals.length);
		for (var i = 0; i < plurals.length; i++) {
			rule = plurals[i].textContent;
			assert.notEqual(pluralRuleParser(rule, 1), null, rule);
		}
	});
});