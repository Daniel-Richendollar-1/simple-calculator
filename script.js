// ==========================
// Global variables defining
// ==========================

const buttons = document.querySelectorAll("button"); // Selects all buttons
let displayString = "0";
let currentInput = null;
let result = null;

let originalZero = true;
let operatorPresent = false;
let errorMessage = null;
let isLocked = false;

let previousValue = null;
let operator = null;
let resultReady = false;

const operatorList = ["+", "-", "/", "x"];


// ==========================
// Functions
// ==========================

// Clears the calculator's internal state
function resetState() {
    previousValue = null;
    currentInput = null;
    operator = null;
    operatorPresent = false;

    displayString = "0";
    originalZero = true;
    resultReady = false;
    displayValue(displayString);


    result = null;
}


// Displays the given value
function displayValue(value) {
    let displayDirectory = document.getElementById("display");
    displayDirectory.innerText = value;
}

// Displays error message, and blocks user from entering values
function showError() {
    isLocked = true;
    displayValue(errorMessage);

    setTimeout(function () {
        resetState();
        isLocked = false;
    }, 2000);
}

function setError(message) {
    errorMessage = message;
    showError();
}


// Performs the operations and saves them
function performOperation() {
    // Doesn't calculate if there is no previous value
    if (previousValue === null) {
        return;
    }


    // Performs operations
    if (operator === "+") {
        previousValue = previousValue + Number(currentInput);
    }
    else if (operator === "-") {
        previousValue = previousValue - Number(currentInput);
    }
    else if (operator === "/") {
        if (Number(currentInput) === 0) {
            setError("Error: Can't divide by zero");
            return;
        }
        else if (previousValue === 0) {
            return "0";
        }
        previousValue = previousValue / Number(currentInput);

    }
    else if (operator === "x") {
        previousValue = previousValue * Number(currentInput);
    }

    // Sets error in case of unexpected result
    if (Number.isNaN(previousValue)) {
        setError("Error: Invalid calculation")
        return;
    }

}

// Evaluates one value at a time
function evalCurrentValue(value) {
    // Checks if there is already a symbol, and if the current value is a symbol
    if (operatorPresent && operatorList.includes(value)) {
        // Checks if user inputed only a point
        if (currentInput === ".") {
            setError("Error: Invalid value")
            return;
        }

        // In case there is multiple continous operators,
        // it would select the last entered
        if (currentInput === null) {
            operator = value;
            return;
        }

        // Immediately calculates the saved values, and saves them
        // into the previousValue variable
        performOperation()

        if (isLocked) {
            return;
        }


        // Leaves the currentInput open for new values, saves the
        // operator value, and saves the current result
        currentInput = null;
        operator = value;
        result = String(previousValue);
    return;
    }

    // Checks if current value is a symbol operator
    if (operatorList.includes(value)) {
        // If symbol operator is clicked before a value, returns error
        if (currentInput === null) {
            setError("Error: No value entered before operator");
            return;
        }
        // Checks if user inputed only a point
        else if (currentInput === ".") {
            setError("Error: Invald value")
            return;
        }
        // Separates the old value, into the previousValue variable
        // and frees the current value for the next one to come
        operator = value;
        operatorPresent = true;
        previousValue = Number(currentInput);
        currentInput = null;
        result = String(previousValue);
        return;
    }

    // Checks if equal button is clicked
    if (value === "=") {
        // Checks if user inputs only a point
        if (currentInput === ".") {
            setError("Error: Invald value");
            return;
        }

        // Prevent calculating without second number
        if (currentInput === null) {
            return null;
        }


        // Calculates based on symbol saved
        performOperation();

        // Prevents operation if there is an error
        if (isLocked) {
            return;
        }


        // Saves and returns current result
        if (previousValue === null) {
            result = currentInput;
        }
        else {
            result = String(previousValue);
        }
       

        return result;
    }


    // Saves the value if not a symbol operator
    else {
        if (value === "." && currentInput !== null && currentInput.includes(".")) {
            setError("Error: Invalid value");
            return;
        }
        if (currentInput === null) {
            currentInput = value;
        }
        else {
            currentInput += value;
        }
    }
}


// Gets the value depending on button clicked
function getValue(event) {
    // Gets the data from buttons
    const clickedButton = event.target;
    const buttonText = clickedButton.textContent;

    // Locks pad while error is displayed, except for CLEAR
    if (isLocked && buttonText !== "CLEAR") {
    return;
    }

   
    // Resets state and display
    if (buttonText === "CLEAR") {
        resetState()
    }
   
    // After result, if symbol operator is clicked, continue
    // calculating with displayed value
    else if (operatorList.includes(buttonText)) {
        if (resultReady) {
            previousValue = Number(displayString);
            currentInput = null;
            operator = buttonText;
            operatorPresent = true;
            result = String(previousValue);
            resultReady = false;
            displayString += buttonText;
            displayValue(displayString);
            return;
        }

        if (originalZero) {
            displayString = buttonText;
            originalZero = false;
        }
        else {
            displayString += buttonText;
        }


        displayValue(displayString);
        evalCurrentValue(buttonText);
    }

    else if (buttonText === "=") {

        // Checks if equality was clicked before any values
        if (operator === null && currentInput === null) {
            return;
        }

        // Evalueates to get result
        const value = evalCurrentValue(buttonText);

        // Prevents operation if there is an error
        if (isLocked) {
            return;
        }
        // Mantains current state if there is no new input
        if (value === null) {
            return;
        }

        displayString = value;
        displayValue(displayString);

        // Check if operation is finsihed
        const noPendingOperation = operatorPresent || previousValue !== null || operator !== null;
        // Manual state reset on specifics
        previousValue = null;
        currentInput = displayString;
        operator = null;
        operatorPresent = false;
        originalZero = false;

        if (noPendingOperation) {
            // Lets the calculator restart after new input
            resultReady = true;
        }

       
    }

    // If user decides to click a number, calculation restarts
    // (also in charge of "0" place holder)
    else if (originalZero || resultReady) {
        displayString = buttonText;
        originalZero = false;
        resultReady = false;
        previousValue = null;
        currentInput = null;
        operator = null;
        operatorPresent = false;
        result = null;


        displayValue(displayString);
        evalCurrentValue(buttonText);
    }

    else {
        displayString += buttonText;
        displayValue(displayString);
        evalCurrentValue(buttonText);
    }
}


// ==========================
// Main: Checks for clicks
// ==========================

buttons.forEach((button) => {
    button.addEventListener("click", getValue)
});