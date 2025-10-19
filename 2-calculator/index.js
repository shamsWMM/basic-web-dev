const calculator = document.querySelector(".calculator-screen");
let calculation = "";

function handleButton(innerText) {
    calculation = generateCalculation(innerText, calculation);
    calculator.innerText = calculation;
}

function handleEvaluate(calculation) {
    try {
        let formattedCalculation = formatCalculation(calculation);
        let result = Number(Function(`"use strict"; return (${formattedCalculation})`)());
        return isNaN(result) ? "Error" : String(result);
    } catch (e) {
        return "Error";
    }
}

function formatCalculation(calculation) {
    return calculation
        .replaceAll("×", "*")
        .replaceAll("−", "-")
        .replaceAll("÷", "/");
}

function generateCalculation(innerText, calculation) {
    switch (innerText) {
        case "AC":
            return "0";
        case "CE":
            return calculation.length > 1 ?
                calculation.slice(0, -1) :
                "0";
        case "=":
            return handleEvaluate(calculation);
        default:
            return calculation === "0" ?
                innerText :
                calculation + innerText;
    }
}

function init() {
    document
        .querySelectorAll(".calculator-button")
        .forEach(button => button
            .addEventListener("click", function (event) {
                handleButton(event.target.innerText);
            }));
}

init();