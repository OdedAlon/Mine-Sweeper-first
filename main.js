'use strict';

const MINE_IMG = '<img src="img/mine.png"/>';
const MINEBOOM_IMG = '<img src="img/mineboom.png"/>';
const FLAG_IMG = '<img src="img/flag.png"/>';

var gGame;
var gBoard;
var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gInterval;
var gTime;
var gHintsMode;

function initGame() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3,
        hints: 3
    };
    gBoard = buildBoard();
    gHintsMode = false;
    renderBoard(gBoard);
    clearInterval(gInterval);
    resetElements()
    
    // Retrieve from local storage
    
    switch (gLevel.SIZE) {
        case 4:                                            
            document.getElementById("bestTimeLevel1").innerHTML = localStorage.bestTimeLevel1;    
        case 8:
            document.getElementById("bestTimeLevel2").innerHTML = localStorage.bestTimeLevel2;    
            break;
        case 12:
            document.getElementById("bestTimeLevel3").innerHTML = localStorage.bestTimeLevel3;    
            break;
    }
}

function resetElements() {
    mines.innerText = `Mines: ${gLevel.MINES - gGame.markedCount}`;
    stopper.innerText = 'Time:';
    var elImg = document.querySelector('img');
    elImg.src = "img/smily.png";
    var elLives = document.querySelector('.lives');
    elLives.innerText = `0${gGame.lives} LIVES left`;
    var elHints = document.querySelector('.hints');
    elHints.innerText = `0${gGame.hints} HINTS left`;
}

function changeLevel(elBtn) {
    var elBoard = document.querySelector('.board');
    switch (elBtn.id) {
        case '1':
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
            elBoard.style.width = '224px';
            var elBestTimeLevel1 = document.getElementById('bestTimeLevel1');
            var elBestTimeLevel2 = document.getElementById('bestTimeLevel2');
            var elBestTimeLevel3 = document.getElementById('bestTimeLevel3');
            elBestTimeLevel1.style.display = 'block';
            elBestTimeLevel2.style.display = 'none';
            elBestTimeLevel3.style.display = 'none';
            break;
        case '2':
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            elBoard.style.width = '436px';
            var elBestTimeLevel1 = document.getElementById('bestTimeLevel1');
            var elBestTimeLevel2 = document.getElementById('bestTimeLevel2');
            var elBestTimeLevel3 = document.getElementById('bestTimeLevel3');
            elBestTimeLevel1.style.display = 'none';
            elBestTimeLevel2.style.display = 'block';
            elBestTimeLevel3.style.display = 'none';
            break;
        case '3':
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            elBoard.style.width = '648px';
            var elBestTimeLevel1 = document.getElementById('bestTimeLevel1');
            var elBestTimeLevel2 = document.getElementById('bestTimeLevel2');
            var elBestTimeLevel3 = document.getElementById('bestTimeLevel3');
            elBestTimeLevel1.style.display = 'none';
            elBestTimeLevel2.style.display = 'none';
            elBestTimeLevel3.style.display = 'block';
            break;
    }
    initGame();
}

function buildBoard() {
    var SIZE = gLevel.SIZE;
    var board = [];
    for (var i = 0; i < SIZE; i++) {
        board.push([]);
        for (var j = 0; j < SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
        }
    }
    return board;
}

function placeMines(board) {
    for (var i = 0; i < gLevel.MINES; i++) {
        var iIdx = getRandomIntInclusive(0, gLevel.SIZE - 1);
        var jIdx = getRandomIntInclusive(0, gLevel.SIZE - 1);
        // Check if cell Empty, and not the first click.
        if (!board[iIdx][jIdx].isMine && !board[iIdx][jIdx].isShown) board[iIdx][jIdx].isMine = true;
        else i--;
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j].minesAroundCount = getMineNegsCellCount(board, board[i][j], i, j);
        }
    }
}

function getMineNegsCellCount(board, cell, iIdx, jIdx) {
    var counter = 0;
    for (var i = iIdx - 1; i <= iIdx + 1; i++) {
        if (i < 0 || i > gLevel.SIZE - 1) continue;
        for (var j = jIdx - 1; j <= jIdx + 1; j++) {
            if (j < 0 || j > gLevel.SIZE - 1) continue;
            if (i === iIdx && j === jIdx) continue;
            if (board[i][j].isMine) counter++;
        }
    }
    return counter;
}

function renderBoard(board) {
    var strHTML = '<table border="5" cellpadding="12"><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var cell = '';
            if (board[i][j].isShown) {
                if (board[i][j].isMine) cell = MINE_IMG;
                else if (board[i][j].minesAroundCount) cell = board[i][j].minesAroundCount;
            } else {
                if (board[i][j].isMarked) cell = FLAG_IMG;
            }
            strHTML += `<td id="cell-${i}-${j}"`;
            if (board[i][j].isShown) strHTML += ' class="shown" ';
            strHTML += `onmousedown="cellCliked(event, this)">${cell}</td>`;
        }
        strHTML += '</tr>';
    }
    strHTML += '</tbody></table>';
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function cellCliked(event, elCell) {
    if (!gGame.isOn && gGame.shownCount) return;
    var cellIdx = getCellIdx(elCell.id);
    var cell = gBoard[cellIdx.i][cellIdx.j];
    if (gHintsMode) {
        showHint(elCell);
        return;
    }
    if (cell.isShown) return;
    if (event.button === 2) {
        cellMarked(cell);
        return;
    }
    if (cell.isMarked) return;

    cell.isShown = true;
    gGame.shownCount++;
    if (!gGame.isOn) {
        gGame.isOn = true;
        playStopper();
        placeMines(gBoard);
        setMinesNegsCount(gBoard);
    }
    if (!gBoard[cellIdx.i][cellIdx.j].minesAroundCount && !gBoard[cellIdx.i][cellIdx.j].isMine)
        expandShown(gBoard, cell, cellIdx.i, cellIdx.j);
    checkGameOver();
    if (cell.isMine) {
        gGame.shownCount--;
        if (gGame.lives) {
            updateLives();
            renderBoard;
        } else {
            gameOver();
            elCell.innerHTML = `${MINEBOOM_IMG}`;     // NOT working, red bgc when game over, because RENDERBOARD
            elCell.classList.remove('shown');
            elCell.classList.add('boom');
            return;
        }
    }
    renderBoard(gBoard);
}

function expandShown(board, cell, iIdx, jIdx) {
    for (var i = iIdx - 1; i <= iIdx + 1; i++) {
        if (i < 0 || i > gLevel.SIZE - 1) continue;
        for (var j = jIdx - 1; j <= jIdx + 1; j++) {
            if (j < 0 || j > gLevel.SIZE - 1) continue;
            if (i === iIdx && j === jIdx) continue;
            if (!board[i][j].isShown) {
                board[i][j].isShown = true;
                gGame.shownCount++;
                if (!board[i][j].minesAroundCount) expandShown(board, board[i][j], i, j);
            }
        }
    }
}

function getCellIdx(cellId) {
    var parts = cellId.split('-')
    var Idx = { i: +parts[1], j: +parts[2] };
    return Idx;
}

function checkGameOver() {
    if (gGame.shownCount === (gLevel.SIZE ** 2) - gLevel.MINES) victory();
}

function victory() {
    gGame.isOn = false;
    var elImg = document.querySelector('img');
    elImg.src = "img/smilywin.png";
    clearInterval(gInterval);
    // Store in local storage
    // var myStorage = window.localStorage;
    // console.log(myStorage)
    switch (gLevel.SIZE) {
        case 4:
            const lastBestTimeLevel1 = localStorage.getItem('bestTimeLevel1');
            if (!lastBestTimeLevel1) localStorage.setItem('bestTimeLevel1', gGame.secsPassed);
            else if (lastBestTimeLevel1 > gGame.secsPassed) localStorage.setItem('bestTimeLevel1', gGame.secsPassed);
            break;
        case 8:
            const lastBestTimeLevel2 = localStorage.getItem('bestTimeLevel2');
            if (!lastBestTimeLevel2) localStorage.setItem('bestTimeLevel2', gGame.secsPassed);
            else if (lastBestTimeLevel2 > gGame.secsPassed) localStorage.setItem('bestTimeLevel2', gGame.secsPassed);
            break;
        case 12:
            const lastBestTimeLevel3 = localStorage.getItem('bestTimeLevel3');
            if (!lastBestTimeLevel3) localStorage.setItem('bestTimeLevel3', gGame.secsPassed);
            else if (lastBestTimeLevel3 > gGame.secsPassed) localStorage.setItem('bestTimeLevel3', gGame.secsPassed);
            break;
    }
    renderBoard(gBoard);
}

function updateLives() {
    gGame.lives--;
    var elLives = document.querySelector('.lives');
    elLives.innerText = `0${gGame.lives} LIVES left`;
}

function giveHint() {
    if (!gGame.isOn) return;
    gHintsMode = true;
}

function showHint(elCell) {
    var cellIdx = getCellIdx(elCell.id);
    var cell = gBoard[cellIdx.i][cellIdx.j];
    if (cell.isShown) return;
    // Check if all cells unshown
    for (var i = cellIdx.i - 1; i <= cellIdx.i + 1; i++) {
        if (i < 0 || i > gLevel.SIZE - 1) continue;
        for (var j = cellIdx.j - 1; j <= cellIdx.j + 1; j++) {
            if (j < 0 || j > gLevel.SIZE - 1) continue;
            if (i === cellIdx.i && j === cellIdx.j) continue;
            if (gBoard[i][j].isShown) return;
        }
    }
    for (var i = cellIdx.i - 1; i <= cellIdx.i + 1; i++) {
        if (i < 0 || i > gLevel.SIZE - 1) continue;
        for (var j = cellIdx.j - 1; j <= cellIdx.j + 1; j++) {
            if (j < 0 || j > gLevel.SIZE - 1) continue;
            var currElCell = document.getElementById(`cell-${i}-${j}`);
            // CurrElCell.classList.add('shown');
            var cell = '';
            if (gBoard[i][j].isMine) cell = MINE_IMG;
            else if (gBoard[i][j].minesAroundCount) cell = gBoard[i][j].minesAroundCount;
            var strHTML = `<td id="cell-${i}-${j}" class="shown" onmousedown="cellCliked(event, this)">${cell}</td>`;
            currElCell.innerHTML = strHTML;


        }
    }
    gGame.hints--;
    var elHints = document.querySelector('.hints');
    elHints.innerText = `0${gGame.hints} HINTS left`;
    setTimeout(hideHint, 1000, elCell);
}

function hideHint(elCell) {
    var cellIdx = getCellIdx(elCell.id);
    var cell = gBoard[cellIdx.i][cellIdx.j];
    for (var i = cellIdx.i - 1; i <= cellIdx.i + 1; i++) {
        if (i < 0 || i > gLevel.SIZE - 1) continue;
        for (var j = cellIdx.j - 1; j <= cellIdx.j + 1; j++) {
            if (j < 0 || j > gLevel.SIZE - 1) continue;
            var currElCell = document.getElementById(`cell-${i}-${j}`);
            currElCell.innerHTML = `<td id="cell-${i}-${j}" class="shown" onmousedown="cellCliked(event, this)"></td>`;
        }
    }
    gHintsMode = false;
}

function gameOver() {
    gGame.isOn = false;
    var elImg = document.querySelector('img');
    elImg.src = "img/smilycry.png";
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (gBoard[i][j].isMine && !gBoard[i][j].isShown) gBoard[i][j].isShown = true;
        }
    }
    renderBoard(gBoard);
    clearInterval(gInterval);
}

function playStopper() {
    gTime = new Date();
    gInterval = setInterval(getTime, 50);
}

function getTime() {
    var now = new Date();
    var millisec = now - gTime;
    var printTime;
    if (millisec < 1000) printTime = '0.' + millisec;
    else printTime = (millisec / 1000);
    stopper.innerText = `Time : ${printTime}`;
    gGame.secsPassed = printTime;
}

function cellMarked(cell) {
    if (!cell.isMarked) {
        cell.isMarked = true;
        gGame.markedCount++;
        mines.innerText = `Mines: ${gLevel.MINES - gGame.markedCount}`;
    } else {
        cell.isMarked = false;
        gGame.markedCount--;
        mines.innerText = `Mines: ${gLevel.MINES - gGame.markedCount}`;
    }
    checkGameOver();
    renderBoard(gBoard);
}

window.oncontextmenu = function () {
    return false;
}
