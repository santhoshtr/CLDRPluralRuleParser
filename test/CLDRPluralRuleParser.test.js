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
	}/*
	'n mod 100 in 3..4': {
		pass: [3, 4],
		fail: [2, 5]
	},
	'n in 3..10 or n in 13..19': {
		pass: [3, 4, 9, 10, 13, 18, 19, 14],
		fail: [2, 11, 12, 20]
	},
	'n mod 10 in 2..9 and n mod 100 not in 11..19': {
		fail: [10, 11, 20, 21, 30, 110, 111, 120]
	},
	'n in 1,2': {
		fail: [0, 3],
		pass: [1, 2]
	},
	'n in 2,5..7': {
		fail: [1, 4, 8],
		pass: [2, 5, 6, 7]
	},
	'n mod 10 in 3..4,9 and n mod 100 not in 10..19,70..79,90..99': {
		fail: [2, 5, 10, 11, 18, 19, 20, 70, 71, 78, 79, 80, 90, 98, 99, 100],
		pass: [3, 4]
	},
	'n within 0..2 and n is not 2': {
		fail: [2, 5, 100],
		pass: [0, 0.5, 1, 1.2, 1.9]
	}*/
}, function (rule, expected) {
	QUnit.test(rule, function (assert) {
		// Turn into arrays
		var pass = expected.pass ?
			jQuery.isArray(expected.pass) ? expected.pass : [expected.pass] :
			[];
		var fail = expected.fail ?
			jQuery.isArray(expected.fail) ? expected.fail : [expected.fail] :
			[];

		jQuery.each(pass, function (i, number) {
			assert.strictEqual(
				pluralRuleParser(rule, number),
				true,
				'n=' + number + ' should pass'
			);
		});
		jQuery.each(fail, function (i, number) {
			assert.strictEqual(
				// pluralRuleParser returns null or false. Cast to boolean with !!.
				!!pluralRuleParser(rule, number),
				false,
				' n=' + number + ' should fail'
			);
		});
	});
});