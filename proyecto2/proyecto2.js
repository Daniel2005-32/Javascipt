class Avion {
    constructor(filas, columnas, companhia, precioBase) {
        // Inicializa las propiedades básicas del avión
        this.filas = filas;
        this.columnas = columnas;
        this.companhia = companhia;
        this.precioBase = precioBase;
        // Genera la matriz de asientos automáticamente
        this.asientos = this.generarAsientos();
    }

    // Método para crear la matriz de asientos con sus categorías
    generarAsientos() {
        let asientos = [];
        // Recorre cada fila
        for (let i = 0; i < this.filas; i++) {
            let fila = [];
            // Recorre cada columna
            for (let j = 0; j < this.columnas; j++) {
                // Asigna categoría según la fila
                let categoria = "Lowcost"; // Categoría por defecto
                if (i === 0) categoria = "Business"; // Primera fila: Business
                else if (i < 2) categoria = "Económica"; // Segunda fila: Económica
                
                // Crea objeto asiento con estado inicial no ocupado
                fila.push({ ocupado: false, categoria });
            }
            asientos.push(fila);
        }
        return asientos;
    }

    // Calcula el precio final basado en categoría y residencia
    precioFinal(categoria, residente) {
        let precio = this.precioBase;
        
        // Aplica multiplicadores según categoría
        if (categoria === "Business") precio *= 2; // Business duplica el precio
        if (categoria === "Económica") precio *= 1.2; // Económica aumenta 20%
        
        // Aplica descuento del 75% si es residente
        if (residente === "Si" || residente === "si" || residente === "SI") precio *= 0.25;
        
        return precio;
    }
}

// Objeto que almacena las instancias de aviones de cada compañía
const aviones = {
    Binter: new Avion(6, 10, "Binter", 32),      // Avión Binter: 6 filas, 10 columnas
    Iberia: new Avion(8, 8, "Iberia", 45),       // Avión Iberia: 8 filas, 8 columnas
    CanaryFly: new Avion(4, 12, "CanaryFly", 37) // Avión CanaryFly: 4 filas, 12 columnas
};

// Muestra la vista detallada de una compañía aérea
function mostrarCompanhia(nombre) {
    const avion = aviones[nombre];
    if (!avion) return; // Si no existe la compañía, sale de la función

    // Oculta la vista inicial y muestra la vista de la aerolínea
    document.getElementById("inicio").style.display = "none";
    document.getElementById("vistaAereolinea").style.display = "block";

    // Actualiza la información de la compañía en la interfaz
    document.getElementById("precioBase").textContent = avion.precioBase;
    document.getElementById("logoCompanhia").src = `${avion.companhia}.png`; // Carga el logo
    document.getElementById("Filas").textContent = avion.filas;
    document.getElementById("Columnas").textContent = avion.columnas;

    // Muestra la tabla de asientos
    mostrarTabla(avion);
}

// Genera la tabla HTML de asientos con colores según estado
function mostrarTabla(avion) {
    let html = "<table class='asientos'>";
    
    // Itera sobre cada fila de asientos
    avion.asientos.forEach((fila, i) => {
        html += "<tr>"; // Inicia nueva fila en la tabla
        
        // Itera sobre cada asiento en la fila
        fila.forEach((asiento, j) => {
            // Determina color según categoría y ocupación
            let color = asiento.ocupado ? "red" : "green"; // Lowcost: rojo/verde
            if (asiento.categoria === "Business") color = asiento.ocupado ? "darkred" : "gold";
            if (asiento.categoria === "Económica") color = asiento.ocupado ? "orangered" : "lightblue";

            // Crea celda clickeable para reservar
            html += `<td style="width:30px;height:30px;background:${color};cursor:pointer"
                    onclick="reservar('${avion.companhia}',${i},${j})"></td>`;

            // Añade separador entre los lados del avión (pasillo)
            if (j === Math.floor(fila.length / 2) - 1) html += "<td style='width:20px'></td>";
        });
        html += "</tr>"; // Cierra fila
    });
    html += "</table>";
    
    // Inserta la tabla en el DOM
    document.getElementById("tabla").innerHTML = html;
}

// Maneja la reserva o liberación de un asiento
function reservar(nombre, fila, col) {
    let avion = aviones[nombre];
    let asiento = avion.asientos[fila][col];

    // Si el asiento está ocupado, pregunta si liberarlo
    if (asiento.ocupado) {
        let liberar = prompt("El asiento está ocupado. ¿Quieres liberarlo?");
        if (liberar === "si" || liberar === "Si" || liberar === "SI") {
            asiento.ocupado = false;
            // Elimina el precio del sessionStorage
            sessionStorage.removeItem(`${nombre}_${fila}_${col}`);
        }
    } else {
        // Si está libre, pregunta si es residente para calcular precio
        let residente = prompt("¿Eres residente? (75% de descuento)");
        let precio = avion.precioFinal(asiento.categoria, residente);
        alert(`Precio final: ${precio.toFixed(2)} €`);
        
        // Marca como ocupado y guarda en sessionStorage
        asiento.ocupado = true;
        sessionStorage.setItem(`${nombre}_${fila}_${col}`, precio.toFixed(2));
    }
    
    // Actualiza la tabla para reflejar cambios
    mostrarTabla(avion);
}

// Calcula y muestra el total de todas las reservas
function actualizarTotal() {
    let total = 0;
    
    // Recorre todos los items en sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
        let key = sessionStorage.key(i);
        let value = parseFloat(sessionStorage.getItem(key));
        if (!isNaN(value)) total += value; // Suma solo si es número válido
    }

    // Muestra el total en la interfaz
    document.getElementById("precioTotal").textContent = total.toFixed(2);
    document.getElementById("totalReservas").style.display = "block";
}

// Vuelve a la pantalla inicial
function volverInicio() {
    document.getElementById("vistaAereolinea").style.display = "none";
    document.getElementById("inicio").style.display = "block";
    document.getElementById("tabla").innerHTML = ""; // Limpia la tabla
}

// Asigna eventos a los botones de las compañías
document.getElementById("btnBinter").addEventListener("click", () => mostrarCompanhia("Binter"));
document.getElementById("btnIberia").addEventListener("click", () => mostrarCompanhia("Iberia"));
document.getElementById("btnCanary").addEventListener("click", () => mostrarCompanhia("CanaryFly"));

// Evento para ver el total de reservas
document.getElementById("btnVerTotal").addEventListener("click", () => {
    const listo = prompt("¿Estás seguro de que deseas finalizar la reserva?");
    if (listo === "si" || listo === "Si" || listo === "SI") {
        actualizarTotal();
    }
});