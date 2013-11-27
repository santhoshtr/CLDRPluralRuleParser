/**
 * cldrpluralparser.js
 * A parser engine for CLDR plural rules.
 *
 * Copyright 2012 GPLV3+, Santhosh Thottingal
 *
 * @version 0.1.0-alpha
 * @source https://github.com/santhoshtr/CLDRPluralRuleParser
 * @author Santhosh Thottingal <santhosh.thottingal@gmail.com>
 * @author Timo Tijhof
 * @author Amir Aharoni
 */

/**
 * Evaluates a plural rule in CLDR syntax for a number
 * @param rule
 * @param number
 * @return true|false|null
 */
function pluralRuleParser(rule, number) {
	/*
	Syntax: see http://unicode.org/reports/tr35/#Language_Plural_Rules
	-----------------------------------------------------------------
	condition     = and_condition ('or' and_condition)*
                ('@integer' samples)?
                ('@decimal' samples)?
	and_condition = relation ('and' relation)*
	relation      = is_relation | in_relation | within_relation
	is_relation   = expr 'is' ('not')? value
	in_relation   = expr (('not')? 'in' | '=' | '!=') range_list
	within_relation = expr ('not')? 'within' range_list
	expr          = operand (('mod' | '%') value)?
	operand       = 'n' | 'i' | 'f' | 't' | 'v' | 'w'
	range_list    = (range | value) (',' range_list)*
	value         = digit+
	digit         = 0|1|2|3|4|5|6|7|8|9
	range         = value'..'value
	samples       = sampleRange (',' sampleRange)* (',' ('…'|'...'))?
	sampleRange   = decimalValue '~' decimalValue
	decimalValue  = value ('.' value)?
	*/
	// Indicates current position in the rule as we parse through it.
	// Shared among all parsing functions below.
	var pos = 0;
	rule =  rule.substr(0, rule.indexOf("@")).trim();
	var whitespace = makeRegexParser(/^\s+/);
	var digits = makeRegexParser(/^\d+/);
	var decimal = makeRegexParser(/^\d+\.?\d*/);
	var _n_ = makeStringParser('n');
	var _is_ = makeStringParser('is');
	var _isnot_ = makeStringParser('is not');
	var _isnot_sign_ = makeStringParser('!=');
	var _equal_ = makeStringParser('=');
	var _mod_ = makeStringParser('mod');
	var _percent_ = makeStringParser('%');
	var _not_ = makeStringParser('not');
	var _in_ = makeStringParser('in');
	var _within_ = makeStringParser('within');
	var _range_ = makeStringParser('..');
	var _comma_ = makeStringParser(',');
	var _or_ = makeStringParser('or');
	var _and_ = makeStringParser('and');

	function debug() {
		console.log.apply(console, arguments);
	}

	debug('pluralRuleParser', rule, number);

	// Try parsers until one works, if none work return null
	function choice(parserSyntax) {
		return function () {
			for (var i = 0; i < parserSyntax.length; i++) {
				var result = parserSyntax[i]();
				if (result !== null) {
					return result;
				}
			}
			return null;
		};
	}

	// Try several parserSyntax-es in a row.
	// All must succeed; otherwise, return null.
	// This is the only eager one.
	function sequence(parserSyntax) {
		var originalPos = pos;
		var result = [];
		for (var i = 0; i < parserSyntax.length; i++) {
			var res = parserSyntax[i]();
			if (res === null) {
				pos = originalPos;
				debug(" -- failed sequence item " + i + " at " + rule.substr(pos, rule.length) + " for " + parserSyntax[i].toString());
				return null;
			}
			result.push(res);
		}
		return result;
	}

	// Run the same parser over and over until it fails.
	// Must succeed a minimum of n times; otherwise, return null.
	function nOrMore(n, p) {
		return function () {
			var originalPos = pos;
			var result = [];
			var parsed = p();
			while (parsed !== null) {
				result.push(parsed);
				parsed = p();
			}
			if (result.length < n) {
				pos = originalPos;
				return null;
			}
			return result;
		};
	}

	// Helpers -- just make parserSyntax out of simpler JS builtin types

	function makeStringParser(s) {
		var len = s.length;
		return function () {
			var result = null;
			if (rule.substr(pos, len) === s) {
				result = s;
				pos += len;
			}
			if (!result){
				debug(" -- failed regex for " +  s + " at " + rule.substr(pos, len));
			}
			return result;
		};
	}

	function makeRegexParser(regex) {
		return function () {
			var matches = rule.substr(pos).match(regex);
			if (matches === null) {
				return null;
			}
			pos += matches[0].length;
			return matches[0];
		};
	}

	function n() {
		var result = _n_();
		if (result === null) {
			debug(" -- failed n");
			return result;
		}
		result = parseFloat(number);
		debug(" -- passed n ", result);
		return result;
	}

	var expression = choice([mod, n]);

	function mod() {
		var result = sequence([n, whitespace, choice([_mod_,_percent_]), whitespace, digits]);
		if (result === null) {
			debug(" -- failed mod");
			return null;
		}
		debug(" -- passed " + parseInt(result[0], 10) + " "+ result[2] + " "  + parseInt(result[4], 10) );
		return parseInt(result[0], 10) % parseInt(result[4], 10);
	}

	function not() {
		var result = sequence([whitespace, _not_]);
		if (result === null) {
			debug(" -- failed not");
			return null;
		} else {
			return result[1];
		}
	}

	function is() {
		var result = sequence([expression, whitespace, _is_, whitespace, digits]);
		if (result !== null) {
			debug(" -- passed is : " + result[0] + ' == '+ parseInt(result[4], 10) );
			return result[0] === parseInt(result[4], 10);
		}
		debug(" -- failed is");
		return null;
	}

	function isnot() {
		var result = sequence([expression, whitespace, choice([ _isnot_, _isnot_sign_ ]), whitespace, digits]);
		if (result !== null) {
			debug(" -- passed isnot: " + result[0] + ' !== '+ parseInt(result[4], 10) );
			return result[0] !== parseInt(result[4], 10);
		}
		debug(" -- failed isnot");
		return null;
	}

	function not_in() {
		var result = sequence([expression, whitespace, _isnot_sign_, whitespace, range]);
		if (result !== null) {
			debug(" -- passed not_in: " + result[0] + ' != '+  result[4] );
			return result[0] < parseInt(result[4][0], 10)
				|| result[0] > parseInt(result[4][result.length-1], 10) ;
		}
		debug(" -- failed not_in");
		return null;
	}


	function rangeList() {
		// range_list    = (range | value) (',' range_list)*
		var result = sequence([choice([range, digits]), nOrMore(0, rangeTail)]);
		var resultList = [];
		if (result !== null) {
			resultList = resultList.concat(result[0]);
			if ( result[1][0] ) {
				resultList = resultList.concat(result[1][0]);
			}
			return resultList;
		}
		debug(" -- failed rangeList");
		return null;
	}

	function rangeTail() {
		// ',' range_list
		var result = sequence([_comma_, rangeList]);
		if (result !== null) {
			return result[1];
		}
		debug(" -- failed rangeTail");
		return null;
	}

	function range() {
		var i;
		var result = sequence([digits, _range_, digits]);
		if (result !== null) {
			debug(" -- passed range");
			var array = [];
			var left = parseInt(result[0], 10);
			var right = parseInt(result[2], 10);
			for ( i = left; i <= right; i++) {
				array.push(i);
			}
			return array;
		}
		debug(" -- failed range");
		return null;
	}

	function _in() {
		// in_relation   = expr ('not')? 'in' range_list
		var result = sequence([expression, nOrMore(0, not), whitespace, choice([_in_,_equal_]), whitespace, rangeList]);
		if (result !== null) {
			debug(" -- passed _in");
			var range_list = result[5];
			for (var i = 0; i < range_list.length; i++) {
				if (parseInt(range_list[i], 10) === result[0]) {
					return (result[1][0] !== 'not');
				}
			}
			return (result[1][0] === 'not');
		}
		debug(" -- failed _in ");
		return null;
	}

	function within() {
		// within_relation = expr ('not')? 'within' range_list
		var result = sequence([expression, nOrMore(0, not), whitespace, _within_, whitespace, rangeList]);
		if (result !== null) {
			debug(" -- passed within");
			var range_list = result[5];
			if ( ( result[0] >= parseInt(range_list[0]) ) &&
				( result[0] < parseInt(range_list[range_list.length-1]) ) ) {
				return (result[1][0] !== 'not');
			}
			return (result[1][0] === 'not');
		}
		debug(" -- failed within ");
		return null;
	}


	var relation = choice([is, not_in, isnot, _in, within]);

	function and() {
		var result = sequence([relation, whitespace, _and_, whitespace, condition]);
		if (result) {
			debug(" -- passed and");
			return result[0] && result[4];
		}
		debug(" -- failed and");
		return null;
	}

	function or() {
		var result = sequence([relation, whitespace, _or_, whitespace, condition]);
		if (result) {
			debug(" -- passed or");
			return result[0] || result[4];
		}
		debug(" -- failed or");
		return null;
	}

	function sampleRangeTail() {
		// ',' range_list
		var result = sequence([_comma_, whitespace, samples]);
		if (result !== null) {
			return result[1];
		}
		debug(" -- failed sampleRangeTail");
		return null;
	}

	function condition() {
		var result =  sequence([choice([and, or, relation])]);
		return result && result[0];
	}

	function start() {
		var result = condition();
		return result;
	}

	var result = start();

	/*
	 * For success, the pos must have gotten to the end of the rule
	 * and returned a non-null.
	 * n.b. This is part of language infrastructure, so we do not throw an internationalizable message.
	 */
	if (result === null || pos !== rule.length) {
		throw new Error("Parse error at position " + pos.toString() + " in input: " + rule + " result is " + result);
	}

	return result;
}

/* For module loaders, e.g. NodeJS, NPM */
if (typeof module !== 'undefined' && module.exports) {
	module.exports = pluralRuleParser;
}

