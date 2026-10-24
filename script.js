// =========================
// DISPLAY & MAIN ELEMENTS
// =========================

const display = document.getElementById("display");

const calculatorButtons =
    document.querySelectorAll(".buttons button");

const clearHistoryButton =
    document.getElementById("clear-history");

const historyList =
    document.getElementById("history-list");

const angleModeButton =
    document.getElementById("angle-mode");

const scientificToggle =
    document.getElementById("scientific-toggle");

const historyToggle =
    document.getElementById("history-toggle");

const scientificButtons =
    document.getElementById("scientific-buttons");

const historyPanel =
    document.getElementById("history");


// =========================
// CALCULATOR STATE
// =========================

let expression = "";

let angleMode = "DEG";

let position = 0;


// =========================
// SMART DISPLAY
// =========================

function adjustDisplayFontSize() {

    const length = display.value.length;

    if (length <= 12) {
        display.style.fontSize = "30px";
    }

    else if (length <= 18) {
        display.style.fontSize = "25px";
    }

    else if (length <= 25) {
        display.style.fontSize = "21px";
    }

    else if (length <= 32) {
        display.style.fontSize = "18px";
    }

    else {
        display.style.fontSize = "16px";
    }
}


// =========================
// UPDATE DISPLAY
// =========================

function updateDisplay() {

    display.value = expression;

    adjustDisplayFontSize();
}


// =========================
// SHOW DISPLAY VALUE
// =========================

function showDisplay(value) {

    display.value = value;

    adjustDisplayFontSize();
}


// =========================
// BASIC CALCULATOR BUTTONS
// =========================

calculatorButtons.forEach(button => {

    button.addEventListener("click", () => {

        const value = button.textContent.trim();


        // =========================
        // CLEAR
        // =========================

        if (value === "C") {

            expression = "";

            updateDisplay();

            return;
        }


        // =========================
        // BACKSPACE
        // =========================

        if (value === "⌫") {

            expression =
                expression.slice(0, -1);

            updateDisplay();

            return;
        }


        // =========================
        // PERCENTAGE
        // =========================

        if (value === "%") {

            if (
                expression === "" ||
                expression.endsWith("%")
            ) {
                return;
            }

            expression += "%";

            updateDisplay();

            return;
        }


        // =========================
        // POSITIVE / NEGATIVE
        // =========================

        if (value === "±") {

            if (expression === "") {

                expression = "-";

            }

            else if (
                expression.startsWith("-")
            ) {

                expression =
                    expression.slice(1);

            }

            else {

                expression =
                    "-" + expression;
            }

            updateDisplay();

            return;
        }


        // =========================
        // EQUALS
        // =========================

        if (value === "=") {

            calculate();

            return;
        }


        // =========================
        // DECIMAL
        // =========================

        if (value === ".") {

            const currentNumber =
                expression
                    .split(/[+\-*\/()]/)
                    .pop();

            if (currentNumber.includes(".")) {
                return;
            }

            if (
                currentNumber === "" &&
                (
                    expression === "" ||
                    /[+\-*\/(]$/.test(expression)
                )
            ) {

                expression += "0";
            }

            expression += ".";

            updateDisplay();

            return;
        }


        // =========================
        // OPERATORS
        // =========================

        const operators = [
            "+",
            "-",
            "*",
            "/"
        ];

        if (operators.includes(value)) {

            const lastChar =
                expression.slice(-1);


            // Negative number at beginning

            if (
                value === "-" &&
                expression === ""
            ) {

                expression = "-";

                updateDisplay();

                return;
            }


            // Negative number after operator
            // Example: 10 * -2

            if (
                value === "-" &&
                operators.includes(lastChar)
            ) {

                expression += "-";

                updateDisplay();

                return;
            }


            // Replace existing operator

            if (
                operators.includes(lastChar)
            ) {

                expression =
                    expression.slice(0, -1) +
                    value;

                updateDisplay();

                return;
            }


            expression += value;

            updateDisplay();

            return;
        }


        // =========================
        // NORMAL INPUT
        // =========================

        expression += value;

        updateDisplay();

    });

});


// =========================
// CALCULATE
// =========================

function calculate() {

    if (expression === "") {
        return;
    }

    try {

        const originalExpression =
            expression;

        position = 0;

        const result =
            parseExpression();

        skipSpaces();


        if (
            position !==
            expression.length
        ) {

            throw new Error(
                "Invalid expression"
            );
        }


        if (!Number.isFinite(result)) {

            throw new Error(
                "Invalid calculation"
            );
        }


        const roundedResult =
            Number(result.toFixed(10));


        showDisplay(
            formatNumber(roundedResult)
        );


        expression =
            String(roundedResult);


        addToHistory(
            originalExpression,
            roundedResult
        );

    }

    catch (error) {

        showDisplay(
            error.message ||
            "Invalid input"
        );

        expression = "";
    }
}


// =========================
// EXPRESSION PARSER
// =========================

function parseExpression() {

    let result =
        parseTerm();


    while (true) {

        skipSpaces();


        if (
            expression[position] === "+"
        ) {

            position++;

            result += parseTerm();

        }

        else if (
            expression[position] === "-"
        ) {

            position++;

            result -= parseTerm();

        }

        else {

            break;
        }
    }


    return result;
}


// =========================
// TERM
// =========================

function parseTerm() {

    let result =
        parsePower();


    while (true) {

        skipSpaces();


        if (
            expression[position] === "*"
        ) {

            position++;

            result *= parsePower();

        }

        else if (
            expression[position] === "/"
        ) {

            position++;


            const divisor =
                parsePower();


            if (divisor === 0) {

                throw new Error(
                    "Cannot divide by zero"
                );
            }


            result /= divisor;

        }

        else {

            break;
        }
    }


    return result;
}


// =========================
// POWER
// =========================

function parsePower() {

    let result =
        parseFactor();


    skipSpaces();


    if (
        expression[position] === "^"
    ) {

        position++;


        const exponent =
            parsePower();


        result =
            result ** exponent;
    }


    return result;
}


// =========================
// FACTOR
// =========================

function parseFactor() {

    skipSpaces();


    // Negative numbers

    if (
        expression[position] === "-"
    ) {

        position++;

        return -parseFactor();
    }


    // Parentheses

    if (
        expression[position] === "("
    ) {

        position++;


        const result =
            parseExpression();


        skipSpaces();


        if (
            expression[position] !== ")"
        ) {

            throw new Error(
                "Missing parenthesis"
            );
        }


        position++;


        return result;
    }


    return parseNumber();
}


// =========================
// NUMBER
// =========================

function parseNumber() {

    skipSpaces();


    const start =
        position;


    while (
        position <
        expression.length &&
        /[0-9.]/.test(
            expression[position]
        )
    ) {

        position++;
    }


    if (
        start === position
    ) {

        throw new Error(
            "Invalid number"
        );
    }


    const numberText =
        expression.slice(
            start,
            position
        );


    if (
        (numberText.match(/\./g) || [])
            .length > 1
    ) {

        throw new Error(
            "Invalid number"
        );
    }


    const number =
        Number(numberText);


    if (
        !Number.isFinite(number)
    ) {

        throw new Error(
            "Invalid number"
        );
    }


    // Percentage

    if (
        expression[position] === "%"
    ) {

        position++;

        return number / 100;
    }


    return number;
}


// =========================
// SKIP SPACES
// =========================

function skipSpaces() {

    while (
        expression[position] === " "
    ) {

        position++;
    }
}


// =========================
// FORMAT NUMBERS
// =========================

function formatNumber(number) {

    const stringNumber =
        String(number);


    if (
        stringNumber.length <= 15
    ) {

        return stringNumber;
    }


    return number.toExponential(8);
}


// =========================
// EVALUATE CURRENT EXPRESSION
// =========================

function evaluateCurrentExpression() {

    if (expression === "") {

        throw new Error(
            "Empty expression"
        );
    }


    position = 0;


    const result =
        parseExpression();


    skipSpaces();


    if (
        position !== expression.length
    ) {

        throw new Error(
            "Incomplete expression"
        );
    }


    if (
        !Number.isFinite(result)
    ) {

        throw new Error(
            "Invalid calculation"
        );
    }


    return result;
}


// =========================
// SCIENTIFIC BUTTONS
// =========================

scientificButtons
    .querySelectorAll("button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const value =
                    button.textContent.trim();


                // =========================
                // ANGLE MODE
                // =========================

                if (
                    value === "DEG" ||
                    value === "RAD"
                ) {

                    angleMode =
                        angleMode === "DEG"
                            ? "RAD"
                            : "DEG";


                    angleModeButton.textContent =
                        angleMode;

                    return;
                }


                // =========================
                // SQUARE ROOT
                // =========================

                if (value === "√") {

                    try {

                        const original =
                            expression;

                        const number =
                            evaluateCurrentExpression();


                        if (number < 0) {

                            throw new Error(
                                "Invalid square root"
                            );
                        }


                        const result =
                            Math.sqrt(number);


                        const rounded =
                            Number(
                                result.toFixed(10)
                            );


                        showDisplay(
                            formatNumber(rounded)
                        );


                        expression =
                            String(rounded);


                        addToHistory(
                            `√(${original})`,
                            rounded
                        );

                    }

                    catch (error) {

                        showDisplay(
                            error.message ||
                            "Invalid input"
                        );

                        expression = "";
                    }


                    return;
                }


                // =========================
                // CUBE ROOT
                // =========================

                if (value === "∛") {

                    try {

                        const original =
                            expression;

                        const number =
                            evaluateCurrentExpression();


                        const result =
                            Math.cbrt(number);


                        const rounded =
                            Number(
                                result.toFixed(10)
                            );


                        showDisplay(
                            formatNumber(rounded)
                        );


                        expression =
                            String(rounded);


                        addToHistory(
                            `∛(${original})`,
                            rounded
                        );

                    }

                    catch (error) {

                        showDisplay(
                            error.message ||
                            "Invalid input"
                        );

                        expression = "";
                    }


                    return;
                }


                // =========================
                // SQUARE
                // =========================

                if (value === "x²") {

                    try {

                        const original =
                            expression;

                        const number =
                            evaluateCurrentExpression();


                        const result =
                            number ** 2;


                        if (
                            !Number.isFinite(result)
                        ) {

                            throw new Error(
                                "Result too large"
                            );
                        }


                        const rounded =
                            Number(
                                result.toFixed(10)
                            );


                        showDisplay(
                            formatNumber(rounded)
                        );


                        expression =
                            String(rounded);


                        addToHistory(
                            `(${original})²`,
                            rounded
                        );

                    }

                    catch (error) {

                        showDisplay(
                            error.message ||
                            "Invalid input"
                        );

                        expression = "";
                    }


                    return;
                }


                // =========================
                // CUBE
                // =========================

                if (value === "x³") {

                    try {

                        const original =
                            expression;

                        const number =
                            evaluateCurrentExpression();


                        const result =
                            number ** 3;


                        if (
                            !Number.isFinite(result)
                        ) {

                            throw new Error(
                                "Result too large"
                            );
                        }


                        const rounded =
                            Number(
                                result.toFixed(10)
                            );


                        showDisplay(
                            formatNumber(rounded)
                        );


                        expression =
                            String(rounded);


                        addToHistory(
                            `(${original})³`,
                            rounded
                        );

                    }

                    catch (error) {

                        showDisplay(
                            error.message ||
                            "Invalid input"
                        );

                        expression = "";
                    }


                    return;
                }


                // =========================
                // POWER
                // =========================

                if (value === "xʸ") {

                    if (
                        expression === "" ||
                        expression.endsWith("^")
                    ) {

                        return;
                    }


                    expression += "^";

                    updateDisplay();

                    return;
                }


                // =========================
                // RECIPROCAL
                // =========================

                if (value === "1/x") {

                    try {

                        const original =
                            expression;

                        const number =
                            evaluateCurrentExpression();


                        if (number === 0) {

                            throw new Error(
                                "Division by zero"
                            );
                        }


                        const result =
                            1 / number;


                        const rounded =
                            Number(
                                result.toFixed(10)
                            );


                        showDisplay(
                            formatNumber(rounded)
                        );


                        expression =
                            String(rounded);


                        addToHistory(
                            `1/(${original})`,
                            rounded
                        );

                    }

                    catch (error) {

                        showDisplay(
                            error.message ||
                            "Invalid input"
                        );

                        expression = "";
                    }


                    return;
                }


                // =========================
                // FACTORIAL
                // =========================

                if (value === "!") {

                    try {

                        const original =
                            expression;

                        const number =
                            evaluateCurrentExpression();


                        if (
                            number < 0 ||
                            !Number.isInteger(number)
                        ) {

                            throw new Error(
                                "Invalid factorial"
                            );
                        }


                        if (number > 170) {

                            throw new Error(
                                "Number too large"
                            );
                        }


                        let result = 1;


                        for (
                            let i = 2;
                            i <= number;
                            i++
                        ) {

                            result *= i;
                        }


                        const rounded =
                            Number(
                                result.toFixed(10)
                            );


                        showDisplay(
                            formatNumber(rounded)
                        );


                        expression =
                            String(rounded);


                        addToHistory(
                            `${original}!`,
                            rounded
                        );

                    }

                    catch (error) {

                        showDisplay(
                            error.message ||
                            "Invalid input"
                        );

                        expression = "";
                    }


                    return;
                }


                // =========================
                // PI
                // =========================

                if (value === "π") {

                    expression += Math.PI;

                    updateDisplay();

                    return;
                }


                // =========================
                // EULER'S NUMBER
                // =========================

                if (value === "e") {

                    expression += Math.E;

                    updateDisplay();

                    return;
                }


                // =========================
                // e^x
                // =========================

                if (value === "eˣ") {

                    try {

                        const original =
                            expression;

                        const number =
                            evaluateCurrentExpression();


                        const result =
                            Math.exp(number);


                        if (
                            !Number.isFinite(result)
                        ) {

                            throw new Error(
                                "Result too large"
                            );
                        }


                        const rounded =
                            Number(
                                result.toFixed(10)
                            );


                        showDisplay(
                            formatNumber(rounded)
                        );


                        expression =
                            String(rounded);


                        addToHistory(
                            `e^(${original})`,
                            rounded
                        );

                    }

                    catch (error) {

                        showDisplay(
                            error.message ||
                            "Invalid input"
                        );

                        expression = "";
                    }


                    return;
                }


                // =========================
                // 10^x
                // =========================

                if (value === "10ˣ") {

                    try {

                        const original =
                            expression;

                        const number =
                            evaluateCurrentExpression();


                        const result =
                            10 ** number;


                        if (
                            !Number.isFinite(result)
                        ) {

                            throw new Error(
                                "Result too large"
                            );
                        }


                        const rounded =
                            Number(
                                result.toFixed(10)
                            );


                        showDisplay(
                            formatNumber(rounded)
                        );


                        expression =
                            String(rounded);


                        addToHistory(
                            `10^(${original})`,
                            rounded
                        );

                    }

                    catch (error) {

                        showDisplay(
                            error.message ||
                            "Invalid input"
                        );

                        expression = "";
                    }


                    return;
                }


                // =========================
                // TRIGONOMETRY
                // =========================

                if (value === "sin") {

                    calculateTrig("sin");

                    return;
                }


                if (value === "cos") {

                    calculateTrig("cos");

                    return;
                }


                if (value === "tan") {

                    calculateTrig("tan");

                    return;
                }


                // =========================
                // INVERSE TRIGONOMETRY
                // =========================

                if (value === "sin⁻¹") {

                    calculateInverseTrig("asin");

                    return;
                }


                if (value === "cos⁻¹") {

                    calculateInverseTrig("acos");

                    return;
                }


                if (value === "tan⁻¹") {

                    calculateInverseTrig("atan");

                    return;
                }


                // =========================
                // LOGARITHMS
                // =========================

                if (value === "log") {

                    calculateLogarithm("log");

                    return;
                }


                if (value === "ln") {

                    calculateLogarithm("ln");

                    return;
                }

            }
        );

    });


// =========================
// TRIG FUNCTIONS
// =========================

function calculateTrig(type) {

    try {

        const original =
            expression;

        const number =
            evaluateCurrentExpression();


        let angle = number;


        if (angleMode === "DEG") {

            angle =
                number * Math.PI / 180;
        }


        let result;


        if (type === "sin") {

            result =
                Math.sin(angle);

        }

        else if (type === "cos") {

            result =
                Math.cos(angle);

        }

        else {

            if (
                Math.abs(
                    Math.cos(angle)
                ) < 1e-10
            ) {

                throw new Error(
                    "Tangent is undefined"
                );
            }


            result =
                Math.tan(angle);
        }


        const rounded =
            Number(
                result.toFixed(10)
            );


        showDisplay(
            formatNumber(rounded)
        );


        expression =
            String(rounded);


        addToHistory(
            `${type}(${original} ${angleMode})`,
            rounded
        );

    }

    catch (error) {

        showDisplay(
            error.message ||
            "Invalid input"
        );

        expression = "";
    }
}


// =========================
// INVERSE TRIG FUNCTIONS
// =========================

function calculateInverseTrig(type) {

    try {

        const original =
            expression;

        const number =
            evaluateCurrentExpression();


        let result;


        if (type === "asin") {

            if (
                number < -1 ||
                number > 1
            ) {

                throw new Error(
                    "Invalid input"
                );
            }


            result =
                Math.asin(number);
        }


        else if (type === "acos") {

            if (
                number < -1 ||
                number > 1
            ) {

                throw new Error(
                    "Invalid input"
                );
            }


            result =
                Math.acos(number);
        }


        else {

            result =
                Math.atan(number);
        }


        if (angleMode === "DEG") {

            result =
                result * 180 / Math.PI;
        }


        const rounded =
            Number(
                result.toFixed(10)
            );


        showDisplay(
            formatNumber(rounded)
        );


        expression =
            String(rounded);


        addToHistory(
            `${type}(${original} ${angleMode})`,
            rounded
        );

    }

    catch (error) {

        showDisplay(
            error.message ||
            "Invalid input"
        );

        expression = "";
    }
}


// =========================
// LOGARITHMS
// =========================

function calculateLogarithm(type) {

    try {

        const original =
            expression;

        const number =
            evaluateCurrentExpression();


        if (number <= 0) {

            throw new Error(
                "Invalid logarithm"
            );
        }


        let result;


        if (type === "log") {

            result =
                Math.log10(number);

        }

        else {

            result =
                Math.log(number);
        }


        const rounded =
            Number(
                result.toFixed(10)
            );


        showDisplay(
            formatNumber(rounded)
        );


        expression =
            String(rounded);


        addToHistory(
            `${type}(${original})`,
            rounded
        );

    }

    catch (error) {

        showDisplay(
            error.message ||
            "Invalid input"
        );

        expression = "";
    }
}


// =========================
// HISTORY
// =========================

function addToHistory(
    savedExpression,
    result
) {

    let history =
        JSON.parse(
            localStorage.getItem(
                "calculatorHistory"
            ) || "[]"
        );


    // =========================
    // PREVENT EXACT DUPLICATES
    // =========================

    const duplicateExists =
        history.some(item =>
            item.expression ===
                savedExpression &&
            item.result === result
        );


    if (duplicateExists) {
        return;
    }


    // =========================
    // CREATE HISTORY ITEM
    // =========================

    const item =
        document.createElement("div");

    item.className =
        "history-item";


    const calculation =
        document.createElement("span");


    calculation.textContent =
        `${savedExpression} = ${result}`;


    const deleteButton =
        document.createElement("button");


    deleteButton.textContent =
        "×";


    deleteButton.className =
        "delete-history";


    // =========================
    // RESTORE CALCULATION
    // =========================

    calculation.addEventListener(
        "click",
        () => {

            expression =
                savedExpression;

            updateDisplay();
        }
    );


    // =========================
    // DELETE HISTORY ITEM
    // =========================

    deleteButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            item.remove();


            removeFromSavedHistory(
                savedExpression,
                result
            );
        }
    );


    item.appendChild(
        calculation
    );

    item.appendChild(
        deleteButton
    );


    historyList.prepend(item);


    // =========================
    // SAVE TO LOCAL STORAGE
    // =========================

    history.unshift({
        expression:
            savedExpression,

        result:
            result
    });


    localStorage.setItem(
        "calculatorHistory",
        JSON.stringify(history)
    );
}


// =========================
// REMOVE HISTORY ITEM
// =========================

function removeFromSavedHistory(
    savedExpression,
    result
) {

    let history =
        JSON.parse(
            localStorage.getItem(
                "calculatorHistory"
            ) || "[]"
        );


    let removed = false;


    history =
        history.filter(item => {

            if (
                !removed &&
                item.expression ===
                    savedExpression &&
                item.result === result
            ) {

                removed = true;

                return false;
            }


            return true;
        });


    localStorage.setItem(
        "calculatorHistory",
        JSON.stringify(history)
    );
}


// =========================
// LOAD HISTORY
// =========================

function loadHistory() {

    const history =
        JSON.parse(
            localStorage.getItem(
                "calculatorHistory"
            ) || "[]"
        );


    historyList.innerHTML = "";


    history.forEach(item => {

        const historyItem =
            document.createElement("div");


        historyItem.className =
            "history-item";


        const calculation =
            document.createElement("span");


        calculation.textContent =
            `${item.expression} = ${item.result}`;


        const deleteButton =
            document.createElement("button");


        deleteButton.textContent =
            "×";


        deleteButton.className =
            "delete-history";


        // Restore calculation

        calculation.addEventListener(
            "click",
            () => {

                expression =
                    item.expression;

                updateDisplay();
            }
        );


        // Delete calculation

        deleteButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                historyItem.remove();


                removeFromSavedHistory(
                    item.expression,
                    item.result
                );
            }
        );


        historyItem.appendChild(
            calculation
        );


        historyItem.appendChild(
            deleteButton
        );


        historyList.appendChild(
            historyItem
        );

    });
}


// =========================
// LOAD SAVED HISTORY
// =========================

loadHistory();


// =========================
// CLEAR HISTORY
// =========================

clearHistoryButton.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "calculatorHistory"
        );


        historyList.innerHTML = "";
    }
);


// =========================
// CALCULATOR MODE SWITCHING
// =========================

function showBasicMode() {

    document.querySelector(
        ".buttons"
    ).style.display = "grid";


    scientificButtons.style.display =
        "none";


    historyPanel.style.display =
        "none";


    scientificToggle.classList.remove(
        "active"
    );


    historyToggle.classList.remove(
        "active"
    );


    scientificToggle.textContent =
        "Scientific";


    historyToggle.textContent =
        "History";
}


function showScientificMode() {

    document.querySelector(
        ".buttons"
    ).style.display = "none";


    scientificButtons.style.display =
        "grid";


    historyPanel.style.display =
        "none";


    scientificToggle.classList.add(
        "active"
    );


    historyToggle.classList.remove(
        "active"
    );


    scientificToggle.textContent =
        "Basic Calculator";


    historyToggle.textContent =
        "History";
}


function showHistoryMode() {

    document.querySelector(
        ".buttons"
    ).style.display = "none";


    scientificButtons.style.display =
        "none";


    historyPanel.style.display =
        "block";


    scientificToggle.classList.remove(
        "active"
    );


    historyToggle.classList.add(
        "active"
    );


    scientificToggle.textContent =
        "Scientific";


    historyToggle.textContent =
        "Calculator";
}


// =========================
// SCIENTIFIC BUTTON
// =========================

scientificToggle.addEventListener(
    "click",
    () => {

        if (
            scientificButtons.style.display ===
            "grid"
        ) {

            showBasicMode();

        }

        else {

            showScientificMode();
        }

    }
);


// =========================
// HISTORY BUTTON
// =========================

historyToggle.addEventListener(
    "click",
    () => {

        if (
            historyPanel.style.display ===
            "block"
        ) {

            showBasicMode();

        }

        else {

            showHistoryMode();
        }

    }
);


// =========================
// KEYBOARD SUPPORT
// =========================

document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key;


        // =========================
        // NUMBERS
        // =========================

        if (
            /^[0-9]$/.test(key)
        ) {

            expression += key;

            updateDisplay();

            return;
        }


        // =========================
        // DECIMAL
        // =========================

        if (key === ".") {

            const currentNumber =
                expression
                    .split(/[+\-*\/()]/)
                    .pop();


            if (
                currentNumber.includes(".")
            ) {

                return;
            }


            if (
                currentNumber === "" &&
                (
                    expression === "" ||
                    /[+\-*\/(]$/.test(
                        expression
                    )
                )
            ) {

                expression += "0";
            }


            expression += ".";


            updateDisplay();

            return;
        }


        // =========================
        // OPERATORS
        // =========================

        if (
            key === "+" ||
            key === "-" ||
            key === "*" ||
            key === "/"
        ) {

            const operators = [
                "+",
                "-",
                "*",
                "/"
            ];


            const lastChar =
                expression.slice(-1);


            // Negative at beginning

            if (
                key === "-" &&
                expression === ""
            ) {

                expression = "-";

                updateDisplay();

                return;
            }


            // Negative after operator

            if (
                key === "-" &&
                operators.includes(
                    lastChar
                )
            ) {

                expression += "-";

                updateDisplay();

                return;
            }


            // Replace existing operator

            if (
                operators.includes(
                    lastChar
                )
            ) {

                expression =
                    expression.slice(0, -1) +
                    key;

                updateDisplay();

                return;
            }


            expression += key;

            updateDisplay();

            return;
        }


        // =========================
        // PARENTHESES
        // =========================

        if (
            key === "(" ||
            key === ")"
        ) {

            expression += key;

            updateDisplay();

            return;
        }


        // =========================
        // PERCENTAGE
        // =========================

        if (key === "%") {

            if (
                expression !== "" &&
                !expression.endsWith("%")
            ) {

                expression += "%";

                updateDisplay();
            }


            return;
        }


        // =========================
        // BACKSPACE
        // =========================

        if (key === "Backspace") {

            expression =
                expression.slice(0, -1);

            updateDisplay();

            return;
        }


        // =========================
        // CLEAR
        // =========================

        if (
            key === "Escape" ||
            key.toLowerCase() === "c"
        ) {

            expression = "";

            updateDisplay();

            return;
        }


        // =========================
        // EQUALS
        // =========================

        if (
            key === "Enter" ||
            key === "="
        ) {

            event.preventDefault();

            calculate();

            return;
        }

    }
);


// =========================
// INITIAL MODE
// =========================

showBasicMode();


// =========================
// INITIAL DISPLAY SIZE
// =========================

adjustDisplayFontSize();