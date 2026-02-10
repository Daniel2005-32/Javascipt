// Variables globales para el juego
let movimientos = 0;      // Contador de movimientos
let tiempo = 0;           // Contador de tiempo en segundos
let temporizador = null;  // Referencia al intervalo del temporizador

// Cuando se carga la página, muestra los mejores tiempos
window.addEventListener('DOMContentLoaded', () => {
    mostrarMejoresTiempos(); 
});

// Inicia o reinicia el juego
function inicioJuego() {
    const celdas = [];
    
    // Prepara todas las celdas del puzzle (9 celdas)
    for (let i = 1; i <= 9; i++) {
        const celda = document.getElementById(`parte${i}`);
        // Clona y reemplaza para limpiar event listeners anteriores
        celda.replaceWith(celda.cloneNode(true));
        const nuevaCelda = document.getElementById(`parte${i}`);
        // Asigna evento click a cada celda
        nuevaCelda.addEventListener('click', () => moverPieza(i));
        celdas.push(nuevaCelda);
    }

    // Obtiene el contenido actual de cada celda
    const contenidos = celdas.map(celda => celda.innerHTML);
    shuffle(contenidos); // Mezcla aleatoriamente los contenidos

    // Asigna los contenidos mezclados a las celdas
    for (let i = 0; i < celdas.length; i++) {
        celdas[i].innerHTML = contenidos[i];
    }

    // Reinicia contadores
    movimientos = 0;
    tiempo = 0;
    document.getElementById("mensaje").textContent = "¡Piezas mezcladas!";
    document.getElementById("contador-mov").textContent = `Movimientos: ${movimientos}`;
    document.getElementById("contador-tiempo").textContent = `Tiempo: 0 s`;

    // Configura el temporizador que se ejecuta cada segundo
    if (temporizador) clearInterval(temporizador);
    temporizador = setInterval(() => {
        tiempo++;
        document.getElementById("contador-tiempo").textContent = `Tiempo: ${tiempo} s`;
    }, 1000);
}

// Algoritmo Fisher-Yates para mezclar array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Índice aleatorio
        [array[i], array[j]] = [array[j], array[i]];   // Intercambia elementos
    }
}

// Maneja el movimiento de una pieza al hacer click
function moverPieza(numCelda) {
    const celdaActual = document.getElementById(`parte${numCelda}`);
    // Si la celda está vacía, no hace nada
    if (!celdaActual || celdaActual.innerHTML.trim() === "") return;

    const celdaVacia = obtenerCeldaVacia();
    if (!celdaVacia) return;

    // Verifica si la celda clickeada es vecina de la vacía
    if (esVecina(numCelda, celdaVacia)) {
        // Intercambia contenidos
        const tmp = celdaActual.innerHTML;
        celdaActual.innerHTML = "";
        celdaVacia.innerHTML = tmp;

        // Actualiza contador de movimientos
        movimientos++;
        document.getElementById("contador-mov").textContent = `Movimientos: ${movimientos}`;

        // Verifica si el puzzle está completo
        if (verificarVictoria()) {
            juegoTerminado = true;
            clearInterval(temporizador); // Detiene el temporizador
            
            document.getElementById("mensaje").textContent =
                ` ¡Puzzle completado en ${movimientos} movimientos y ${tiempo} segundos!`;

            // Guarda el récord y muestra ranking
            guardarMejorTiempo(tiempo, movimientos);
            mostrarMejoresTiempos();

            // Muestra botón para jugar nuevamente
            mostrarBotonReiniciar();
        }
    }
}

// Busca y devuelve la celda vacía (sin imagen)
function obtenerCeldaVacia() {
    for (let i = 1; i <= 9; i++) {
        const celda = document.getElementById(`parte${i}`);
        if (celda.innerHTML.trim() === "") return celda;
    }
    return null; // No hay celda vacía
}

// Verifica si dos celdas son adyacentes (horizontal o vertical)
function esVecina(celdaNum, celdaVacia) {
    const vaciaNum = parseInt(celdaVacia.id.replace("parte", ""), 10);

    // Calcula posición en la cuadrícula 3x3
    const filaActual = Math.ceil(celdaNum / 3);
    const colActual = ((celdaNum - 1) % 3) + 1;

    const filaVacia = Math.ceil(vaciaNum / 3);
    const colVacia = ((vaciaNum - 1) % 3) + 1;

    // Calcula diferencia de posición
    const difFila = Math.abs(filaActual - filaVacia);
    const difCol = Math.abs(colActual - colVacia);

    // Son vecinas si están a distancia 1 en una dirección
    return (difFila + difCol === 1);
}

// Verifica si todas las piezas están en su posición correcta
function verificarVictoria() {
    for (let i = 1; i <= 9; i++) {
        const celda = document.getElementById(`parte${i}`);
        const img = celda.querySelector('img');

        // La celda 9 debe estar vacía (es el espacio libre)
        if (i === 9 && img) return false;

        if (i !== 9) {
            // Calcula posición esperada
            const fila = Math.ceil(i / 3);
            const col = ((i - 1) % 3) + 1;
            const nombreEsperado = `row-${fila}-column${col}`;
            
            // Verifica si la imagen corresponde a la posición
            if (!img || !img.src.includes(nombreEsperado)) {
                return false;
            }
        }
    }
    return true; // Todas las piezas están correctas
}

// Guarda un nuevo récord en localStorage
function guardarMejorTiempo(tiempo, movimientos) {
    let nombre = document.getElementById('nombre-jugador').value.trim();
    if (nombre === "") nombre = "Anónimo"; // Nombre por defecto

    // Obtiene récords existentes o crea array vacío
    let mejores = JSON.parse(localStorage.getItem('mejoresTiempos')) || [];
    
    // Agrega nuevo récord
    mejores.push({ 
        nombre, 
        tiempo, 
        movimientos, 
        fecha: new Date().toLocaleString() 
    });

    // Ordena por tiempo (menor a mayor) y mantiene solo top 5
    mejores.sort((a, b) => a.tiempo - b.tiempo);
    mejores = mejores.slice(0, 5);

    // Guarda en localStorage
    localStorage.setItem('mejoresTiempos', JSON.stringify(mejores));
}

// Muestra la lista de mejores tiempos
function mostrarMejoresTiempos() {
    const contenedor = document.getElementById("ranking");
    contenedor.innerHTML = "<h3>🏆 Mejores Tiempos</h3>";
    
    // Obtiene récords de localStorage
    const mejores = JSON.parse(localStorage.getItem('mejoresTiempos')) || [];

    if (mejores.length === 0) {
        contenedor.innerHTML += "<p>Aún no hay récords.</p>";
        return;
    }

    // Crea lista ordenada con los récords
    const lista = document.createElement('ol');
    mejores.forEach(record => {
        const item = document.createElement('li');
        item.textContent = `${record.nombre} - ⏱️ ${record.tiempo}s - ${record.movimientos} mov. (${record.fecha})`;
        lista.appendChild(item);
    });

    contenedor.appendChild(lista);
}

// Muestra botón para reiniciar juego al finalizar
function mostrarBotonReiniciar() {
    let btn = document.getElementById("btn-reiniciar");
    if (!btn) {
        btn = document.createElement("button");
        btn.id = "btn-reiniciar";
        btn.textContent = "Volver a jugar";
        
        // Al hacer click, elimina botón y reinicia juego
        btn.addEventListener('click', () => {
            btn.remove();
            inicioJuego();
        });
        
        document.body.appendChild(btn);
    }
}

// Guarda el estado actual del juego en localStorage
function guardarPartida() {
    const nombreJugador = document.getElementById("nombre-jugador");
    if (!nombreJugador) {
        alert("No se encontró el campo de nombre del jugador en el HTML.");
        return;
    }

    // Objeto con estado del juego
    const estado = {
        piezas: [],          // Orden actual de las imágenes
        tiempo,              // Tiempo transcurrido
        movimientos,         // Movimientos realizados
        jugador: nombreJugador.value.trim() || "Anónimo" // Nombre del jugador
    };

    // Guarda el src de cada imagen (o string vacío si está vacía)
    for (let i = 1; i <= 9; i++) {
        const celda = document.getElementById(`parte${i}`);
        if (!celda) continue;
        const img = celda.querySelector("img");
        estado.piezas.push(img ? img.getAttribute("src") : "");
    }

    try {
        // Guarda en localStorage
        localStorage.setItem("partidaGuardada", JSON.stringify(estado));
        document.getElementById("mensaje").textContent = "💾 Partida guardada correctamente.";
        console.log("Partida guardada:", estado);
    } catch (err) {
        console.error("Error al guardar la partida:", err);
        alert("❌ Error al guardar la partida. Revisa la consola.");
    }
}

// Carga una partida guardada desde localStorage
function cargarPartida() {
    const data = localStorage.getItem("partidaGuardada");
    if (!data) {
        document.getElementById("mensaje").textContent = "⚠️ No hay ninguna partida guardada.";
        return;
    }

    let estado;
    try {
        estado = JSON.parse(data); // Parsea el JSON
    } catch (err) {
        console.error("Error al leer la partida:", err);
        alert("❌ Error al cargar la partida. Revisa la consola.");
        return;
    }

    // Restaura las imágenes en las celdas
    for (let i = 1; i <= 9; i++) {
        const celda = document.getElementById(`parte${i}`);
        if (!celda) continue;
        const src = estado.piezas[i - 1];
        celda.innerHTML = src ? `<img src="${src}">` : "";
    }

    // Restaura contadores
    tiempo = estado.tiempo || 0;
    movimientos = estado.movimientos || 0;
    document.getElementById("nombre-jugador").value = estado.jugador || "Anónimo";
    document.getElementById("contador-tiempo").textContent = `Tiempo: ${tiempo} s`;
    document.getElementById("contador-mov").textContent = `Movimientos: ${movimientos}`;

    // Reinicia el temporizador
    if (temporizador) clearInterval(temporizador);
    temporizador = setInterval(() => {
        tiempo++;
        document.getElementById("contador-tiempo").textContent = `Tiempo: ${tiempo} s`;
    }, 1000);

    juegoTerminado = false;
    document.getElementById("mensaje").textContent = "🔄 Partida cargada con éxito. ¡Sigue jugando!";
    console.log("Partida cargada:", estado);
}