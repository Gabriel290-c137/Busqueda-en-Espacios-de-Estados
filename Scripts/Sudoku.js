// Sudoku.js - Implementación de algoritmos PSSR (Problem Solving by Search and Reasoning)

class SudokuPSSR {
    constructor() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.originalGrid = Array(9).fill().map(() => Array(9).fill(0));
        this.solutionGrid = Array(9).fill().map(() => Array(9).fill(0));
        this.algoritmoActual = null;
        this.animacionEnCurso = false;
        this.velocidadAnimacion = 100;
        this.dificultadActual = 'facil';
        
        // Estadísticas
        this.pasos = 0;
        this.backtracks = 0;
        this.tiempoInicio = 0;
        
        this.inicializar();
        this.configurarEventos();
    }
    
    inicializar() {
        this.crearGrid();
        this.generarSudokuCompleto();
        this.crearProblema('facil');
        this.dibujarGrid();
    }
    
    crearGrid() {
        const container = document.getElementById('sudoku-grid');
        container.innerHTML = '';
        
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            cell.dataset.index = i;
            cell.addEventListener('click', () => this.editarCelda(i));
            container.appendChild(cell);
        }
    }
    
    // Generar un Sudoku completo válido
    generarSudokuCompleto() {
        // Limpiar grid
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        
        // Llenar la diagonal principal (cuadros 0, 4, 8)
        this.llenarDiagonal();
        
        // Resolver el resto usando backtracking
        this.resolverSudoku(this.grid);
        
        // Guardar la solución completa
        this.solutionGrid = this.grid.map(row => [...row]);
    }
    
    llenarDiagonal() {
        for (let i = 0; i < 9; i += 3) {
            this.llenarCuadro(i, i);
        }
    }
    
    llenarCuadro(fila, col) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.mezclarArray(nums);
        
        let idx = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.grid[fila + i][col + j] = nums[idx++];
            }
        }
    }
    
    mezclarArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    crearProblema(dificultad) {
        // Empezar con la solución completa
        this.grid = this.solutionGrid.map(row => [...row]);
        
        // Determinar cuántas celdas remover según la dificultad
        const celdasARemover = {
            'facil': 35,
            'medio': 45,
            'dificil': 55,
            'experto': 65
        };
        
        const remover = celdasARemover[dificultad] || 35;
        
        // Remover celdas aleatoriamente
        let removidas = 0;
        while (removidas < remover) {
            const fila = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            
            if (this.grid[fila][col] !== 0) {
                this.grid[fila][col] = 0;
                removidas++;
            }
        }
        
        // Guardar el estado original
        this.originalGrid = this.grid.map(row => [...row]);
    }
    
    dibujarGrid() {
        const cells = document.querySelectorAll('.sudoku-cell');
        
        cells.forEach((cell, index) => {
            const fila = Math.floor(index / 9);
            const col = index % 9;
            const valor = this.grid[fila][col];
            
            cell.textContent = valor === 0 ? '' : valor;
            cell.className = 'sudoku-cell';
            
            if (this.originalGrid[fila][col] !== 0) {
                cell.classList.add('inicial');
            }
        });
    }
    
    editarCelda(index) {
        if (this.animacionEnCurso) return;
        
        const fila = Math.floor(index / 9);
        const col = index % 9;
        
        // No permitir editar celdas iniciales
        if (this.originalGrid[fila][col] !== 0) return;
        
        const valor = prompt('Ingresa un número (1-9) o 0 para borrar:', this.grid[fila][col] || '');
        
        if (valor !== null) {
            const num = parseInt(valor);
            if (num >= 0 && num <= 9) {
                this.grid[fila][col] = num;
                this.dibujarGrid();
                this.validarCelda(fila, col);
            }
        }
    }
    
    validarCelda(fila, col) {
        const cell = document.querySelector(`[data-index="${fila * 9 + col}"]`);
        const valor = this.grid[fila][col];
        
        if (valor === 0) return;
        
        if (!this.esValido(this.grid, fila, col, valor)) {
            cell.classList.add('error');
            setTimeout(() => cell.classList.remove('error'), 1000);
        }
    }
    
    // Algoritmo 1: Backtracking básico
    async backtrackingBasico() {
        this.reiniciarEstadisticas();
        this.tiempoInicio = Date.now();
        
        const exito = await this.resolverConBacktracking(this.grid, 0, 0);
        
        const tiempo = Date.now() - this.tiempoInicio;
        this.actualizarEstadisticas(tiempo);
        
        if (exito) {
            this.mostrarExito();
        } else {
            alert('No se pudo resolver el Sudoku');
        }
    }
    
    async resolverConBacktracking(grid, fila, col) {
        // Si llegamos al final, hemos resuelto el Sudoku
        if (fila === 9) return true;
        
        // Calcular próxima posición
        const [nextFila, nextCol] = col === 8 ? [fila + 1, 0] : [fila, col + 1];
        
        // Si la celda ya tiene valor, continuar
        if (grid[fila][col] !== 0) {
            return await this.resolverConBacktracking(grid, nextFila, nextCol);
        }
        
        // Probar números del 1 al 9
        for (let num = 1; num <= 9; num++) {
            if (this.esValido(grid, fila, col, num)) {
                grid[fila][col] = num;
                this.pasos++;
                
                // Animación
                await this.animarCelda(fila, col, 'procesando');
                this.actualizarEstadisticas();
                await this.esperar(this.velocidadAnimacion);
                
                if (await this.resolverConBacktracking(grid, nextFila, nextCol)) {
                    await this.animarCelda(fila, col, 'solucion');
                    return true;
                }
                
                // Backtrack
                grid[fila][col] = 0;
                this.backtracks++;
                await this.animarCelda(fila, col, 'error');
                await this.esperar(this.velocidadAnimacion);
            }
        }
        
        return false;
    }
    
    // Algoritmo 2: Forward Checking
    async forwardChecking() {
        this.reiniciarEstadisticas();
        this.tiempoInicio = Date.now();
        
        // Crear dominios para cada celda vacía
        const dominios = this.inicializarDominios();
        
        const exito = await this.resolverConForwardChecking(this.grid, dominios);
        
        const tiempo = Date.now() - this.tiempoInicio;
        this.actualizarEstadisticas(tiempo);
        
        if (exito) {
            this.mostrarExito();
        } else {
            alert('No se pudo resolver el Sudoku');
        }
    }
    
    inicializarDominios() {
        const dominios = Array(9).fill().map(() => Array(9).fill().map(() => new Set()));
        
        for (let fila = 0; fila < 9; fila++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[fila][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (this.esValido(this.grid, fila, col, num)) {
                            dominios[fila][col].add(num);
                        }
                    }
                }
            }
        }
        
        return dominios;
    }
    
    async resolverConForwardChecking(grid, dominios) {
        // Encontrar celda vacía con menor dominio (MRV - Most Restrictive Variable)
        let mejorCelda = this.encontrarCeldaMRV(grid, dominios);
        
        if (!mejorCelda) return true; // Todas las celdas están llenas
        
        const [fila, col] = mejorCelda;
        const valoresPosibles = [...dominios[fila][col]];
        
        for (const num of valoresPosibles) {
            grid[fila][col] = num;
            this.pasos++;
            
            // Animación
            await this.animarCelda(fila, col, 'procesando');
            this.actualizarEstadisticas();
            await this.esperar(this.velocidadAnimacion);
            
            // Actualizar dominios (Forward Checking)
            const dominiosBackup = this.copiarDominios(dominios);
            const consistente = this.actualizarDominios(dominios, fila, col, num);
            
            if (consistente && await this.resolverConForwardChecking(grid, dominios)) {
                await this.animarCelda(fila, col, 'solucion');
                return true;
            }
            
            // Backtrack
            grid[fila][col] = 0;
            this.backtracks++;
            this.restaurarDominios(dominios, dominiosBackup);
            await this.animarCelda(fila, col, 'error');
            await this.esperar(this.velocidadAnimacion);
        }
        
        return false;
    }
    
    encontrarCeldaMRV(grid, dominios) {
        let mejorCelda = null;
        let menorDominio = 10;
        
        for (let fila = 0; fila < 9; fila++) {
            for (let col = 0; col < 9; col++) {
                if (grid[fila][col] === 0) {
                    const tamañoDominio = dominios[fila][col].size;
                    if (tamañoDominio < menorDominio) {
                        menorDominio = tamañoDominio;
                        mejorCelda = [fila, col];
                    }
                }
            }
        }
        
        return mejorCelda;
    }
    
    actualizarDominios(dominios, fila, col, valor) {
        // Remover valor de dominios en la misma fila, columna y cuadro 3x3
        for (let i = 0; i < 9; i++) {
            // Fila
            if (i !== col && dominios[fila][i].has(valor)) {
                dominios[fila][i].delete(valor);
                if (this.grid[fila][i] === 0 && dominios[fila][i].size === 0) {
                    return false; // Inconsistencia
                }
            }
            
            // Columna
            if (i !== fila && dominios[i][col].has(valor)) {
                dominios[i][col].delete(valor);
                if (this.grid[i][col] === 0 && dominios[i][col].size === 0) {
                    return false; // Inconsistencia
                }
            }
        }
        
        // Cuadro 3x3
        const startFila = Math.floor(fila / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        
        for (let i = startFila; i < startFila + 3; i++) {
            for (let j = startCol; j < startCol + 3; j++) {
                if ((i !== fila || j !== col) && dominios[i][j].has(valor)) {
                    dominios[i][j].delete(valor);
                    if (this.grid[i][j] === 0 && dominios[i][j].size === 0) {
                        return false; // Inconsistencia
                    }
                }
            }
        }
        
        return true;
    }
    
    copiarDominios(dominios) {
        return dominios.map(fila => fila.map(celda => new Set(celda)));
    }
    
    restaurarDominios(dominios, backup) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                dominios[i][j] = new Set(backup[i][j]);
            }
        }
    }
    
    // Algoritmo 3: Arc Consistency (AC-3)
    async arcConsistency() {
        this.reiniciarEstadisticas();
        this.tiempoInicio = Date.now();
        
        const dominios = this.inicializarDominios();
        
        // Aplicar AC-3 primero
        await this.aplicarAC3(dominios);
        
        const exito = await this.resolverConAC3(this.grid, dominios);
        
        const tiempo = Date.now() - this.tiempoInicio;
        this.actualizarEstadisticas(tiempo);
        
        if (exito) {
            this.mostrarExito();
        } else {
            alert('No se pudo resolver el Sudoku');
        }
    }
    
    async aplicarAC3(dominios) {
        const cola = [];
        
        // Inicializar cola con todos los arcos
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.grid[i][j] === 0) {
                    // Agregar arcos con celdas relacionadas
                    const relacionadas = this.obtenerCeldasRelacionadas(i, j);
                    for (const [fi, co] of relacionadas) {
                        cola.push([[i, j], [fi, co]]);
                    }
                }
            }
        }
        
        while (cola.length > 0) {
            const [celda1, celda2] = cola.shift();
            
            if (await this.revisar(dominios, celda1, celda2)) {
                if (dominios[celda1[0]][celda1[1]].size === 0) {
                    return false; // Inconsistencia
                }
                
                // Agregar arcos afectados de vuelta a la cola
                const relacionadas = this.obtenerCeldasRelacionadas(celda1[0], celda1[1]);
                for (const [fi, co] of relacionadas) {
                    if (fi !== celda2[0] || co !== celda2[1]) {
                        cola.push([[fi, co], celda1]);
                    }
                }
            }
        }
        
        return true;
    }
    
    async revisar(dominios, celda1, celda2) {
        const [f1, c1] = celda1;
        const [f2, c2] = celda2;
        
        let revisado = false;
        const valoresARemover = [];
        
        for (const valor of dominios[f1][c1]) {
            let tieneSuporte = false;
            
            for (const valorSoporte of dominios[f2][c2]) {
                if (valor !== valorSoporte) {
                    tieneSuporte = true;
                    break;
                }
            }
            
            if (!tieneSuporte) {
                valoresARemover.push(valor);
                revisado = true;
            }
        }
        
        for (const valor of valoresARemover) {
            dominios[f1][c1].delete(valor);
        }
        
        return revisado;
    }
    
    obtenerCeldasRelacionadas(fila, col) {
        const relacionadas = [];
        
        // Misma fila
        for (let j = 0; j < 9; j++) {
            if (j !== col) relacionadas.push([fila, j]);
        }
        
        // Misma columna
        for (let i = 0; i < 9; i++) {
            if (i !== fila) relacionadas.push([i, col]);
        }
        
        // Mismo cuadro 3x3
        const startFila = Math.floor(fila / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        
        for (let i = startFila; i < startFila + 3; i++) {
            for (let j = startCol; j < startCol + 3; j++) {
                if (i !== fila && j !== col) {
                    relacionadas.push([i, j]);
                }
            }
        }
        
        return relacionadas;
    }
    
    async resolverConAC3(grid, dominios) {
        // Aplicar AC-3 en cada paso
        await this.aplicarAC3(dominios);
        
        // Buscar celda con dominio de tamaño 1
        for (let fila = 0; fila < 9; fila++) {
            for (let col = 0; col < 9; col++) {
                if (grid[fila][col] === 0 && dominios[fila][col].size === 1) {
                    const valor = [...dominios[fila][col]][0];
                    grid[fila][col] = valor;
                    
                    await this.animarCelda(fila, col, 'solucion');
                    await this.esperar(this.velocidadAnimacion);
                    
                    return await this.resolverConAC3(grid, dominios);
                }
            }
        }
        
        // Si no hay celdas con dominio de tamaño 1, usar backtracking con MRV
        const mejorCelda = this.encontrarCeldaMRV(grid, dominios);
        if (!mejorCelda) return true;
        
        const [fila, col] = mejorCelda;
        const valoresPosibles = [...dominios[fila][col]];
        
        for (const num of valoresPosibles) {
            grid[fila][col] = num;
            this.pasos++;
            
            await this.animarCelda(fila, col, 'procesando');
            this.actualizarEstadisticas();
            await this.esperar(this.velocidadAnimacion);
            
            const dominiosBackup = this.copiarDominios(dominios);
            const consistente = this.actualizarDominios(dominios, fila, col, num);
            
            if (consistente && await this.resolverConAC3(grid, dominios)) {
                return true;
            }
            
            grid[fila][col] = 0;
            this.backtracks++;
            this.restaurarDominios(dominios, dominiosBackup);
            await this.animarCelda(fila, col, 'error');
            await this.esperar(this.velocidadAnimacion);
        }
        
        return false;
    }
    
    // Funciones auxiliares
    esValido(grid, fila, col, num) {
        // Verificar fila
        for (let j = 0; j < 9; j++) {
            if (j !== col && grid[fila][j] === num) return false;
        }
        
        // Verificar columna
        for (let i = 0; i < 9; i++) {
            if (i !== fila && grid[i][col] === num) return false;
        }
        
        // Verificar cuadro 3x3
        const startFila = Math.floor(fila / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        
        for (let i = startFila; i < startFila + 3; i++) {
            for (let j = startCol; j < startCol + 3; j++) {
                if ((i !== fila || j !== col) && grid[i][j] === num) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    resolverSudoku(grid) {
        for (let fila = 0; fila < 9; fila++) {
            for (let col = 0; col < 9; col++) {
                if (grid[fila][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (this.esValido(grid, fila, col, num)) {
                            grid[fila][col] = num;
                            
                            if (this.resolverSudoku(grid)) {
                                return true;
                            }
                            
                            grid[fila][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    
    async animarCelda(fila, col, tipo) {
        const cell = document.querySelector(`[data-index="${fila * 9 + col}"]`);
        cell.textContent = this.grid[fila][col] || '';
        
        cell.className = `sudoku-cell ${tipo}`;
        if (this.originalGrid[fila][col] !== 0) {
            cell.classList.add('inicial');
        }
    }
    
    reiniciarEstadisticas() {
        this.pasos = 0;
        this.backtracks = 0;
        this.tiempoInicio = 0;
    }
    
    actualizarEstadisticas(tiempo) {
        document.getElementById('pasos-ejecutados').textContent = `Pasos: ${this.pasos}`;
        document.getElementById('backtrack-count').textContent = `Backtracks: ${this.backtracks}`;
        if (tiempo !== undefined) {
            document.getElementById('tiempo-resolucion').textContent = `Tiempo: ${tiempo}ms`;
        }
    }
    
    mostrarExito() {
        alert('¡Sudoku resuelto exitosamente!');
        this.validarSudokuCompleto();
    }
    
    validarSudokuCompleto() {
        let esValido = true;
        
        for (let fila = 0; fila < 9; fila++) {
            for (let col = 0; col < 9; col++) {
                const valor = this.grid[fila][col];
                if (valor === 0 || !this.esValido(this.grid, fila, col, valor)) {
                    esValido = false;
                    break;
                }
            }
            if (!esValido) break;
        }
        
        if (esValido) {
            document.body.style.background = 'linear-gradient(45deg, #4CAF50, #8BC34A)';
            setTimeout(() => {
                document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }, 2000);
        }
    }
    
    esperar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    configurarEventos() {
        // Algoritmos
        document.getElementById('btn-backtracking').addEventListener('click', async () => {
            if (this.animacionEnCurso) return;
            this.seleccionarAlgoritmo('backtracking');
            this.animacionEnCurso = true;
            await this.backtrackingBasico();
            this.animacionEnCurso = false;
        });
        
        document.getElementById('btn-forward-checking').addEventListener('click', async () => {
            if (this.animacionEnCurso) return;
            this.seleccionarAlgoritmo('forward-checking');
            this.animacionEnCurso = true;
            await this.forwardChecking();
            this.animacionEnCurso = false;
        });
        
        document.getElementById('btn-arc-consistency').addEventListener('click', async () => {
            if (this.animacionEnCurso) return;
            this.seleccionarAlgoritmo('arc-consistency');
            this.animacionEnCurso = true;
            await this.arcConsistency();
            this.animacionEnCurso = false;
        });
        
        // Acciones
        document.getElementById('btn-generar').addEventListener('click', () => {
            if (this.animacionEnCurso) return;
            this.generarSudokuCompleto();
            this.crearProblema(this.dificultadActual);
            this.dibujarGrid();
        });
        
        document.getElementById('btn-resolver').addEventListener('click', () => {
            if (this.animacionEnCurso) return;
            this.grid = this.solutionGrid.map(row => [...row]);
            this.dibujarGrid();
        });
        
        document.getElementById('btn-limpiar').addEventListener('click', () => {
            if (this.animacionEnCurso) return;
            this.grid = this.originalGrid.map(row => [...row]);
            this.dibujarGrid();
            this.reiniciarEstadisticas();
            this.actualizarEstadisticas();
        });
        
        document.getElementById('btn-validar').addEventListener('click', () => {
            this.validarSudokuCompleto();
        });
        
        // Dificultad
        document.querySelectorAll('.btn-dificultad').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.animacionEnCurso) return;
                
                document.querySelectorAll('.btn-dificultad').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.dificultadActual = btn.id;
                document.getElementById('dificultad').textContent = `Dificultad: ${btn.textContent}`;
                
                this.crearProblema(this.dificultadActual);
                this.dibujarGrid();
            });
        });
    }
    
    seleccionarAlgoritmo(algoritmo) {
        document.querySelectorAll('.btn-algoritmo').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`btn-${algoritmo}`).classList.add('active');
        
        const descripciones = {
            'backtracking': 'Backtracking: Algoritmo básico que prueba valores y retrocede cuando encuentra inconsistencias.',
            'forward-checking': 'Forward Checking: Mejora el backtracking eliminando valores inconsistentes del dominio antes de asignar.',
            'arc-consistency': 'Arc Consistency (AC-3): Reduce dominios aplicando consistencia de arcos antes de la búsqueda.'
        };
        
        document.getElementById('algoritmo-info').textContent = descripciones[algoritmo];
        this.algoritmoActual = algoritmo;
    }
}

// Inicializar cuando la página cargue
document.addEventListener('DOMContentLoaded', () => {
    new SudokuPSSR();
});
