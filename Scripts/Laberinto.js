// Laberinto.js - Implementación de algoritmos de búsqueda en espacios de estados

class Laberinto {
    constructor() {
        this.canvas = document.getElementById('laberinto-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.filas = 20;
        this.columnas = 20;
        this.tamañoCelda = this.canvas.width / this.columnas;
        
        // Estados de las celdas
        this.VACIO = 0;
        this.PARED = 1;
        this.INICIO = 2;
        this.META = 3;
        this.VISITADO = 4;
        this.CAMINO = 5;
        
        // Colores
        this.colores = {
            [this.VACIO]: '#FFFFFF',
            [this.PARED]: '#000000',
            [this.INICIO]: '#00FF00',
            [this.META]: '#FF0000',
            [this.VISITADO]: '#FFFF00',
            [this.CAMINO]: '#FF69B4'
        };
        
        this.grid = [];
        this.inicio = null;
        this.meta = null;
        this.algoritmoActual = null;
        this.animacionEnCurso = false;
        
        this.inicializar();
        this.configurarEventos();
    }
    
    inicializar() {
        // Crear grid vacío
        this.grid = Array(this.filas).fill().map(() => Array(this.columnas).fill(this.VACIO));
        
        // Generar laberinto inicial
        this.generarLaberintoBasico();
        this.dibujar();
    }
    
    generarLaberintoBasico() {
        // Bordes del laberinto
        for (let i = 0; i < this.filas; i++) {
            this.grid[i][0] = this.PARED;
            this.grid[i][this.columnas - 1] = this.PARED;
        }
        for (let j = 0; j < this.columnas; j++) {
            this.grid[0][j] = this.PARED;
            this.grid[this.filas - 1][j] = this.PARED;
        }
        
        // Paredes internas aleatorias
        for (let i = 2; i < this.filas - 2; i += 2) {
            for (let j = 2; j < this.columnas - 2; j += 2) {
                if (Math.random() < 0.7) {
                    this.grid[i][j] = this.PARED;
                    // Agregar paredes adyacentes aleatorias
                    const direcciones = [[0, 1], [1, 0], [0, -1], [-1, 0]];
                    const dir = direcciones[Math.floor(Math.random() * direcciones.length)];
                    const ni = i + dir[0];
                    const nj = j + dir[1];
                    if (ni > 0 && ni < this.filas - 1 && nj > 0 && nj < this.columnas - 1) {
                        this.grid[ni][nj] = this.PARED;
                    }
                }
            }
        }
        
        // Establecer inicio y meta
        this.inicio = { fila: 1, columna: 1 };
        this.meta = { fila: this.filas - 2, columna: this.columnas - 2 };
        this.grid[this.inicio.fila][this.inicio.columna] = this.INICIO;
        this.grid[this.meta.fila][this.meta.columna] = this.META;
    }
    
    generarLaberintoComplejo() {
        // Limpiar grid
        this.grid = Array(this.filas).fill().map(() => Array(this.columnas).fill(this.PARED));
        
        // Algoritmo de generación de laberinto (DFS modificado)
        const stack = [];
        const visitados = Array(this.filas).fill().map(() => Array(this.columnas).fill(false));
        
        // Comenzar desde una posición aleatoria impar
        let actual = { fila: 1, columna: 1 };
        this.grid[actual.fila][actual.columna] = this.VACIO;
        visitados[actual.fila][actual.columna] = true;
        stack.push(actual);
        
        while (stack.length > 0) {
            const vecinos = this.obtenerVecinosNoVisitados(actual, visitados);
            
            if (vecinos.length > 0) {
                const siguiente = vecinos[Math.floor(Math.random() * vecinos.length)];
                
                // Remover pared entre actual y siguiente
                const entreFilas = (actual.fila + siguiente.fila) / 2;
                const entreColumnas = (actual.columna + siguiente.columna) / 2;
                this.grid[entreFilas][entreColumnas] = this.VACIO;
                this.grid[siguiente.fila][siguiente.columna] = this.VACIO;
                
                visitados[siguiente.fila][siguiente.columna] = true;
                stack.push(siguiente);
                actual = siguiente;
            } else {
                actual = stack.pop();
            }
        }
        
        // Establecer inicio y meta
        this.inicio = { fila: 1, columna: 1 };
        this.meta = { fila: this.filas - 2, columna: this.columnas - 2 };
        this.grid[this.inicio.fila][this.inicio.columna] = this.INICIO;
        this.grid[this.meta.fila][this.meta.columna] = this.META;
    }
    
    obtenerVecinosNoVisitados(celda, visitados) {
        const vecinos = [];
        const direcciones = [[0, 2], [2, 0], [0, -2], [-2, 0]];
        
        for (const [df, dc] of direcciones) {
            const nuevaFila = celda.fila + df;
            const nuevaColumna = celda.columna + dc;
            
            if (nuevaFila > 0 && nuevaFila < this.filas - 1 && 
                nuevaColumna > 0 && nuevaColumna < this.columnas - 1 && 
                !visitados[nuevaFila][nuevaColumna]) {
                vecinos.push({ fila: nuevaFila, columna: nuevaColumna });
            }
        }
        
        return vecinos;
    }
    
    dibujar() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = 0; i < this.filas; i++) {
            for (let j = 0; j < this.columnas; j++) {
                const x = j * this.tamañoCelda;
                const y = i * this.tamañoCelda;
                
                this.ctx.fillStyle = this.colores[this.grid[i][j]];
                this.ctx.fillRect(x, y, this.tamañoCelda, this.tamañoCelda);
                
                // Dibujar bordes
                this.ctx.strokeStyle = '#888';
                this.ctx.lineWidth = 0.5;
                this.ctx.strokeRect(x, y, this.tamañoCelda, this.tamañoCelda);
            }
        }
    }
    
    limpiarCamino() {
        for (let i = 0; i < this.filas; i++) {
            for (let j = 0; j < this.columnas; j++) {
                if (this.grid[i][j] === this.VISITADO || this.grid[i][j] === this.CAMINO) {
                    this.grid[i][j] = this.VACIO;
                }
            }
        }
        this.dibujar();
        this.actualizarEstadisticas(0, 0, 0);
    }
    
    reset() {
        this.limpiarCamino();
        this.inicializar();
    }
    
    obtenerVecinos(celda) {
        const vecinos = [];
        const direcciones = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        
        for (const [df, dc] of direcciones) {
            const nuevaFila = celda.fila + df;
            const nuevaColumna = celda.columna + dc;
            
            if (nuevaFila >= 0 && nuevaFila < this.filas && 
                nuevaColumna >= 0 && nuevaColumna < this.columnas && 
                this.grid[nuevaFila][nuevaColumna] !== this.PARED) {
                vecinos.push({ fila: nuevaFila, columna: nuevaColumna });
            }
        }
        
        return vecinos;
    }
    
    // Algoritmo BFS (Breadth-First Search)
    async bfs() {
        const cola = [this.inicio];
        const visitados = new Set();
        const padres = new Map();
        const tiempoInicio = Date.now();
        
        visitados.add(`${this.inicio.fila},${this.inicio.columna}`);
        
        while (cola.length > 0) {
            const actual = cola.shift();
            
            // Marcar como visitado (excepto inicio y meta)
            if (this.grid[actual.fila][actual.columna] !== this.INICIO && 
                this.grid[actual.fila][actual.columna] !== this.META) {
                this.grid[actual.fila][actual.columna] = this.VISITADO;
            }
            
            this.dibujar();
            await this.esperar(50);
            
            // ¿Llegamos a la meta?
            if (actual.fila === this.meta.fila && actual.columna === this.meta.columna) {
                const tiempoFin = Date.now();
                await this.dibujarCamino(padres, actual);
                const longitudCamino = this.calcularLongitudCamino(padres, actual);
                this.actualizarEstadisticas(visitados.size, longitudCamino, tiempoFin - tiempoInicio);
                return true;
            }
            
            // Explorar vecinos
            for (const vecino of this.obtenerVecinos(actual)) {
                const claveVecino = `${vecino.fila},${vecino.columna}`;
                
                if (!visitados.has(claveVecino)) {
                    visitados.add(claveVecino);
                    padres.set(claveVecino, actual);
                    cola.push(vecino);
                }
            }
        }
        
        const tiempoFin = Date.now();
        this.actualizarEstadisticas(visitados.size, 0, tiempoFin - tiempoInicio);
        alert('No se encontró un camino hacia la meta');
        return false;
    }
    
    // Algoritmo DFS (Depth-First Search)
    async dfs() {
        const pila = [this.inicio];
        const visitados = new Set();
        const padres = new Map();
        const tiempoInicio = Date.now();
        
        while (pila.length > 0) {
            const actual = pila.pop();
            const claveActual = `${actual.fila},${actual.columna}`;
            
            if (visitados.has(claveActual)) {
                continue;
            }
            
            visitados.add(claveActual);
            
            // Marcar como visitado (excepto inicio y meta)
            if (this.grid[actual.fila][actual.columna] !== this.INICIO && 
                this.grid[actual.fila][actual.columna] !== this.META) {
                this.grid[actual.fila][actual.columna] = this.VISITADO;
            }
            
            this.dibujar();
            await this.esperar(50);
            
            // ¿Llegamos a la meta?
            if (actual.fila === this.meta.fila && actual.columna === this.meta.columna) {
                const tiempoFin = Date.now();
                await this.dibujarCamino(padres, actual);
                const longitudCamino = this.calcularLongitudCamino(padres, actual);
                this.actualizarEstadisticas(visitados.size, longitudCamino, tiempoFin - tiempoInicio);
                return true;
            }
            
            // Explorar vecinos (en orden aleatorio para DFS más interesante)
            const vecinos = this.obtenerVecinos(actual).reverse();
            for (const vecino of vecinos) {
                const claveVecino = `${vecino.fila},${vecino.columna}`;
                
                if (!visitados.has(claveVecino)) {
                    padres.set(claveVecino, actual);
                    pila.push(vecino);
                }
            }
        }
        
        const tiempoFin = Date.now();
        this.actualizarEstadisticas(visitados.size, 0, tiempoFin - tiempoInicio);
        alert('No se encontró un camino hacia la meta');
        return false;
    }
    
    // Algoritmo A* (A-Star)
    async aStar() {
        const abiertos = [this.inicio];
        const cerrados = new Set();
        const gScore = new Map();
        const fScore = new Map();
        const padres = new Map();
        const tiempoInicio = Date.now();
        
        const claveInicio = `${this.inicio.fila},${this.inicio.columna}`;
        gScore.set(claveInicio, 0);
        fScore.set(claveInicio, this.heuristica(this.inicio, this.meta));
        
        while (abiertos.length > 0) {
            // Encontrar el nodo con menor f(n)
            let actual = abiertos[0];
            let indiceActual = 0;
            
            for (let i = 1; i < abiertos.length; i++) {
                const claveI = `${abiertos[i].fila},${abiertos[i].columna}`;
                const claveActual = `${actual.fila},${actual.columna}`;
                
                if (fScore.get(claveI) < fScore.get(claveActual)) {
                    actual = abiertos[i];
                    indiceActual = i;
                }
            }
            
            abiertos.splice(indiceActual, 1);
            const claveActual = `${actual.fila},${actual.columna}`;
            cerrados.add(claveActual);
            
            // Marcar como visitado (excepto inicio y meta)
            if (this.grid[actual.fila][actual.columna] !== this.INICIO && 
                this.grid[actual.fila][actual.columna] !== this.META) {
                this.grid[actual.fila][actual.columna] = this.VISITADO;
            }
            
            this.dibujar();
            await this.esperar(50);
            
            // ¿Llegamos a la meta?
            if (actual.fila === this.meta.fila && actual.columna === this.meta.columna) {
                const tiempoFin = Date.now();
                await this.dibujarCamino(padres, actual);
                const longitudCamino = this.calcularLongitudCamino(padres, actual);
                this.actualizarEstadisticas(cerrados.size, longitudCamino, tiempoFin - tiempoInicio);
                return true;
            }
            
            // Explorar vecinos
            for (const vecino of this.obtenerVecinos(actual)) {
                const claveVecino = `${vecino.fila},${vecino.columna}`;
                
                if (cerrados.has(claveVecino)) {
                    continue;
                }
                
                const gTentativo = gScore.get(claveActual) + 1;
                
                if (!abiertos.some(n => n.fila === vecino.fila && n.columna === vecino.columna)) {
                    abiertos.push(vecino);
                } else if (gTentativo >= gScore.get(claveVecino)) {
                    continue;
                }
                
                padres.set(claveVecino, actual);
                gScore.set(claveVecino, gTentativo);
                fScore.set(claveVecino, gTentativo + this.heuristica(vecino, this.meta));
            }
        }
        
        const tiempoFin = Date.now();
        this.actualizarEstadisticas(cerrados.size, 0, tiempoFin - tiempoInicio);
        alert('No se encontró un camino hacia la meta');
        return false;
    }
    
    // Función heurística para A* (distancia Manhattan)
    heuristica(a, b) {
        return Math.abs(a.fila - b.fila) + Math.abs(a.columna - b.columna);
    }
    
    async dibujarCamino(padres, meta) {
        const camino = [];
        let actual = meta;
        
        // Reconstruir camino
        while (actual) {
            camino.unshift(actual);
            const claveActual = `${actual.fila},${actual.columna}`;
            actual = padres.get(claveActual);
        }
        
        // Dibujar camino con animación
        for (const celda of camino) {
            if (this.grid[celda.fila][celda.columna] !== this.INICIO && 
                this.grid[celda.fila][celda.columna] !== this.META) {
                this.grid[celda.fila][celda.columna] = this.CAMINO;
                this.dibujar();
                await this.esperar(100);
            }
        }
    }
    
    calcularLongitudCamino(padres, meta) {
        let longitud = 0;
        let actual = meta;
        
        while (actual) {
            longitud++;
            const claveActual = `${actual.fila},${actual.columna}`;
            actual = padres.get(claveActual);
        }
        
        return longitud - 1; // No contar el nodo inicial
    }
    
    actualizarEstadisticas(nodosVisitados, longitudCamino, tiempo) {
        document.getElementById('nodos-visitados').textContent = `Nodos visitados: ${nodosVisitados}`;
        document.getElementById('longitud-camino').textContent = `Longitud del camino: ${longitudCamino}`;
        document.getElementById('tiempo-ejecucion').textContent = `Tiempo: ${tiempo}ms`;
    }
    
    esperar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    configurarEventos() {
        // Botones de algoritmos
        document.getElementById('btn-bfs').addEventListener('click', async () => {
            if (this.animacionEnCurso) return;
            this.seleccionarAlgoritmo('bfs');
            this.limpiarCamino();
            this.animacionEnCurso = true;
            await this.bfs();
            this.animacionEnCurso = false;
        });
        
        document.getElementById('btn-dfs').addEventListener('click', async () => {
            if (this.animacionEnCurso) return;
            this.seleccionarAlgoritmo('dfs');
            this.limpiarCamino();
            this.animacionEnCurso = true;
            await this.dfs();
            this.animacionEnCurso = false;
        });
        
        document.getElementById('btn-astar').addEventListener('click', async () => {
            if (this.animacionEnCurso) return;
            this.seleccionarAlgoritmo('astar');
            this.limpiarCamino();
            this.animacionEnCurso = true;
            await this.aStar();
            this.animacionEnCurso = false;
        });
        
        // Botones de acción
        document.getElementById('btn-generar').addEventListener('click', () => {
            if (this.animacionEnCurso) return;
            this.generarLaberintoComplejo();
            this.dibujar();
        });
        
        document.getElementById('btn-limpiar').addEventListener('click', () => {
            if (this.animacionEnCurso) return;
            this.limpiarCamino();
        });
        
        document.getElementById('btn-reset').addEventListener('click', () => {
            if (this.animacionEnCurso) return;
            this.reset();
        });
    }
    
    seleccionarAlgoritmo(algoritmo) {
        // Remover clase active de todos los botones
        document.querySelectorAll('.btn-algoritmo').forEach(btn => btn.classList.remove('active'));
        
        // Agregar clase active al botón seleccionado
        document.getElementById(`btn-${algoritmo}`).classList.add('active');
        
        // Actualizar descripción del algoritmo
        const descripciones = {
            'bfs': 'BFS (Breadth-First Search): Explora nivel por nivel, garantiza encontrar el camino más corto en grafos no ponderados.',
            'dfs': 'DFS (Depth-First Search): Explora tan profundo como sea posible antes de retroceder. No garantiza el camino más corto.',
            'astar': 'A* (A-Star): Usa una heurística para dirigir la búsqueda hacia la meta de manera eficiente. Garantiza el camino óptimo.'
        };
        
        document.getElementById('algoritmo-info').textContent = descripciones[algoritmo];
        this.algoritmoActual = algoritmo;
    }
}

// Inicializar cuando la página cargue
document.addEventListener('DOMContentLoaded', () => {
    new Laberinto();
});
