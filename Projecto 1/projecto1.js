// Muestra mensaje en consola para depuración
console.log("Iniciando prueba")

// Variable de control para bucles while
var comprobar = true

// Informa al usuario sobre límite de tiendas
alert("El maximo de tiendas que se puede poner son 6")

// Bucle para solicitar número de tiendas hasta que sea válido
while(comprobar){
    var cantidadTiendas = parseInt(prompt("¿Cuantas tiendas quieres poner?"))
    
    // Verifica que no exceda el máximo permitido
    if (cantidadTiendas <= 6) {
        // Verifica que no sea 0 o negativo
        if (cantidadTiendas <=0) {
            alert("No puede haber 0 tiendas o un numero negativo de tiendas")
        }
        else {
            var comprobar = false // Sale del bucle
            
            // Genera imágenes de tiendas (nota: src está vacío)
            for (var i = 0; i < cantidadTiendas; i++)
                document.writeln("<img src='', width='200', height='200'>")
        }
    }
    else{
        alert("Solo puede haber un maximo de 6 tiendas")
    }
}

// Genera imágenes de puertas después de las tiendas
for (var puertas = 0; puertas < cantidadTiendas; puertas++)
    document.writeln("<img src='puerta.png', width='200', height='200'>")

var comprobar = true // Reinicia variable (nota: ya se usó var antes)

// Bucle para solicitar hora válida
while(comprobar){
    var horas = parseInt(prompt("Pon las horas del reloj"))
    
    // Verifica rango de horas (0-23)
    if (horas <= 23){
        if (horas <=-1) {
            alert("No puede existir horas negativas")
        }
        else {
            var comprobar = false // Sale del bucle
        }
    }
    else{
        alert("No puede sobrepasar las horas del 24")
    }
}

var comprobar = true // Reinicia variable

// Bucle para solicitar minutos válidos
while(comprobar){
    var minutos = parseInt(prompt("Pon los minutos del reloj"))
    
    // Verifica rango de minutos (0-59)
    if (minutos <= 59){
        if (minutos <=-1) {
            alert("No puede existir horas negativas") // Error en mensaje, debería decir "minutos"
        }
        // Agrega '0' a minutos menores que 5 (ej: 3 -> "30")
        if (minutos <=5) {
            if (minutos =0){ // ERROR: operador de asignación (=) en lugar de comparación (== o ===)
                var comprobar = false
            }
            minutos = minutos + "0" // Convierte a string y añade '0'
            var comprobar = false
        }
        else {
            var comprobar = false
        }
    }
    else{
        alert("No puede sobrepasar los minutos del 60")
    }
}

// Solicita número inicial para carteles
var numeroCartel = parseInt(prompt("Introduce el numero del cartel"));

// Genera series de números para carteles
for (var numeroCarteles = 0; numeroCarteles < cantidadTiendas; numeroCarteles++) {
    document.writeln(numeroCartel); // Muestra número actual
    numeroCartel += 2; // Incrementa en 2 para siguiente cartel
}

// Solicita color del semáforo
var semaforo = prompt("¿De que color esta el semaforo?")
var semaforo = semaforo.toLowerCase() // Convierte a minúsculas para comparación

// Switch para mostrar imagen según color del semáforo
switch(semaforo) {
    case "rojo":
        document.writeln("<img src='semaforo rojo.webp', width='200', height='200'>")
        break;
    case "verde":
        document.writeln("<img src='semaforo verde.jpeg', width='200', height='200'>")
        break;
    case "amarillo":
        document.writeln("<img src='semaforo amarillo.png', width='200', height='200'>")
        break;
    default: // Caso por defecto si no coincide con los anteriores
        document.writeln("<img src='semaforo rojo.webp', width='200', height='200'>")
        break;
}

var comprobar = true // Reinicia variable

// Informa sobre límite de coches
alert("El maximo de coches que se puede poner son 4")

// Bucle para solicitar número de coches
while(comprobar){
    var cantidadCoches = parseInt(prompt("¿Cuantos coches quieres poner?"))
    
    // Verifica que no exceda el máximo permitido
    if (cantidadCoches <= 4){
        if (cantidadCoches <=0) {
            alert("No puede haber 0 coches o un numero negativo de coches")
        }
        else {
            var comprobar = false // Sale del bucle
            
            // Genera imágenes de coches
            for (var i = 0; i < cantidadCoches; i++)
                document.writeln("<img src='coche.png'>")
        }
    }
    else{
        alert("Solo puede haber un maximo de 4 coches")
    }
}