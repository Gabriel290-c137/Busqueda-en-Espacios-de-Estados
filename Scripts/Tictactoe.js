(() => {
  // ====== CONFIGURACIÓN DE ROLES Y MODOS ======
  const X = 'X';           // humano e iaMin
  const O = 'O';           // iaMax
  const roles = Object.freeze({ player: X, iaMin: X, iaMax: O });
  const MODES = Object.freeze({ NONE: 0, HUMAN_VS_IA: 1, IA_VS_IA: 2 });

  // ====== ESTADO ======
  let mode = MODES.NONE;
  let board = Array(9).fill('');
  let current = X;           // X inicia por defecto
  let gameOver = false;
  let aiLoopToken = { stop: false }; // para cancelar IA vs IA
  let inputLocked = false;           // bloquea clicks mientras piensa la IA

  // ====== UI ======
  const cells = Array.from(document.querySelectorAll('.cell'));
  const resultDiv = document.getElementById('result');
  const startBtn = document.getElementById('startBtn');
  const autoBtn = document.getElementById('autoBtn');
  const resetBtn = document.getElementById('resetBtn');
  const menuBtn = document.getElementById('menuBtn');

  // ====== UTILIDADES ======
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const emptyIndices = (b) => b.reduce((acc, v, i) => (v === '' ? (acc.push(i), acc) : acc), []);

  function setMessage(msg) {
    resultDiv.textContent = msg;
    if (!msg) resultDiv.classList.add('hidden');
    else resultDiv.classList.remove('hidden');
  }

  function paintBoard() {
    for (let i = 0; i < 9; i++) {
      cells[i].textContent = board[i];
      cells[i].classList.toggle('taken', board[i] !== '');
    }
  }

  function resetGame() {
    aiLoopToken.stop = true;
    aiLoopToken = { stop: false };
    board = Array(9).fill('');
    current = X;
    gameOver = false;
    inputLocked = false;
    mode = MODES.NONE;
    setMessage('');
    paintBoard();
  }

  function place(i, symbol) {
    board[i] = symbol;
    cells[i].textContent = symbol;
    cells[i].classList.add('taken');
    current = (symbol === X) ? O : X;
  }

  function endGame(winner) {
    gameOver = true;
    let message = "";

    if (winner === "tie") {
      message = "¡Empate!";
    } else {
      // Si estamos en el modo de juego 1 (Jugador vs IA) y ganó O
      if (mode === 1 && winner === "O") {
        message = "¡Ganó la IA!";
      } else {
        message = `¡Ganó ${winner}!`;
      }
    }

    setMessage(message);
  }

  // ====== REGLAS ======
  const WIN_LINES = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  function checkWinnerOn(b) {
    for (const [a, c, d] of WIN_LINES) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    }
    if (b.every(v => v !== '')) return 'tie';
    return null;
  }

  // ====== MINIMAX ======
  function score(winner, depth) {
    if (winner === O) return 10 - depth;
    if (winner === X) return depth - 10;
    return 0;
  }

  function minimax(b, isMaximizing, depth) {
    const w = checkWinnerOn(b);
    if (w !== null) return score(w, depth);

    if (isMaximizing) {
      let best = -Infinity;
      for (const i of emptyIndices(b)) {
        b[i] = O;
        const val = minimax(b, false, depth + 1);
        b[i] = '';
        if (val > best) best = val;
      }
      return best;
    } else {
      let best = Infinity;
      for (const i of emptyIndices(b)) {
        b[i] = X;
        const val = minimax(b, true, depth + 1);
        b[i] = '';
        if (val < best) best = val;
      }
      return best;
    }
  }

  function bestMoveForMax(b) {
    let best = -Infinity, move = null;
    for (const i of emptyIndices(b)) {
      b[i] = O;
      const val = minimax(b, false, 0);
      b[i] = '';
      if (val > best) { best = val; move = i; }
    }
    return move;
  }

  function bestMoveForMin(b) {
    let best = Infinity, move = null;
    for (const i of emptyIndices(b)) {
      b[i] = X;
      const val = minimax(b, true, 0);
      b[i] = '';
      if (val < best) { best = val; move = i; }
    }
    return move;
  }

  // ====== HUMAN vs IA ======
  function startHumanVsIA() {
    resetGame();
    mode = MODES.HUMAN_VS_IA;
    setMessage('Tu eres X. ¡Empiezas!');
  }

  cells.forEach(cell => {
    cell.addEventListener('click', (e) => {
      if (mode !== MODES.HUMAN_VS_IA || gameOver || inputLocked) return;
      const idx = Number(e.currentTarget.dataset.index);
      if (board[idx] !== '' || current !== roles.player) return;

      place(idx, X);
      const w1 = checkWinnerOn(board);
      if (w1 !== null) { endGame(w1); return; }

      inputLocked = true;
      setTimeout(() => {
        const aiIdx = bestMoveForMax(board);
        if (aiIdx !== null && !gameOver) {
          place(aiIdx, O);
          const w2 = checkWinnerOn(board);
          if (w2 !== null) endGame(w2);
        }
        inputLocked = false;
      }, 200);
    });
  });

  // ====== IA vs IA ======
  async function startAIVsAI() {
    resetGame();
    mode = MODES.IA_VS_IA;
    setMessage('IA vs IA');
    const token = aiLoopToken;
    while (!token.stop && !gameOver) {
      await sleep(350);
      const idx = current === X ? bestMoveForMin(board) : bestMoveForMax(board);
      if (idx == null) break;
      place(idx, current);
      const w = checkWinnerOn(board);
      if (w !== null) { endGame(w); break; }
    }
  }

  // ====== BOTONES ======
  startBtn.addEventListener('click', startHumanVsIA);
  autoBtn.addEventListener('click', startAIVsAI);
  resetBtn.addEventListener('click', resetGame);
  menuBtn.addEventListener('click', () => {
    resetGame();
    if (history.length > 1) history.back();
  });

  resetGame();
})();
