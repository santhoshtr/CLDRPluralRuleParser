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

/*
console.log(pluralRuleParser("n mod 4 is 3", 7));
console.log(pluralRuleParser("n mod 4 is not 3", 7));
console.log(pluralRuleParser("n mod 4 in 0..5", 7));
console.log(pluralRuleParser("n mod 4 not in 0..5", 7));
console.log(pluralRuleParser("n is 1 and n mod 1 is 0", "1"));
console.log(pluralRuleParser("n is 3 or n mod 1 is 0", "1"));
console.log(pluralRuleParser("n is 1 and n is 1 and n is not 1", "1"));
console.log(pluralRuleParser("n is not 1 and n mod 10 in 0..1 or 1 mod n in 5..9 or n mod 100 in 12..14", 21));

console.log(pluralRuleParser("n mod 100 not in 12..14", 4));
console.log(pluralRuleParser("n mod 10 in 2..4 and n mod 100 not in 12..14", 4));
*/