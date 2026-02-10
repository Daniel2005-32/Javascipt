// ========================================================
// INICIALIZACIÓN - EJECUTA CUANDO LA PÁGINA SE CARGA
// ========================================================

/**
 * EVENTO: DOMContentLoaded
 * Se ejecuta cuando el HTML está completamente cargado y parseado
 * Esto asegura que todos los elementos HTML existen antes de acceder a ellos
 */
document.addEventListener("DOMContentLoaded", () => {
    console.log("Formulario cargado correctamente");
    
    // ========================================================
    // 1. SELECCIÓN DE ELEMENTOS DEL DOM (Document Object Model)
    // ========================================================
    
    // Obtiene el formulario completo por su ID
    const formulario = document.getElementById("formulario");
    
    // Obtiene todos los botones con clase "boton" y selecciona los dos primeros
    // querySelectorAll devuelve una lista, [0] es el primer botón, [1] el segundo
    const botonGuardar = document.querySelectorAll(".boton")[0]; // Botón GUARDAR
    const botonRecuperar = document.querySelectorAll(".boton")[1]; // Botón RECUPERAR
    
    // ========================================================
    // 2. EXPRESIONES REGULARES PARA VALIDACIÓN
    // ========================================================
    
    /**
     * OBJETO: validacion
     * Contiene patrones (expresiones regulares) para validar cada campo
     * Una expresión regular es un patrón que el texto debe seguir
     */
    const validacion = {
        // Nombre: debe empezar con mayúscula y seguir con minúsculas
        // Ejemplo: "Juan" ✓, "juan" ✗, "Juan123" ✗
        nombre: /^[A-Z][a-z]+$/,
        
        // Apellidos: uno o dos apellidos, cada uno con mayúscula inicial
        // Ejemplo: "García" ✓, "García López" ✓, "garcía" ✗
        apellidos: /^[A-Z][a-z]+(\s[A-Z][a-z]+)?$/,
        
        // DNI: 8 dígitos + 1 letra mayúscula
        // Ejemplo: "12345678A" ✓, "12345678" ✗, "12345678a" ✗
        dni: /^\d{8}[A-Z]$/,
        
        // Fecha de nacimiento: formato DD/MM/AAAA
        // Ejemplo: "22/09/2000" ✓, "32/13/2020" ✗
        nacimiento: /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/,
        
        // Código postal español: entre 01000 y 52999
        // Ejemplo: "28001" ✓, "99999" ✗
        codigo: /^(0[1-9]|[1-4]\d|5[0-2])\d{3}$/,
        
        // Email: formato estándar de correo electrónico
        // Ejemplo: "usuario@dominio.com" ✓, "usuario@" ✗
        email: /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/,
        
        // Teléfono fijo español: empieza por 9 y tiene 9 dígitos
        // Ejemplo: "912345678" ✓, "812345678" ✗
        fijo: /^9\d{8}$/,
        
        // Teléfono móvil español: empieza por 6 o 7 y tiene 9 dígitos
        // Ejemplo: "612345678" ✓, "512345678" ✗
        movil: /^[6-7]\d{8}$/,
        
        // IBAN español: "ES" seguido de 22 dígitos
        // Ejemplo: "ES9121000418450200051332" ✓
        iban: /^ES\d{22}$/,
        
        // Tarjeta de crédito: 16 dígitos sin espacios
        // Ejemplo: "1234567812345678" ✓, "1234 5678 1234 5678" ✗
        tarjeta: /^\d{16}$/,
        
        // Contraseña fuerte: mínimo 12 caracteres, con:
        // - Al menos 1 minúscula (?=.*[a-z])
        // - Al menos 1 mayúscula (?=.*[A-Z])
        // - Al menos 1 número (?=.*\d)
        // - Al menos 1 símbolo (?=.*[\W_])
        // Ejemplo: "Abc123!@#def" ✓, "abc123" ✗
        contrasenha: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/
    };
    
    // ========================================================
    // 3. FUNCIÓN: OBTENER MENSAJES DE ERROR
    // ========================================================
    
    /**
     * FUNCIÓN: obtenerMensajeError
     * Recibe: nombre del campo (string)
     * Devuelve: mensaje de error correspondiente (string)
     * Propósito: Centralizar todos los mensajes de error en un solo lugar
     */
    const obtenerMensajeError = (campo) => {
        // Objeto que mapea cada campo con su mensaje de error
        const mensajes = {
            nombre: "Empieza con mayúscula, sin números.",
            apellidos: "Uno o dos apellidos con mayúscula inicial.",
            dni: "Formato: 12345678A",
            nacimiento: "Formato DD/MM/AAAA.",
            codigo: "Código postal español válido.",
            email: "Formato email@example.com.",
            fijo: "Debe empezar por 9 y tener 9 dígitos.",
            movil: "Debe empezar por 6 o 7 y tener 9 dígitos.",
            iban: "Formato IBAN español (ES + 22 dígitos).",
            tarjeta: "16 dígitos sin espacios.",
            contrasenha: "Mínimo 12 caracteres, con mayúscula, número y símbolo.",
            repetir: "Las contraseñas deben coincidir."
        };
        
        // Si el campo existe en mensajes, devuelve su mensaje
        // Si no existe, devuelve "Campo inválido." (esto es un operador OR ||)
        return mensajes[campo] || "Campo inválido.";
    };
    
    // ========================================================
    // 4. FUNCIÓN PRINCIPAL: VALIDAR UN CAMPO
    // ========================================================
    
    /**
     * FUNCIÓN: validarCampo
     * Recibe: elemento input (HTMLInputElement)
     * Devuelve: true si el campo es válido, false si no lo es (boolean)
     * Propósito: Validar un solo campo del formulario
     */
    const validarCampo = (input) => {
        // Obtener información del campo
        const campo = input.id; // Ej: "nombre", "apellidos", etc.
        const valor = input.value.trim(); // Valor sin espacios al inicio/fin
        const errorSpan = input.nextElementSibling; // El elemento <span> donde irá el error
        
        // =======================
        // PASO 1: LIMPIAR ESTADO PREVIO
        // =======================
        // Quitar clases CSS de error y correcto (por si había validación anterior)
        input.classList.remove("error-input", "correcto");
        // Limpiar mensaje de error anterior
        errorSpan.textContent = "";
        
        // =======================
        // PASO 2: VALIDACIÓN ESPECIAL PARA "REPETIR CONTRASEÑA"
        // =======================
        if (campo === "repetir") {
            // Obtener el valor de la contraseña original
            const pass = document.getElementById("contrasenha").value.trim();
            
            // Validar que coincidan y que no esté vacío
            if (valor !== pass || valor === "") {
                // Si NO coinciden O está vacío → ERROR
                input.classList.add("error-input"); // Añadir clase CSS de error
                errorSpan.textContent = obtenerMensajeError("repetir"); // Mostrar mensaje
                return false; // Devolver que NO es válido
            } else {
                // Si coinciden → CORRECTO
                input.classList.add("correcto"); // Añadir clase CSS de correcto
                return true; // Devolver que SÍ es válido
            }
        }
        
        // =======================
        // PASO 3: VALIDACIÓN CON EXPRESIÓN REGULAR
        // =======================
        // Si el campo tiene una expresión regular definida Y no pasa la prueba
        if (validacion[campo] && !validacion[campo].test(valor)) {
            input.classList.add("error-input"); // Añadir clase CSS de error
            errorSpan.textContent = obtenerMensajeError(campo); // Mostrar mensaje
            return false; // Devolver que NO es válido
        } 
        // Si el campo tiene expresión regular definida Y pasa la prueba
        else if (validacion[campo]) {
            input.classList.add("correcto"); // Añadir clase CSS de correcto
            return true; // Devolver que SÍ es válido
        }
        
        // =======================
        // PASO 4: SI LLEGA AQUÍ, ES VÁLIDO (campos sin validación específica)
        // =======================
        return true;
    };
    
    // ========================================================
    // 5. CONFIGURAR EVENTOS PARA VALIDACIÓN EN TIEMPO REAL
    // ========================================================
    
    // Para cada campo de entrada en el formulario...
    formulario.querySelectorAll("input").forEach(input => {
        // Evento: "input" → Se dispara CADA VEZ que el usuario escribe algo
        input.addEventListener("input", () => validarCampo(input));
        
        // Evento: "blur" → Se dispara cuando el usuario SALE del campo (pulsa Tab o hace clic fuera)
        input.addEventListener("blur", () => validarCampo(input));
    });
    
    // ========================================================
    // 6. EVENTO: CLICK EN BOTÓN GUARDAR
    // ========================================================
    
    botonGuardar.addEventListener("click", (e) => {
        // Prevenir el comportamiento por defecto (evitar que el formulario se envíe)
        e.preventDefault();
        
        // Variable para rastrear si TODOS los campos son válidos
        let todoCorrecto = true;
        
        // Validar cada campo individualmente
        formulario.querySelectorAll("input").forEach(input => {
            // Si algún campo NO es válido, establecer todoCorrecto a false
            if (!validarCampo(input)) todoCorrecto = false;
        });
        
        // =======================
        // SI TODOS LOS CAMPOS SON VÁLIDOS
        // =======================
        if (todoCorrecto) {
            // Crear un objeto vacío para almacenar los datos
            const datos = {};
            
            // Recorrer todos los campos y guardar sus valores en el objeto
            formulario.querySelectorAll("input").forEach(input => {
                // Ej: datos["nombre"] = "Juan"
                datos[input.id] = input.value.trim();
            });
            
            // =======================
            // GUARDAR EN SESSION STORAGE
            // =======================
            // sessionStorage es una API del navegador para almacenar datos temporalmente
            // - setItem("clave", valor): guarda un valor con una clave
            // - JSON.stringify(): convierte el objeto JavaScript a texto JSON
            // - Los datos persisten mientras la pestaña esté abierta
            sessionStorage.setItem("usuarioTienda", JSON.stringify(datos));
            
            // Mostrar mensaje de éxito al usuario
            alert("Datos guardados correctamente en SessionStorage.");
            
            // Marcar visualmente todos los campos como correctos
            formulario.querySelectorAll("input").forEach(input => {
                input.classList.add("correcto");
            });
        } 
        // =======================
        // SI HAY ALGÚN CAMPO INVÁLIDO
        // =======================
        else {
            alert("Revisa los campos marcados en rojo antes de guardar.");
        }
    });
    
    // ========================================================
    // 7. EVENTO: CLICK EN BOTÓN RECUPERAR
    // ========================================================
    
    botonRecuperar.addEventListener("click", (e) => {
        // Prevenir el comportamiento por defecto
        e.preventDefault();
        
        // Obtener datos guardados del sessionStorage
        const datosGuardados = sessionStorage.getItem("usuarioTienda");
        
        // =======================
        // SI NO HAY DATOS GUARDADOS
        // =======================
        if (!datosGuardados) {
            alert("No hay datos almacenados en SessionStorage.");
            return; // Salir de la función
        }
        
        // =======================
        // CONVERTIR JSON A OBJETO JAVASCRIPT
        // =======================
        // JSON.parse(): convierte texto JSON a objeto JavaScript
        const datos = JSON.parse(datosGuardados);
        
        // =======================
        // RELLENAR EL FORMULARIO CON LOS DATOS
        // =======================
        formulario.querySelectorAll("input").forEach(input => {
            // Si existe un dato para este campo...
            if (datos[input.id]) {
                // Establecer el valor del campo
                input.value = datos[input.id];
                // Validar el campo (para mostrar estado visual)
                validarCampo(input);
            }
        });
        
        // Mostrar mensaje de éxito
        alert("Datos recuperados correctamente.");
    });
});