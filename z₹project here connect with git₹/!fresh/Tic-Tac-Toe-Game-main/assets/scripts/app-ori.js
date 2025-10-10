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

  xWinEl.innerHTML = `${isVsPlayer
    ? "X (P1)"
    : currentPlayerMark === O_CLASS
      ? "X (CPU)"
      : "X (You)"
    } <span id="x-win-inner" class="gameplay__highlight">${xWin}</span>`;
  tieEl.innerHTML = `Ties <span id="tie-inner" class="gameplay__highlight">${tie}</span>`;
  oWinEl.innerHTML = `${isVsPlayer
    ? "O (P2)"
    : currentPlayerMark === O_CLASS
      ? "O (You)"
      : "O (CPU)"
    } <span id="o-win-inner" class="gameplay__highlight">${oWin}</span>`;
}

function setTurn() {
  const turnEl = document.getElementById("gameplay-turn");

  turnEl.innerHTML = `<svg class="gameplay__turn-icon">
<use xlink:href="./assets/images/SVG/icon-${oTurn ? O_CLASS : X_CLASS
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
  const cpuMark = getCpuMark();
  const playerMark = getPlayerMark();
  const emptyCells = getEmptyCells();

  // 1. Win: If CPU can win, do it
  for (let cell of emptyCells) {
    cell.classList.add(cpuMark);
    if (checkWin(cpuMark)) {
      cell.classList.remove(cpuMark);
      return cell;
    }
    cell.classList.remove(cpuMark);
  }

  // 2. Block: If player can win, block it
  for (let cell of emptyCells) {
    cell.classList.add(playerMark);
    if (checkWin(playerMark)) {
      cell.classList.remove(playerMark);
      return cell;
    }
    cell.classList.remove(playerMark);
  }

  // 3. Fork: Create a fork if possible
  for (let cell of emptyCells) {
    cell.classList.add(cpuMark);
    if (countForks(cpuMark) >= 2) {
      cell.classList.remove(cpuMark);
      return cell;
    }
    cell.classList.remove(cpuMark);
  }

  // 4. Block opponent's fork
  for (let cell of emptyCells) {
    cell.classList.add(playerMark);
    if (countForks(playerMark) >= 2) {
      cell.classList.remove(playerMark);
      return cell;
    }
    cell.classList.remove(playerMark);
  }

  // 5. Play center if available
  if (!cells[4].classList.contains(X_CLASS) && !cells[4].classList.contains(O_CLASS)) {
    return cells[4];
  }

  // 6. Play opposite corner
  const corners = [0, 2, 6, 8];
  for (let i = 0; i < corners.length; i++) {
    const opp = 8 - corners[i];
    if (
      cells[corners[i]].classList.contains(playerMark) &&
      !cells[opp].classList.contains(X_CLASS) &&
      !cells[opp].classList.contains(O_CLASS)
    ) {
      return cells[opp];
    }
  }

  // 7. Play empty corner
  for (let i of corners) {
    if (!cells[i].classList.contains(X_CLASS) && !cells[i].classList.contains(O_CLASS)) {
      return cells[i];
    }
  }

  // 8. Play empty side
  const sides = [1, 3, 5, 7];
  for (let i of sides) {
    if (!cells[i].classList.contains(X_CLASS) && !cells[i].classList.contains(O_CLASS)) {
      return cells[i];
    }
  }

  // 9. Minimax fallback (should never reach here if above logic is perfect)
  let bestScore = -Infinity;
  let bestCells = [];
  emptyCells.forEach((cell) => {
    cell.classList.add(cpuMark);
    let score = minimax(false, 0);
    cell.classList.remove(cpuMark);
    if (score > bestScore) {
      bestScore = score;
      bestCells = [cell];
    } else if (score === bestScore) {
      bestCells.push(cell);
    }
  });
  return pickPriorityCell(bestCells);
}

function countForks(mark) {
  let forks = 0;
  const emptyCells = getEmptyCells();
  for (let cell of emptyCells) {
    cell.classList.add(mark);
    let winCount = 0;
    for (let combo of WINNING_COMBINATIONS) {
      if (combo.filter(i => cells[i].classList.contains(mark)).length === 2 &&
        combo.filter(i => !cells[i].classList.contains(X_CLASS) && !cells[i].classList.contains(O_CLASS)).length === 1) {
        winCount++;
      }
    }
    if (winCount >= 2) forks++;
    cell.classList.remove(mark);
  }
  return forks;
}

function getCpuMark() {
  // CPU is O if currentPlayerMark is O, else X
  return currentPlayerMark;
}

function getPlayerMark() {
  return currentPlayerMark === O_CLASS ? X_CLASS : O_CLASS;
}

function minimax(isCpuTurn, depth) {
  if (checkWin(getCpuMark())) return 10 - depth;
  if (checkWin(getPlayerMark())) return depth - 10;
  if (isDraw()) return 0;

  const emptyCells = getEmptyCells();
  if (isCpuTurn) {
    let maxEval = -Infinity;
    for (let cell of emptyCells) {
      cell.classList.add(getCpuMark());
      let eval = minimax(false, depth + 1);
      cell.classList.remove(getCpuMark());
      maxEval = Math.max(maxEval, eval);
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let cell of emptyCells) {
      cell.classList.add(getPlayerMark());
      let eval = minimax(true, depth + 1);
      cell.classList.remove(getPlayerMark());
      minEval = Math.min(minEval, eval);
    }
    return minEval;
  }
}

function pickPriorityCell(cellsArr) {
  // Center
  const center = cells[4];
  if (cellsArr.includes(center)) return center;
  // Corners
  const corners = [cells[0], cells[2], cells[6], cells[8]];
  for (let c of corners) {
    if (cellsArr.includes(c)) return c;
  }
  // Otherwise, return any
  return cellsArr[0];
}

async function getCpuChoice() {
  currentClass = oTurn ? O_CLASS : X_CLASS;

  gameBoardEl.classList.remove(O_CLASS);
  gameBoardEl.classList.remove(X_CLASS);

  cells.forEach((cell) => cell.removeEventListener("click", playHandler));

  changeDomLayout(opponentMessage, "d-none", "d-block");

  await new Promise((resolve) => {
    setTimeout(() => {
      placeMark(setCpuBestMove(), currentClass);
      changeDomLayout(opponentMessage, "d-block", "d-none");
      setGameLogic();
      resolve("resolved");
    }, 2000);
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

  modalEl.innerHTML = `<h4 class="heading-xs">${isVsPlayer
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
			<use xlink:href="./assets/images/SVG/icon-${oTurn ? O_CLASS : X_CLASS
    }.svg#icon-${oTurn ? O_CLASS : X_CLASS}"></use>
		</svg>
		<h1 class="heading-lg heading-lg--${oTurn ? "yellow" : "blue"
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
