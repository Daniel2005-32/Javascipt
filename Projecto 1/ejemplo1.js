







console.log("Iniciando prueba")


var comprobar = true

alert("El maximo de tiendas que se puede poner son 6")
while(comprobar){
    var cantidadTiendas = parseInt(prompt("¿Cuantas tiendas quieres poner?"))
    if (cantidadTiendas <= 6) {
        if (cantidadTiendas <=0) {
        alert("No puede haber 0 tiendas o un numero negativo de tiendas")
        }
        else {
            var comprobar = false
            for (var i = 0; i < cantidadTiendas; i++)
                document.writeln("<img src='', width='200', height='200'>")
        }
    }
    else{
        alert("Solo puede haber un maximo de 6 tiendas")
    }
}

for (var puertas = 0; puertas < cantidadTiendas; puertas++)
    document.writeln("<img src='puerta.png', width='200', height='200'>")

var comprobar = true



var comprobar = true

alert("Ahora pon la hora que quieras")
while(comprobar){
    var horas = parseInt(prompt("Pon las horas del reloj"))
    if (horas <= 23){
        if (horas <=-1) {
        alert("No puede existir horas negativas")
        }
        else {
            var comprobar = false
        }
    }
    else{
        alert("No puede sobrepasar las horas del 24")
    }
}

var comprobar = true

while(comprobar){
    var minutos = parseInt(prompt("Pon los minutos del reloj"))
    if (minutos <= 59){
        if (minutos <=-1) {
        alert("No puede existir horas negativas")
        }
        if (minutos <=5) {
            if (minutos =0){
                var comprobar = false
            }
            minutos = minutos + "0"
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

var numeroCartel = parseInt(prompt("Introduce el numero del cartel"));
for (var numeroCarteles = 0; numeroCarteles < cantidadTiendas; numeroCarteles++) {
    document.writeln(numeroCartel);
    numeroCartel += 2;
}


var semaforo = prompt("¿De que color esta el semaforo?")
var semaforo = semaforo.toLowerCase()

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
    default:
        document.writeln("<img src='semaforo rojo.webp', width='200', height='200'>")
        break;
}

var comprobar = true

alert("El maximo de coches que se puede poner son 4")
while(comprobar){
    var cantidadCoches = parseInt(prompt("¿Cuantos coches quieres poner?"))
    if (cantidadCoches <= 4){
        if (cantidadCoches <=0) {
        alert("No puede haber 0 coches o un numero negativo de coches")
        }
        else {
            var comprobar = false
            for (var i = 0; i < cantidadCoches; i++)
                document.writeln("<img src='coche.png'>")
        }
    }
    else{
        alert("Solo puede haber un maximo de 4 coches")
    }
}