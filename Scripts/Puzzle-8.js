class OptimizedPuzzle8 {
  constructor() {
    this.board = document.getElementById("puzzle-board");
    this.statusEl = document.getElementById("game-status");
    this.tiles = [1, 2, 3, 4, 5, 6, 7, 8, null]; // estado inicial ordenado
    this.goal = [1, 2, 3, 4, 5, 6, 7, 8, null];
    this.isAnimating = false;
    this.moveCount = 0;
    this.isUserMode = false;

    this.moveSound = new Audio("/Sounds/Menusound1.mp3");
    this.moveSound.preload = "auto"
    
    this.initializeEvents();
    this.render();
  }

  // Renderizar con optimización - solo actualiza tiles que cambiaron
  render() {
    if (this.board.children.length === 0) {
      // Primera renderización - crear elementos DOM
      for (let i = 0; i < 9; i++) {
        const div = document.createElement("div");
        div.classList.add("tile");
        div.dataset.index = i;
        this.board.appendChild(div);
      }
    }

    // Actualizar contenido de tiles existentes
    Array.from(this.board.children).forEach((tile, index) => {
      const value = this.tiles[index];
      tile.className = "tile" + (value === null ? " empty" : "");
      tile.textContent = value || "";
      
      if (value !== null && !this.isAnimating) {
        tile.onclick = () => this.moveTile(index);
      } else {
        tile.onclick = null;
      }
    });

    this.updateStatus();
    this.checkWin();
  }

  // Mover ficha (optimizado con validación directa)
  moveTile(index) {
    const emptyIndex = this.tiles.indexOf(null);

    if (this.isValidMove(index, emptyIndex)) {
      [this.tiles[emptyIndex], this.tiles[index]] = [this.tiles[index], this.tiles[emptyIndex]];
      this.moveCount++;

      // reproducir sonido al mover ficha
      this.moveSound.currentTime = 0;
      this.moveSound.play().catch(err => console.log("Error al reproducir sonido:", err));

      this.render();
      return true;
    }
    return false;
  }

  // Validación optimizada usando coordenadas
  isValidMove(index, emptyIndex) {
    const row1 = Math.floor(index / 3);
    const col1 = index % 3;
    const row2 = Math.floor(emptyIndex / 3);
    const col2 = emptyIndex % 3;
    
    // Solo movimientos adyacentes (distancia Manhattan = 1)
    return (Math.abs(row1 - row2) + Math.abs(col1 - col2)) === 1;
  }

  // Desordenar optimizado - genera estados resolubles
  shuffle() {
    this.isAnimating = true;
    this.moveCount = 0;
    this.isUserMode = true;
    
    // Comenzar desde estado resuelto y hacer movimientos aleatorios válidos
    this.tiles = [...this.goal];
    
    // Hacer 1000 movimientos aleatorios válidos para garantizar resolubilidad
    for (let i = 0; i < 1000; i++) {
      const emptyIndex = this.tiles.indexOf(null);
      const moves = this.getValidMoves(emptyIndex);
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      [this.tiles[emptyIndex], this.tiles[randomMove]] = [this.tiles[randomMove], this.tiles[emptyIndex]];
    }
    
    this.isAnimating = false;
    this.render();
  }

  // Obtener movimientos válidos desde posición del espacio vacío
  getValidMoves(emptyIndex) {
    const moves = [];
    const row = Math.floor(emptyIndex / 3);
    const col = emptyIndex % 3;
    
    if (row > 0) moves.push(emptyIndex - 3); // arriba
    if (row < 2) moves.push(emptyIndex + 3); // abajo
    if (col > 0) moves.push(emptyIndex - 1); // izquierda
    if (col < 2) moves.push(emptyIndex + 1); // derecha
    
    return moves;
  }

  // Heurística Manhattan para A*
  manhattanDistance(state) {
    let distance = 0;
    for (let i = 0; i < 9; i++) {
      if (state[i] !== null) {
        const currentRow = Math.floor(i / 3);
        const currentCol = i % 3;
        const targetIndex = state[i] - 1; // posición objetivo (1-8 -> 0-7)
        const targetRow = Math.floor(targetIndex / 3);
        const targetCol = targetIndex % 3;
        distance += Math.abs(currentRow - targetRow) + Math.abs(currentCol - targetCol);
      }
    }
    return distance;
  }

  // Resolver con A* optimizado
  async solveAI() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.isUserMode = false;
    this.statusEl.textContent = "🤖 Analizando puzzle...";
    this.board.classList.add('solving');
    
    const solution = await this.aStar();
    
    if (solution) {
      await this.animateSolution(solution);
    } else {
      this.statusEl.textContent = "❌ No se encontró solución en tiempo razonable";
      this.isAnimating = false;
      this.board.classList.remove('solving');
    }
  }

  // Algoritmo A* para encontrar solución óptima
  async aStar() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const openList = [{
          state: [...this.tiles],
          path: [],
          g: 0, // costo desde inicio
          h: this.manhattanDistance(this.tiles), // heurística
          f: 0 + this.manhattanDistance(this.tiles) // f = g + h
        }];
        
        const closedSet = new Set();
        let iterations = 0;
        const maxIterations = 15000; // límite para evitar lag
        
        while (openList.length > 0 && iterations < maxIterations) {
          iterations++;
          
          // Ordenar por f (costo total estimado) y tomar el mejor
          openList.sort((a, b) => a.f - b.f);
          const current = openList.shift();
          
          const stateKey = current.state.join(',');
          if (closedSet.has(stateKey)) continue;
          closedSet.add(stateKey);
          
          // ¿Hemos llegado al estado objetivo?
          if (current.state.join(',') === this.goal.join(',')) {
            resolve(current.path);
            return;
          }
          
          // Limitar profundidad para puzzles muy complejos
          if (current.g > 30) continue;
          
          const emptyIndex = current.state.indexOf(null);
          const moves = this.getValidMoves(emptyIndex);
          
          for (const move of moves) {
            const newState = [...current.state];
            [newState[emptyIndex], newState[move]] = [newState[move], newState[emptyIndex]];
            
            const newStateKey = newState.join(',');
            if (closedSet.has(newStateKey)) continue;
            
            const g = current.g + 1;
            const h = this.manhattanDistance(newState);
            
            openList.push({
              state: newState,
              path: [...current.path, newState],
              g: g,
              h: h,
              f: g + h
            });
          }
        }
        
        resolve(null); // No se encontró solución
      }, 10);
    });
  }

  // Animar la solución paso a paso
  async animateSolution(path) {
    this.statusEl.textContent = `🤖 Resolviendo... (${path.length} pasos)`;
    
    for (let i = 0; i < path.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      this.tiles = [...path[i]];
      this.render();
      this.statusEl.textContent = `🤖 Resolviendo... ${i + 1}/${path.length}`;
    }
    
    this.isAnimating = false;
    this.board.classList.remove('solving');
    this.statusEl.textContent = `¡Resuelto por A* en ${path.length} movimientos óptimos!`;
  }

  // Verificar si ganó
  checkWin() {
    const isWon = this.tiles.join(',') === this.goal.join(',');
    
    if (isWon && (this.moveCount > 0 || !this.isUserMode)) {
      this.board.classList.add('winner');
      document.body.classList.add('solved');
      
      if (this.isUserMode && this.moveCount > 0) {
        this.statusEl.textContent = `🎉 ¡Excelente! Resuelto en ${this.moveCount} movimientos`;
      }
    } else {
      this.board.classList.remove('winner');
      document.body.classList.remove('solved');
    }
    
    return isWon;
  }

  // Actualizar estado del juego
  updateStatus() {
    if (this.checkWin()) return;
    
    if (this.moveCount === 0 && this.isUserMode) {
      this.statusEl.textContent = "¡Mueve las fichas para resolver el puzzle!";
    } else if (this.moveCount === 0) {
      this.statusEl.textContent = "¡Haz clic en desordenar para empezar!";
    } else {
      this.statusEl.textContent = `Movimientos: ${this.moveCount}`;
    }
  }

  // Modo usuario (habilita interacción manual)
  userMode() {
    if (this.isAnimating) return;
    this.isUserMode = true;
    this.statusEl.textContent = "Modo usuario activado. ¡Resuelve el puzzle!";
  }

  // Reiniciar juego
  reset() {
    this.tiles = [...this.goal];
    this.moveCount = 0;
    this.isAnimating = false;
    this.isUserMode = false;
    this.board.classList.remove('winner', 'solving');
    document.body.classList.remove('solved');
    this.render();
  }

  // Inicializar eventos
  initializeEvents() {
    document.getElementById("shuffle").addEventListener("click", () => this.shuffle());
    document.getElementById("ai-mode").addEventListener("click", () => this.solveAI());
    document.getElementById("user-mode").addEventListener("click", () => this.userMode());
    document.getElementById("reset").addEventListener("click", () => this.reset());
  }
}

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
  const puzzle = new OptimizedPuzzle8();
});