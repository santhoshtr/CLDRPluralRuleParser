import pluralRuleParser from "../src/CLDRPluralRuleParser.js";

let pluraldata = {};

async function init() {
	try {
		const response = await fetch("./plurals.json");
		pluraldata = await response.json();
		const languageSelect = document.getElementById("input-language");
		const numberInput = document.getElementById("input-number");
		languageSelect.addEventListener("change", changeHandler);
		numberInput.addEventListener("change", changeHandler);
		changeHandler();
	} catch (error) {
		console.error("Failed to load plurals.json:", error);
		displayError("Failed to load plural rules data");
	}
}

function changeHandler() {
	const locale = document.getElementById("input-language").value;
	const number = document.getElementById("input-number").value;
	calculate({ locale, number });
}

function calculate(options) {
	const resultContainer = document.querySelector(".result");
	resultContainer.innerHTML = "";

	const pluralRules =
		pluraldata.supplemental["plurals-type-cardinal"][options.locale];

	if (!pluralRules) {
		displayError("No plural rules found");
		return;
	}

	let matched = false;
	for (const ruleName in pluralRules) {
		const rule = pluralRules[ruleName];
		const resultDiv = document.createElement("div");
		const pluralForm = ruleName.split("-").pop();

		const result = pluralRuleParser(rule, options.number);
		if (result && !matched) {
			resultDiv.className = "result-item result-item-match";
			matched = true;
		} else {
			resultDiv.className = "result-item result-item-nomatch";
		}

		resultDiv.textContent = `${pluralForm}: ${rule}`;
		resultContainer.appendChild(resultDiv);
	}
}

function displayError(message) {
	const resultContainer = document.querySelector(".result");
	const errorDiv = document.createElement("div");
	errorDiv.className = "result-item result-item-error";
	errorDiv.textContent = message;
	resultContainer.appendChild(errorDiv);
}

document.addEventListener("DOMContentLoaded", init);
