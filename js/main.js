'use strict';

const MINE_IMG = '<img src="img/mine.png"/>';
const FLAG_IMG = '<img src="img/flag.png"/>';

var gGame;
var gBoard;
var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gInterval;
var gTime;

function initGame() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    };
    gBoard = buildBoard();
    renderBoard(gBoard)
    clearInterval(gInterval);
    mines.innerText = `Mines: ${gLevel.MINES - gGame.markedCount}`;
    stopper.innerText = 'Time:';
    var elImg = document.querySelector('img');
    elImg.src = "img/smily.png";
}

function changeLevel(elBtn) {
    var elBoard = document.querySelector('.board');
    switch (elBtn.id) {
        case '1':
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
            elBoard.style.width = '224px';
            break;
        case '2':
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            elBoard.style.width = '436px';
            break;
        case '3':
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            elBoard.style.width = '648px';
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
    if (cell.isShown) return;
    if (event.button == 2) {
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
    if (!gBoard[cellIdx.i][cellIdx.j].minesAroundCount) expandShown(gBoard, cell, cellIdx.i, cellIdx.j);
    checkGameOver();
    if (cell.isMine) gameOver();
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
}

function gameOver() {
    gGame.isOn = false;
    var elImg = document.querySelector('img');
    elImg.src = "img/smilycry.png";
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
    gGame.secsPassed = Math.floor(printTime);
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
