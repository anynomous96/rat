const X_CLASS = "x";
const O_CLASS = "o";
const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let currentPlayerMark = O_CLASS;
let isVsPlayer = false;
let oTurn = false;

let xWin = 0;
let oWin = 0;
let tie = 0;

let winningArry;
let currentClass;

// CASHING DOM ELEMENTS
const vsCpuBtn = document.getElementById("vs-cpu");
const vsPlayerBtn = document.getElementById("vs-player");
const restartBtn = document.getElementById("restart-btn");

const gameStartEl = document.getElementById("game-start");
const gamePlayEl = document.getElementById("gameplay");
const gameMarksEl = document.querySelectorAll("#game-start-marks div");
const gameBoardEl = document.getElementById("gameplay-board");

const modalEl = document.getElementById("modal");
const backdropEl = document.getElementById("backdrop");

const cells = document.querySelectorAll(".gameplay__card");
const opponentMessage = document.getElementById("opponent-message");

function setGameModeHandler() {
  const btnClickedId = this.id;

  if (btnClickedId === "vs-player") isVsPlayer = true;

  changeDomLayout(gameStartEl, "d-block", "d-none");
  changeDomLayout(gamePlayEl, "d-none", "d-grid");
  startGame();
}

function changeDomLayout(domEl, display1, display2) {
  domEl.classList.remove(display1);
  domEl.classList.add(display2);
}

function startGame() {
  setBoardHoverClass();
  setScoreBoard();
  setTurn();

  if (!isVsPlayer) playVsCpu();
  else playVsPlayer();
}

function setBoardHoverClass() {
  if (oTurn) {
    gameBoardEl.classList.remove(X_CLASS);
    gameBoardEl.classList.add(O_CLASS);
  } else {
    gameBoardEl.classList.remove(O_CLASS);
    gameBoardEl.classList.add(X_CLASS);
  }
}

function setScoreBoard() {
  const xWinEl = document.getElementById("x-win");
  const tieEl = document.getElementById("tie");
  const oWinEl = document.getElementById("o-win");

  xWinEl.innerHTML = `${
    isVsPlayer
      ? "X (P1)"
      : currentPlayerMark === O_CLASS
      ? "X (CPU)"
      : "X (You)"
  } <span id="x-win-inner" class="gameplay__highlight">${xWin}</span>`;
  tieEl.innerHTML = `Ties <span id="tie-inner" class="gameplay__highlight">${tie}</span>`;
  oWinEl.innerHTML = `${
    isVsPlayer
      ? "O (P2)"
      : currentPlayerMark === O_CLASS
      ? "O (You)"
      : "O (CPU)"
  } <span id="o-win-inner" class="gameplay__highlight">${oWin}</span>`;
}

function setTurn() {
  const turnEl = document.getElementById("gameplay-turn");

  turnEl.innerHTML = `<svg class="gameplay__turn-icon">
<use xlink:href="./assets/images/SVG/icon-${
    oTurn ? O_CLASS : X_CLASS
  }-default.svg#icon-${oTurn ? O_CLASS : X_CLASS}-default"></use>
</svg> &nbsp; Turn`;
}

function playVsCpu() {
  if (currentPlayerMark === O_CLASS) getCpuChoice();
  // CPU starts first
  else getPlayerChoice(); // Player starts first
}

function playVsPlayer() {
  getPlayerChoice();
}

function getEmptyCells() {
  const cellsArray = Array.from(cells);

  return cellsArray.filter(
    (cell) => !cell.classList.contains("x") && !cell.classList.contains("o")
  );
}

function setCpuBestMove() {
  // Compute best move using a fast board-based minimax (returns a DOM cell)
  const board = boardFromDOM();
  const cpuMark = currentPlayerMark === O_CLASS ? X_CLASS : O_CLASS;
  const humanMark = cpuMark === X_CLASS ? O_CLASS : X_CLASS;

  const best = computeBestMoveFromBoard(board, oTurn === (cpuMark === O_CLASS), cpuMark, humanMark);
  if (best == null) return null;

  return cells[best];
}

function minimax(isCpuTurn) {
  // Legacy DOM-based minimax removed. Board-based minimax helpers are used instead.
  return 0;
}

// ---------- Board-based helpers (fast minimax with alpha-beta + memo) ----------
function boardFromDOM() {
  const b = Array(9).fill(null);
  cells.forEach((cell, idx) => {
    if (cell.classList.contains(X_CLASS)) b[idx] = X_CLASS;
    else if (cell.classList.contains(O_CLASS)) b[idx] = O_CLASS;
  });
  return b;
}

function checkWinOnBoard(board, mark) {
  return WINNING_COMBINATIONS.some((comb) => comb.every((i) => board[i] === mark));
}

function isDrawBoard(board) {
  return board.every((c) => c === X_CLASS || c === O_CLASS);
}

function boardKey(board) {
  return board.map((c) => (c ? c : '-')).join('');
}

function minimaxBoard(board, isCpuTurn, alpha, beta, cpuMark, humanMark, memo) {
  const key = boardKey(board) + (isCpuTurn ? '1' : '0');
  if (memo.has(key)) return memo.get(key);

  if (checkWinOnBoard(board, cpuMark)) return 1;
  if (checkWinOnBoard(board, humanMark)) return -1;
  if (isDrawBoard(board)) return 0;

  const emptyIndexes = board.map((v, i) => (v ? null : i)).filter((v) => v !== null);

  if (isCpuTurn) {
    let value = -Infinity;
    for (let idx of emptyIndexes) {
      board[idx] = cpuMark;
      const score = minimaxBoard(board, false, alpha, beta, cpuMark, humanMark, memo);
      board[idx] = null;
      value = Math.max(value, score);
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break; // beta cut-off
    }
    memo.set(key, value);
    return value;
  } else {
    let value = Infinity;
    for (let idx of emptyIndexes) {
      board[idx] = humanMark;
      const score = minimaxBoard(board, true, alpha, beta, cpuMark, humanMark, memo);
      board[idx] = null;
      value = Math.min(value, score);
      beta = Math.min(beta, value);
      if (alpha >= beta) break; // alpha cut-off
    }
    memo.set(key, value);
    return value;
  }
}

function computeBestMoveFromBoard(board, isCpuTurn, cpuMark, humanMark) {
  const memo = new Map();
  const emptyIndexes = board.map((v, i) => (v ? null : i)).filter((v) => v !== null);
  if (!emptyIndexes.length) return null;

  let bestIdx = null;
  if (isCpuTurn) {
    let bestScore = -Infinity;
    for (let idx of emptyIndexes) {
      board[idx] = cpuMark;
      const score = minimaxBoard(board, false, -Infinity, Infinity, cpuMark, humanMark, memo);
      board[idx] = null;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = idx;
      }
    }
  } else {
    // if it's human turn, pick move that minimizes cpu's score (best for human)
    let bestScore = Infinity;
    for (let idx of emptyIndexes) {
      board[idx] = humanMark;
      const score = minimaxBoard(board, true, -Infinity, Infinity, cpuMark, humanMark, memo);
      board[idx] = null;
      if (score < bestScore) {
        bestScore = score;
        bestIdx = idx;
      }
    }
  }

  return bestIdx;
}

function isForcedDraw(board, isCpuTurn, cpuMark, humanMark) {
  const memo = new Map();
  const result = minimaxBoard([...board], isCpuTurn, -Infinity, Infinity, cpuMark, humanMark, memo);
  return result === 0;
}

function animatePlaceMark(cell, mark, duration = 220) {
  // small pop-in animation via inline styles
  try {
    cell.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;
    cell.style.transform = 'scale(0.3)';
    cell.style.opacity = '0';
    // ensure mark is applied after a tiny tick so transition applies
    setTimeout(() => {
      cell.classList.add(mark);
      // force reflow then animate to full size
      void cell.offsetWidth;
      cell.style.transform = 'scale(1)';
      cell.style.opacity = '1';
      // cleanup inline styles after animation
      setTimeout(() => {
        cell.style.transition = '';
        cell.style.transform = '';
        cell.style.opacity = '';
      }, duration + 20);
    }, 20);
  } catch (e) {
    // fallback: just add class
    cell.classList.add(mark);
  }
}

async function getCpuChoice() {
  // Fast CPU move using board-based minimax and limited delays
  const cpuMark = currentPlayerMark === O_CLASS ? X_CLASS : O_CLASS;
  const humanMark = cpuMark === X_CLASS ? O_CLASS : X_CLASS;
  currentClass = oTurn ? O_CLASS : X_CLASS;

  gameBoardEl.classList.remove(O_CLASS);
  gameBoardEl.classList.remove(X_CLASS);

  cells.forEach((cell) => cell.removeEventListener('click', playHandler));
  changeDomLayout(opponentMessage, 'd-none', 'd-block');

  const emptyCells = getEmptyCells();
  const emptyCount = emptyCells.length;

  // Dynamically choose a short delay (faster overall)
  const baseDelay = emptyCount > 4 ? 600 : 320;

  // If only 2-3 moves left and it's a forced draw, auto-complete the remainder with an animated fill
  if (!isVsPlayer && emptyCount <= 4) {
    const board = boardFromDOM();
    const cpuTurnNow = oTurn === (cpuMark === O_CLASS);
    if (isForcedDraw(board, cpuTurnNow, cpuMark, humanMark)) {
      // compute sequence of best moves for both sides to reach the draw
      const sequence = [];
      const simBoard = [...board];
      let simCpuTurn = cpuTurnNow;
      while (simBoard.some((c) => c === null)) {
        const idx = computeBestMoveFromBoard(simBoard, simCpuTurn, cpuMark, humanMark);
        if (idx == null) break;
        sequence.push({ idx, mark: simCpuTurn ? cpuMark : humanMark });
        simBoard[idx] = simCpuTurn ? cpuMark : humanMark;
        simCpuTurn = !simCpuTurn;
      }

      // animate placements sequentially
      for (let i = 0; i < sequence.length; i++) {
        const { idx, mark } = sequence[i];
        await new Promise((resolve) => {
          setTimeout(() => {
            animatePlaceMark(cells[idx], mark, 220);
            resolve();
          }, i * 300 + baseDelay);
        });
      }

      // hide opponent message and finalize
      changeDomLayout(opponentMessage, 'd-block', 'd-none');
      // small pause before showing modal
      setTimeout(() => {
        setGameLogic();
        // ensure a tie is declared if no winner
        if (!checkWin(currentClass) && isDraw()) endGame(true);
      }, 260);

      return;
    }
  }

  // Normal single CPU move with shorter delay
  await new Promise((resolve) => {
    setTimeout(() => {
      const bestCell = setCpuBestMove();
      if (bestCell) placeMark(bestCell, currentClass);
      changeDomLayout(opponentMessage, 'd-block', 'd-none');
      setGameLogic();
      resolve('resolved');
    }, baseDelay);
  });

  getPlayerChoice();
}

function getPlayerChoice() {
  cells.forEach((cell) => {
    if (!cell.classList.contains("x") && !cell.classList.contains("o")) {
      cell.addEventListener("click", playHandler, { once: true });
    }
  });
}

function placeMark(cell, mark) {
  cell.classList.add(mark);
}

function setGameLogic() {
  if (checkWin(currentClass)) {
    endGame(false);
  } else if (isDraw()) {
    endGame(true);
  } else {
    swapTurns();
    setBoardHoverClass();
  }
}

function playHandler(event) {
  const cell = event.target;
  currentClass = oTurn ? O_CLASS : X_CLASS;

  placeMark(cell, currentClass);
  setGameLogic();

  if (!isVsPlayer && !checkWin(currentClass) && !isDraw()) getCpuChoice();
}

function checkWin(currentClass) {
  return WINNING_COMBINATIONS.some((combination) => {
    return combination.every((element, index, array) => {
      let condition = cells[element].classList.contains(currentClass);
      if (condition) winningArry = array;
      return condition;
    });
  });
}

function isDraw() {
  return [...cells].every((cell) => {
    return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS);
  });
}

function configureModalButtons() {
  const nextRoundBtn = document.getElementById("next-round");
  const quitBtn = document.getElementById("quit");

  nextRoundBtn.addEventListener("click", setNextRound);
  quitBtn.addEventListener("click", () => {
    location.reload();
  });
}

function endGame(draw) {
  const tieInnerEl = document.getElementById("tie-inner");

  if (draw) {
    tie++;
    tieInnerEl.innerText = tie;

    changeDomLayout(backdropEl, "d-none", "d-block");
    changeDomLayout(modalEl, "d-none", "d-block");

    modalEl.innerHTML = `
		<h4 class="heading-lg">Round Tied</h4>

		<div class="modal__buttons">
			<button id="quit" class="btn btn--silver-small btn--small">Quit</button>
			<button id="next-round" class="btn btn--yellow-small btn--small">Next Round</button>
		</div>
		`;
  } else {
    setWinner(oTurn);
  }

  configureModalButtons();
}

function swapTurns() {
  oTurn = !oTurn;
  setTurn();
}

function setWinner() {
  const xWinInnerEl = document.getElementById("x-win-inner");
  const oWinInnerEl = document.getElementById("o-win-inner");

  if (oTurn) oWin++;
  else xWin++;

  xWinInnerEl.innerText = xWin;
  oWinInnerEl.innerText = oWin;

  winningArry.forEach((index) => {
    cells[index].classList.add("win");
  });

  setTimeout(() => {
    changeDomLayout(backdropEl, "d-none", "d-block");
    changeDomLayout(modalEl, "d-none", "d-block");
  }, 500);

  modalEl.innerHTML = `<h4 class="heading-xs">${
    isVsPlayer
      ? oTurn
        ? "Player 2 Win"
        : "Player 1 win"
      : oTurn && currentPlayerMark === "o"
      ? "You won"
      : !oTurn && currentPlayerMark === "x"
      ? "You won"
      : "oh No, you lost..."
  }</h4>
	<div class="modal__result">
		<svg class="modal__icon">
			<use xlink:href="./assets/images/SVG/icon-${
        oTurn ? O_CLASS : X_CLASS
      }.svg#icon-${oTurn ? O_CLASS : X_CLASS}"></use>
		</svg>
		<h1 class="heading-lg heading-lg--${
      oTurn ? "yellow" : "blue"
    }">takes the round</h1>
	</div>

	<div class="modal__buttons">
		<button id="quit" class="btn btn--silver-small btn--small">Quit</button>
		<button id="next-round" class="btn btn--yellow-small btn--small">Next Round</button>
	</div>`;
}

function setNextRound() {
  oTurn = false;

  changeDomLayout(modalEl, "d-block", "d-none");
  changeDomLayout(backdropEl, "d-block", "d-none");

  cells.forEach((cell) => {
    cell.classList.remove(X_CLASS);
    cell.classList.remove(O_CLASS);
    cell.classList.remove("win");
    cell.removeEventListener("click", playHandler);
  });

  startGame();
}

function restartHandler() {
  modalEl.innerHTML = `<h1 class="heading-lg">Restart Game</h1>

	<div class="modal__buttons">
		<button id="btn-cancel" class="btn btn--silver-small btn--small">
			No, Cancel
		</button>
		<button id="btn-restart" class="btn btn--yellow-small btn--small">
			Yes, Restart
		</button>
	</div>`;

  const restartBtn = document.getElementById("btn-restart");
  const cancelBtn = document.getElementById("btn-cancel");

  changeDomLayout(modalEl, "d-none", "d-block");

  restartBtn.addEventListener("click", setNextRound);
  cancelBtn.addEventListener("click", () => {
    changeDomLayout(modalEl, "d-block", "d-none");
  });
}

function getUserChoiceHandler() {
  currentPlayerMark = this.id;

  this.classList.add("selected");

  if (this.nextElementSibling)
    this.nextElementSibling.classList.remove("selected");
  else this.previousElementSibling.classList.remove("selected");
}

gameMarksEl.forEach((mark) => {
  mark.addEventListener("click", getUserChoiceHandler);
});

restartBtn.addEventListener("click", restartHandler);
vsCpuBtn.addEventListener("click", setGameModeHandler);
vsPlayerBtn.addEventListener("click", setGameModeHandler);
