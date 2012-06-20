CLDR Plural Rule Evaluator
==========================
Find out the plural form for a given number in a language
---------------------------------------------------------

## Quick start

```bash
git clone https://github.com/santhoshtr/CLDRPluralRuleParser.git
```

## Documentation

Unlike English, for many languages, the plural forms are just not 2 forms.
If you look at the <a href="http://unicode.org/repos/cldr-tmp/trunk/diff/supplemental/language_plural_rules.html#pl">CLDR plural rules table</a>
you can easily understand this. The rules are defined in a particular syntax
(an eg: for Russian, the plural few is applied when the rule
"`n mod 10 in 2..4 and n mod 100 not in 12..14;`" is passed).

This tool is a demonstration of a <a href="cldrpluralparser.js">javascript parser</a>
for the plural rules in that syntax.

For a given number in a language, this tool tells which plural form it belongs.
The plural rules are taken from the CLDR  data file (<a href="plural.xml">plural.xml</a>.

See a demonstration of the javascript parser at:
http://thottingal.in/projects/js/plural/

## Test

Before you can run the tests, make sure the submodules are updated:
```
git submodule update --init
```

Then open up `./test/index.html` in your browser.
