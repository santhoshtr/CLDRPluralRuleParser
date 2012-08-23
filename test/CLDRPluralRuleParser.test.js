/* global pluralRuleParser, QUnit, jQuery */
QUnit.module('pluralRuleParser');

jQuery.each({
	'n is 0': {
		pass: 0,
		fail: [1, 19]
	},
	'n is 1': {
		pass: 1,
		fail: 10
	},
	'n is 1': {
		pass: 1.0,
		fail: [1.2, 1.9]
	},
	'n is 2': {
		pass: 2
	},
	'n mod 100 is 1': {
		pass: [1, 201],
		fail: 11
	},
	'n mod 100 is 2': {
		pass: [2, 202],
		fail: 42
	},
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
	}
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