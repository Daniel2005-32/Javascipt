// ----- TABLA DE TECLAS -----
const teclado = [
  { tecla: "1", tipo: "numero" },
  { tecla: "2", tipo: "numero" },
  { tecla: "3", tipo: "numero" },
  { tecla: "4", tipo: "numero" },
  { tecla: "5", tipo: "numero" },
  { tecla: "6", tipo: "numero" },
  { tecla: "7", tipo: "numero" },
  { tecla: "8", tipo: "numero" },
  { tecla: "9", tipo: "numero" },
  { tecla: "0", tipo: "numero" },
  { tecla: "borrar", tipo: "accion" },
  { tecla: "llamar", tipo: "accion" },
  { tecla: "eliminar", tipo: "accion"}
];

// ----- ESTADO DEL TELÉFONO -----
const telefono = {
  numeroActual: "",
  historial: []
};

// ----- PROCESAR TECLA -----
function procesarTecla(teclaObj) {

  if (teclaObj.tipo === "numero") {
    telefono.numeroActual += teclaObj.tecla;
  }

  if (teclaObj.tecla === "borrar") {
    telefono.numeroActual = telefono.numeroActual.slice(0, -1);
  }
  
  if (teclaObj.tecla === "eliminar") {
    telefono.numeroActual = telefono.numeroActual.slice(0, -99);
  }

  if (teclaObj.tecla === "llamar") {
    if (telefono.numeroActual !== "") {
      telefono.historial.push({
        numero: telefono.numeroActual,
        fecha: new Date().toLocaleString()
      });
      telefono.numeroActual = "";
    }
  }

  actualizarPantalla();
  actualizarHistorial();
}

// ----- ACTUALIZAR PANTALLA -----
function actualizarPantalla() {
  document.getElementById("pantalla").textContent = telefono.numeroActual;
}

// ----- ACTUALIZAR TABLA HISTORIAL -----
function actualizarHistorial() {
  const tbody = document.getElementById("historial");
  tbody.innerHTML = "";

  telefono.historial.forEach(llamada => {
    const fila = document.createElement("tr");

    const tdNumero = document.createElement("td");
    tdNumero.textContent = llamada.numero;

    const tdFecha = document.createElement("td");
    tdFecha.textContent = llamada.fecha;

    fila.appendChild(tdNumero);
    fila.appendChild(tdFecha);
    tbody.appendChild(fila);
  });
}

// ----- EVENTOS DEL HTML -----
document.querySelectorAll("button").forEach(boton => 
    {boton.addEventListener("click", () => 
    {const valor = boton.dataset.tecla;
    const teclaObj = teclado.find(t => t.tecla === valor);
    procesarTecla(teclaObj);
  });
});
