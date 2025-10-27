const guessBuffer = [0, "", ""];
const maxRows = 6;
const maxCols = 5;

async function init() {
    await getWinningWord();

    document
        .querySelectorAll(".keyboard-row > button")
        .forEach((button) => button
            .addEventListener("click", handleButton));

    document.addEventListener("keydown", handleKey);
}

function getGuessRow() {
    return document
        .querySelectorAll(".guess-row")[guessBuffer[0]];
}
async function getWinningWord() {
    const winningWordRes = await fetch(
        "https://words.dev-apis.com/word-of-the-day?puzzle=1337");
    const { word } = await winningWordRes.json();
    guessBuffer[2] = word;
}

function handleButton(event) {
    let button = event.target;
    if (button.classList.contains("backspace")) {
        handleBackspace();
    }
    else if (button.classList.contains("enter")) {
        handleEnter();
    }
    else {
        handleText(button.innerText);
    }
}

function handleKey(event) {
    let key = event.key.toLowerCase();
    if (/^[a-z]$/.test(key)) {
        handleText(key);
    }
    else if (key === "backspace") {
        handleBackspace();
    }
    else if (key === "enter") {
        handleEnter();
    }
}

function handleBackspace() {
    if (guessBuffer[1] !== "") {
        updateGuessEntry(guessBuffer[0], guessBuffer[1].length - 1, "");
        guessBuffer[1] = guessBuffer[1].slice(0, -1);
    }
}

function updateGuessEntry(row, col, value) {
    const entryTile = getGuessRow().children[col];
    entryTile.innerText = value;
    if (value !== "") {
        entryTile.classList.add("guess-selected");
        entryTile.classList.add("appear");
        setTimeout(() => entryTile.classList.remove("appear"), 250);
    }
    else {
        entryTile.classList.remove("guess-selected");
    }
}

function handleText(text) {
    const bufferTextLength = guessBuffer[1].length;
    if (bufferTextLength < maxCols) {
        updateGuessEntry(guessBuffer[0], bufferTextLength, text);
        guessBuffer[1] += text;
    }
}

function handleEnter() {
    const bufferText = guessBuffer[1];
    const guessRow = getGuessRow();

    if (bufferText.length < maxCols) {
        shakeElement(guessRow);
        displayAlertBox("Not enough letters.");
    }
    else if (bufferText.length === 5) {
        handleGuess();
    }
}

function displayAlertBox(text) {
    const container = document.querySelector(".container");
    const alertBox = document.createElement("div");
    alertBox.classList.add("alert-box");
    alertBox.innerText = text;
    container.prepend(alertBox);
    setTimeout(function () {
        container.removeChild(alertBox);
    }, 1000);
}

function shakeElement(element) {
    element.classList.add("shake");
    setTimeout(() => element.classList.remove("shake"), 500);
}

function handleGuess() {
    if (guessBuffer[1] !== guessBuffer[2]) {
        handleFiveLetterText();
    }
    else {
        winGame();
    }
}

async function handleFiveLetterText() {
    const isValidWord = await validateWord(guessBuffer[1]);
    if (!isValidWord) {
        handleInvalidWord();
    }
    else {
        handleValidWord();
    }
}

async function validateWord(word) {
    const validateRes = await fetch(
        "https://words.dev-apis.com/validate-word",
        {
            body: JSON.stringify({ word }),
            method: "POST"
        });
    const { validWord } = await validateRes.json();
    return validWord;
}

function handleInvalidWord() {
    const guessRow = getGuessRow();
    shakeElement(guessRow);
    displayAlertBox("Not in word list.");
}

function handleValidWord() {
    const guessChars = guessBuffer[1].split("");
    const winChars = guessBuffer[2].split("");
    checkCorrectTiles(winChars, guessChars);
    checkSemiCorrectTiles(winChars, guessChars);
    displayGuessResult(guessChars);
    updateGameAfterGuess();
}

function checkCorrectTiles(winningChars, guessChars) {
    for (let index = 0; index < winningChars.length; index++) {
        if (guessChars[index] === winningChars[index]) {
            winningChars[index] = null;
            guessChars[index] = true;
        }
    }
}

function checkSemiCorrectTiles(winningChars, guessChars) {
    guessChars.forEach((char, index) => {
        if (char !== true) {
            const winningCharIndex = winningChars.indexOf(char);
            if (winningCharIndex !== -1) {
                winningChars[winningCharIndex] = null;
                guessChars[index] = false;
            }
        }
    });
}

function displayGuessResult(guessChars) {
    const guessRow = getGuessRow();
    for (let index = 0; index < guessChars.length; index++) {
        const tile = guessRow.children[index];
        setTimeout(() => {
            styleTile(tile, guessChars[index]);
        }, index * 600);
    }
}

function styleTile(tile, guessChar) {
    switch (guessChar) {
        case true:
            styleCorrectTile(tile);
            break;
        case false:
            styleSemicorrectTile(tile);
            break;
        default:
            styleIncorrectTile(tile);
    }
}

function updateGameAfterGuess() {
    guessBuffer[0] += 1;
    guessBuffer[1] = "";

    if (guessBuffer[0] < maxRows) return;
    displayAlertBox(guessBuffer[2]);
    removeAllEventListeners();
}

function winGame() {
    const guessResult = [true, true, true, true, true];
    displayGuessResult(guessResult);
    removeAllEventListeners();
    setTimeout(() => {
        displayAlertBox("Great!");
    }, 3000);
}

function styleCorrectTile(tile) {
    const letter = tile.innerText;
    removeSelectedTileStyle(tile)
    resetTileStyle(tile, "correct-guess");

    document.querySelectorAll(".keyboard-row > button").forEach(key => {
        if (key.innerText === letter) {
            // Always prioritize 'correct' styling
            key.classList.remove("incorrect-guess", "semicorrect-guess");
            key.classList.add("correct-guess");
        }
    });
}

function removeSelectedTileStyle(tile) {
    tile.classList.add("collapse-tile");
    setTimeout(() => tile.classList.remove("collapse-tile"), 500);
    tile.classList.remove("guess-selected");
}

function resetTileStyle(tile, newClass) {
    tile.classList.add(newClass);
    tile.classList.add("expand-tile");
    setTimeout(() => tile.classList.remove("expand-tile"), 500);
}

function styleSemicorrectTile(tile) {
    const letter = tile.innerText;
    removeSelectedTileStyle(tile);
    resetTileStyle(tile, "semicorrect-guess");

    document.querySelectorAll(".keyboard-row > button").forEach(key => {
        if (key.innerText === letter &&
            !key.classList.contains("correct-guess")) {
            key.classList.remove("incorrect-guess");
            key.classList.add("semicorrect-guess");
        }
    });
}

function styleIncorrectTile(tile) {
    const letter = tile.innerText;
    removeSelectedTileStyle(tile);
    resetTileStyle(tile, "incorrect-guess");

    document.querySelectorAll(".keyboard-row > button").forEach(key => {
        if (key.innerText === letter &&
            !key.classList.contains("correct-guess") &&
            !key.classList.contains("semicorrect-guess")) {
            key.classList.add("incorrect-guess");
        }
    });
}

function removeAllEventListeners() {
    document
        .querySelectorAll(".keyboard-row > button")
        .forEach(button => {
            button.removeEventListener("click", handleButton);
        });

    document.removeEventListener("keydown", handleKey);
}

init();