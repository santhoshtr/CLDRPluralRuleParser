import assert from "node:assert";
import { test } from "node:test";
import pluralsData from "../demo/plurals.json" with { type: "json" };
import pluralRuleParser from "../src/CLDRPluralRuleParser.js";

const tests = {
	"n is 0 @integer 0 @decimal 0.0, 0.00, 0.000, 0.0000": {
		pass: [0, 0.0, 0.0, 0.0, 0.0],
		fail: [1, 19],
	},
	"n is 1 @integer 1 @decimal 1.0, 1.00, 1.000, 1.0000": {
		pass: [1, 1.0, 1.0, 1.0, 1.0],
		fail: 10,
	},
	"n = 2 @integer 2 @decimal 2.0, 2.00, 2.000, 2.0000": {
		pass: [2, 2.0, 2.0, 2.0, 2.0],
		fail: [2.1],
	},
	"n % 100 = 3..10 @integer 3~10, 103~110, 1003, … @decimal 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 103.0, 1003.0, …":
		{
			pass: [
				3, 10, 103, 104, 110, 206, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0,
				103.0, 1003.0,
			],
			fail: 11,
		},
	"n % 100 = 11..99 @integer 11~26, 111, 1011, … @decimal 11.0, 12.0, 13.0, 14.0, 15.0, 16.0, 17.0, 18.0, 111.0, 1011.0, …":
		{
			pass: [
				11, 111, 1011, 11.0, 12.0, 13.0, 14.0, 15.0, 16.0, 17.0, 18.0, 111.0,
				1011.0,
			],
		},
	"n != 2 @integer 1 @decimal 2.0, 2.00, 2.000, 2.0000": {
		pass: [1, 3],
	},
	"n % 10 = 1 and n % 100 != 11 @integer 1, 21, 31, 41, 51, 61, 71, 81, 101, 1001, … @decimal 1.0, 21.0, 31.0, 41.0, 51.0, 61.0, 71.0, 81.0, 101.0, 1001.0, …":
		{
			pass: [
				1, 21, 31, 41, 51, 61, 71, 81, 101, 1001, 1.0, 21.0, 31.0, 41.0, 51.0,
				61.0, 71.0, 81.0, 101.0,
			],
			fail: [2, 11, 12],
		},
	"n % 10 = 1 and n % 100 != 11..19 @integer 1, 21, 31, 41, 51, 61, 71, 81, 101, 1001, … @decimal 1.0, 21.0, 31.0, 41.0, 51.0, 61.0, 71.0, 81.0, 101.0, 1001.0, …":
		{
			pass: [
				1, 21, 31, 41, 51, 61, 71, 81, 101, 1001, 1.0, 21.0, 31.0, 41.0, 51.0,
				61.0, 71.0, 81.0, 101.0, 1001.0,
			],
			fail: [2, 11, 12],
		},
	" @integer 100~102, 200~202, 300~302, 400~402, 500~502, 600, 1000, 10000, 100000, 1000000, … @decimal 0.1~0.9, 1.1~1.7, 10.1, 100.0, 1000.0, 10000.0, 100000.0, 1000000.0, …":
		{
			pass: [
				10, 11, 20, 21, 30, 110, 111, 120, 0.1, 0.9, 1.1, 1.7, 10.1, 100.0,
				1000.0, 10000.0,
			],
		},
	"i = 1 and v = 0 @integer 1": {
		pass: [1],
		fail: [1.3, "1.0"],
	},
	"v = 0 and n != 0..10 and n % 10 = 0 @integer 20, 30, 40, 50, 60, 70, 80, 90, 100, 1000, 10000, 100000, 1000000, …":
		{
			pass: [20, 30, 40, 50, 60, 70, 80, 90, 100],
			fail: [9, 4, 8, 10],
		},
	"v = 0 and i != 1 and i % 10 = 0..1 or v = 0 and i % 10 = 5..9 or v = 0 and i % 100 = 12..14 @integer 0, 5~19, 100, 1000, 10000, 100000, 1000000, …":
		{
			pass: [0, 5, 9, 19, 10, 1000, 10000, 100000, 1000000],
			fail: [3, 4],
		},
	"n % 10 = 1 and n % 100 != 11,71,91 @integer 1, 21, 31, 41, 51, 61, 81, 101, 1001, … @decimal 1.0, 21.0, 31.0, 41.0, 51.0, 61.0, 81.0, 101.0, 1001.0, …":
		{
			pass: [
				1, 21, 31, 41, 51, 61, 81, 101, 1001, 1.0, 21.0, 31.0, 41.0, 51.0, 61.0,
				81.0, 101.0, 1001.0,
			],
			fail: [2, 33, 44, 55],
		},
	"n = 0,1 or i = 0 and f = 1 @integer 0, 1 @decimal 0.0, 0.1, 1.0, 0.00, 0.01, 1.00, 0.000, 0.001, 1.000, 0.0000, 0.0001, 1.0000":
		{
			pass: [
				0, 1, 0.0, 0.1, 1.0, 0.0, 0.01, 1.0, 0.0, 0.001, 1.0, 0.0, 0.0001, 1.0,
			],
			fail: [2, 33, 44, 55],
		},
	"i = 1 and v = 0 or i = 0 and t = 1 @integer 1 @decimal 0.1, 0.01, 0.10, 0.001, 0.010, 0.100, 0.0001, 0.0010, 0.0100, 0.1000":
		{
			pass: [1, 0.1, 0.01, 0.1, 0.001, 0.01, 0.1, 0.0001, 0.001, 0.01],
			fail: [2, 33, 44, 55],
		},
	"t = 0 and i % 10 = 1 and i % 100 != 11 or t != 0 @integer 1, 21, 31, 41, 51, 61, 71, 81, 101, 1001, … @decimal 0.1~1.6, 10.1, 100.1, 1000.1, …":
		{
			pass: [1, 0.1, 1.6, 10.1, 100.1, 1000.1],
		},
	"v = 0 and i % 10 = 2..4 and i % 100 != 12..14 or f % 10 = 2..4 and f % 100 != 12..14 @integer 2~4, 22~24, 32~34, 42~44, 52~54, 62, 102, 1002, … @decimal 0.2~0.4, 1.2~1.4, 2.2~2.4, 3.2~3.4, 4.2~4.4, 5.2, 10.2, 100.2, 1000.2, …":
		{
			pass: [
				0.2, 0.4, 1.2, 1.4, 2.2, 2.4, 3.2, 3.4, 4.2, 4.4, 5.2, 10.2, 100.2,
				1000.2,
			],
			fail: [0.1, 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 10.1, 100.1, 1000.1],
		},
	"n % 10 = 0 or n % 100 = 11..19 or v = 2 and f % 100 = 11..19 @integer 0, 10~20, 30, 40, 50, 60, 100, 1000, 10000, 100000, 1000000, … @decimal 0.0, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0, 16.0, 100.0, 1000.0, 10000.0, 100000.0, 1000000.0, …":
		{
			pass: [
				0.0, 10.0, 11.0, 12.0, 13.0, 14.0, 15.0, 16.0, 100.0, 1000.0, 10000.0,
				100000.0, 1000000.0,
			],
			fail: [0.1, 0.2, 1.0, 1.1, 1.2, 1.9, 10.2, 100.2, 1000.2],
		},
	// lag locale: 'one' rule - n != 0 fails for decimal string input (known bug)
	"i = 0,1 and n != 0 @integer 1 @decimal 0.1~1.6": {
		pass: [1, "0.1", "0.5", "1.0", "1.6"],
	},
};

test("CLDRPluralRuleParser", async () => {
	await test("should parse and validate the numbers", () => {
		for (const rule in tests) {
			const expected = tests[rule];
			const pass = expected.pass
				? Array.isArray(expected.pass)
					? expected.pass
					: [expected.pass]
				: [];
			const fail = expected.fail
				? Array.isArray(expected.fail)
					? expected.fail
					: [expected.fail]
				: [];

			pass.forEach((number) => {
				assert.strictEqual(
					pluralRuleParser(rule, number),
					true,
					`n=${number} should pass`,
				);
			});
			fail.forEach((number) => {
				assert.strictEqual(
					!!pluralRuleParser(rule, number),
					false,
					` n=${number} should fail`,
				);
			});
		}
	});

	await test("compact notation (c/e operands) - shiftDecimal and operand values", () => {
		// c/e returns exponent; n/i/f/t/v/w operate on the expanded number
		// "1c6" => exponent=6, expanded=1000000; i=1000000, v=0, f=0
		assert.strictEqual(pluralRuleParser("c = 6", "1c6"), true, "1c6: c=6");
		assert.strictEqual(pluralRuleParser("e = 6", "1c6"), true, "1c6: e=6");
		assert.strictEqual(
			pluralRuleParser("c = 0", "1000000"),
			true,
			"1000000: c=0",
		);
		assert.strictEqual(
			pluralRuleParser("e = 0", "1000000"),
			true,
			"1000000: e=0",
		);
		assert.strictEqual(pluralRuleParser("c = 3", "1c3"), true, "1c3: c=3");

		// Expansion: 1.2005c3 => i=1200, f=5 (per spec)
		assert.strictEqual(
			pluralRuleParser("i = 1200", "1.2005c3"),
			true,
			"1.2005c3: i=1200",
		);
		assert.strictEqual(
			pluralRuleParser("v = 1", "1.2005c3"),
			true,
			"1.2005c3: v=1",
		);

		// 1c6 => i=1000000, v=0
		assert.strictEqual(
			pluralRuleParser("i = 1000000", "1c6"),
			true,
			"1c6: i=1000000",
		);
		assert.strictEqual(pluralRuleParser("v = 0", "1c6"), true, "1c6: v=0");

		// 1.0000001c6 => expanded=1000000.1 => i=1000000, f=1, v=1
		assert.strictEqual(
			pluralRuleParser("i = 1000000", "1.0000001c6"),
			true,
			"1.0000001c6: i=1000000",
		);
		assert.strictEqual(
			pluralRuleParser("v = 1", "1.0000001c6"),
			true,
			"1.0000001c6: v=1",
		);
		assert.strictEqual(
			pluralRuleParser("f = 5", "1.2005c3"),
			true,
			"1.2005c3: f=5",
		);
		assert.strictEqual(
			pluralRuleParser("t = 5", "1.2005c3"),
			true,
			"1.2005c3: t=5",
		);
		assert.strictEqual(
			pluralRuleParser("n = 1200000", "1.2c6"),
			true,
			"1.2c6: n=1200000",
		);
	});

	await test("compact notation (c/e operands) - French plural rules", () => {
		const frRules = pluralsData.supplemental["plurals-type-cardinal"].fr;
		const one = frRules["pluralRule-count-one"];
		const many = frRules["pluralRule-count-many"];

		// one: i = 0,1
		assert.strictEqual(pluralRuleParser(one, "0"), true, "fr one: 0");
		assert.strictEqual(pluralRuleParser(one, "1"), true, "fr one: 1");
		assert.strictEqual(
			pluralRuleParser(one, "2"),
			false,
			"fr one: 2 should fail",
		);

		// many: e = 0 and i != 0 and i % 1000000 = 0 and v = 0 or e != 0..5
		// Plain 1000000: e=0, i=1000000, i%1000000=0, v=0 => many
		assert.strictEqual(
			pluralRuleParser(many, "1000000"),
			true,
			"fr many: 1000000",
		);
		// 1c6: e=6, e != 0..5 => many
		assert.strictEqual(pluralRuleParser(many, "1c6"), true, "fr many: 1c6");
		assert.strictEqual(pluralRuleParser(many, "2c6"), true, "fr many: 2c6");
		assert.strictEqual(pluralRuleParser(many, "6c6"), true, "fr many: 6c6");
		// 1.1c6: e=6, e != 0..5 => many
		assert.strictEqual(pluralRuleParser(many, "1.1c6"), true, "fr many: 1.1c6");
		// 1c3: e=3, e != 0..5 is false (3 is in 0..5) => not many
		assert.strictEqual(
			pluralRuleParser(many, "1c3"),
			false,
			"fr many: 1c3 should fail",
		);
		// plain 2: e=0, i=2, i%1000000!=0 => not many
		assert.strictEqual(
			pluralRuleParser(many, "2"),
			false,
			"fr many: 2 should fail",
		);
	});

	await test("should parse all plural rules in plurals.json in cldr", () => {
		const plurals = pluralsData.supplemental["plurals-type-cardinal"];
		for (const locale in plurals) {
			const rules = plurals[locale];
			for (const count in rules) {
				const rule = rules[count];
				let integerSamples = [];
				let decimalSamples = [];
				assert.notStrictEqual(pluralRuleParser(rule, 1), null, rule);
				const parts = rule.split("@");
				for (let p = 1; p < parts.length; p++) {
					const part = parts[p];
					if (part.indexOf("integer") === 0) {
						integerSamples = part.replace("integer", "").split(",");
					} else if (part.indexOf("decimal") === 0) {
						decimalSamples = part.replace("decimal", "").split(",");
					}
				}
				let tested = 0;
				for (let j = 0; j < integerSamples.length; j++) {
					let number = integerSamples[j].trim();
					if (!number) {
						continue;
					}
					// For compact notation samples (e.g. 1c6), pass as-is (string).
					// For range samples (e.g. 3~10), take the first value.
					if (!/[ce]\d/.test(number)) {
						number = parseInt(number.split("~")[0], 10);
						if (Number.isNaN(number)) {
							continue;
						}
					}
					assert.strictEqual(
						pluralRuleParser(rule, number),
						true,
						`[${number}] ${rule}`,
					);
					tested++;
				}
				for (let j = 0; j < decimalSamples.length; j++) {
					let number = decimalSamples[j].trim();
					if (!number) {
						continue;
					}
					// For compact notation samples (e.g. 1.1c6), pass as-is (string).
					// For range samples (e.g. 0.1~1.6), take the first value.
					if (!/[ce]\d/.test(number)) {
						number = number.split("~")[0];
						if (!number || Number.isNaN(parseFloat(number))) {
							continue;
						}
					}
					assert.strictEqual(
						pluralRuleParser(rule, number),
						true,
						`[${number}] ${rule} in locale ${locale}`,
					);
					tested++;
				}
				assert.ok(
					tested > 0,
					`No samples were tested for rule "${count}" in locale "${locale}": ${rule}`,
				);
			}
		}
	});
});
