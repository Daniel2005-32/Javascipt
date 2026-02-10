
// Espera a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
    console.log("Formulario cargado correctamente");

    // ========== OBTENER REFERENCIAS A ELEMENTOS DEL DOM ==========
    
    // Formulario principal
    const formulario = document.getElementById("formulario");
    
    // Botones principales de acción
    const botonGuardar = document.querySelector(".guardar");        // Guardar en Session Storage
    const botonRecuperar = document.querySelector(".recuperar");    // Recuperar de Session Storage
    
    // Botones para operaciones con servidor/archivos
    const botonJson = document.querySelector(".boton-json");         // Obtener datos de JSON local
    const botonPublicarPhp = document.querySelector(".boton-publicar-php"); // Publicar vía PHP
    const botonObtenerPhp = document.querySelector(".boton-obtener-php");   // Obtener vía PHP
    const botonPublicarBd = document.querySelector(".boton-publicar-bd");   // Guardar en BD
    const botonObtenerBd = document.querySelector(".boton-obtener-bd");     // Obtener de BD

    // ========== EXPRESIONES REGULARES PARA VALIDACIÓN ==========
    
    // Objeto que contiene todas las regex para validar cada campo
    const validacion = {
        nombre: /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?$/, // Nombre con mayúscula inicial
        apellido: /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*$/, // Apellidos con mayúscula cada uno
        dni: /^[0-9]{8}[A-Z]$/i, // 8 dígitos + 1 letra (insensible a mayúsculas)
        fecha: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/, // DD/MM/AAAA entre 1900-2099
        cp: /^(0[1-9]|[1-4][0-9]|5[0-2])\d{3}$/, // Código postal español (01000-52999)
        correo: /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/, // Email estándar
        telefono: /^[9]\d{8}$/, // Teléfono fijo: empieza por 9, 9 dígitos
        movil: /^[67]\d{8}$/,   // Móvil: empieza por 6 o 7, 9 dígitos
        iban: /^ES\d{22}$/i,    // IBAN español: ES + 22 dígitos
        tarjeta: /^\d{16}$/,    // Tarjeta de crédito: 16 dígitos
        contrasenha: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/ // Contraseña fuerte
        // La regex de contraseña requiere:
        // - Al menos una minúscula (?=.*[a-z])
        // - Al menos una mayúscula (?=.*[A-Z])
        // - Al menos un número (?=.*\d)
        // - Al menos un símbolo (?=.*[\W_])
        // - Mínimo 12 caracteres .{12,}
    };

    // ========== FUNCIONES DE VALIDACIÓN ==========

    /**
     * Obtiene el mensaje de error para un campo específico
     * @param {string} campo - Nombre del campo (id del input)
     * @returns {string} - Mensaje de error descriptivo
     */
    const obtenerMensajeError = (campo) => {
        const mensajes = {
            nombre: "Debe empezar con mayúscula y solo letras",
            apellido: "Cada apellido debe empezar con mayúscula",
            dni: "Formato: 8 dígitos + 1 letra (ej: 12345678X)",
            fecha: "Formato DD/MM/AAAA (ej: 22/09/2000)",
            cp: "Código postal español válido (5 dígitos)",
            correo: "Formato email válido (ej: usuario@dominio.com)",
            telefono: "Debe empezar por 9 y tener 9 dígitos",
            movil: "Debe empezar por 6 o 7 y tener 9 dígitos",
            iban: "Formato IBAN español: ES + 22 dígitos",
            tarjeta: "16 dígitos sin espacios",
            contrasenha: "Mínimo 12 caracteres, con mayúscula, minúscula, número y símbolo",
            repetir: "Las contraseñas deben coincidir"
        };
        return mensajes[campo] || "Campo inválido"; // Mensaje por defecto si no encuentra
    };

    /**
     * Valida un campo individual del formulario
     * @param {HTMLInputElement} input - Elemento input a validar
     * @returns {boolean} - true si es válido, false si hay error
     */
    const validarCampo = (input) => {
        const campo = input.id; // ID del campo (nombre, apellido, dni, etc.)
        const valor = input.value.trim(); // Valor sin espacios al inicio/fin
        const errorSpan = input.nextElementSibling; // Span donde mostrar error

        // Limpiar estados previos de validación
        input.classList.remove("error-input", "correcto");
        errorSpan.textContent = "";

        // Validación para campos vacíos (todos son obligatorios excepto teléfono fijo)
        if (valor === "" && campo !== "telefono") {
            input.classList.add("error-input");
            errorSpan.textContent = "Este campo es obligatorio";
            return false;
        }

        // Validación especial para campo "repetir contraseña"
        if (campo === "repetir") {
            const pass = document.getElementById("contrasenha").value.trim();
            if (valor !== pass) {
                input.classList.add("error-input");
                errorSpan.textContent = obtenerMensajeError("repetir");
                return false;
            } else if (valor !== "") {
                input.classList.add("correcto"); // Marcar como correcto
                return true;
            }
            return true; // Si está vacío pero no es obligatorio en este punto
        }

        // Validación para campos opcionales vacíos (teléfono fijo)
        if (campo === "telefono" && valor === "") {
            return true; // Teléfono fijo puede estar vacío
        }

        // Validación con expresión regular para campos con regex definida
        if (validacion[campo] && !validacion[campo].test(valor)) {
            input.classList.add("error-input");
            errorSpan.textContent = obtenerMensajeError(campo);
            return false;
        }

        // Si pasa todas las validaciones y no está vacío, marcar como correcto
        if (valor !== "") {
            input.classList.add("correcto");
        }
        return true;
    };

    /**
     * Valida todo el formulario completo
     * @returns {boolean} - true si todos los campos son válidos
     */
    const validarFormularioCompleto = () => {
        let valido = true;
        formulario.querySelectorAll("input").forEach(input => {
            if (!validarCampo(input)) {
                valido = false; // Si algún campo falla, el formulario es inválido
            }
        });
        return valido;
    };

    // ========== FUNCIONES DE INTERFAZ DE USUARIO ==========

    /**
     * Muestra un mensaje flotante en la pantalla
     * @param {string} mensaje - Texto a mostrar
     * @param {string} tipo - "exito" o "error" para cambiar colores
     */
    const mostrarMensaje = (mensaje, tipo = "exito") => {
        // Eliminar mensajes previos para no acumular
        const mensajesPrevios = document.querySelectorAll(".mensaje-flotante");
        mensajesPrevios.forEach(msg => msg.remove());

        // Crear nuevo elemento de mensaje
        const divMensaje = document.createElement("div");
        divMensaje.className = `mensaje-flotante ${tipo}`;
        divMensaje.textContent = mensaje;
        
        // Estilos inline para el mensaje
        divMensaje.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            font-weight: bold;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease-out;
        `;
        
        // Colores según tipo de mensaje
        if (tipo === "exito") {
            divMensaje.style.backgroundColor = "#d4edda"; // Verde claro
            divMensaje.style.color = "#155724";           // Verde oscuro
            divMensaje.style.border = "1px solid #c3e6cb";
        } else {
            divMensaje.style.backgroundColor = "#f8d7da"; // Rojo claro
            divMensaje.style.color = "#721c24";           // Rojo oscuro
            divMensaje.style.border = "1px solid #f5c6cb";
        }
        
        document.body.appendChild(divMensaje);

        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            divMensaje.style.animation = "slideOut 0.3s ease-in";
            setTimeout(() => divMensaje.remove(), 300);
        }, 5000);
    };

    /**
     * Prepara los datos del formulario para enviar al servidor
     * @returns {Object} - Objeto con todos los datos del formulario
     */
    const prepararDatosParaServidor = () => {
        const datos = {
            nombre: document.getElementById("nombre").value.trim(),
            apellido: document.getElementById("apellido").value.trim(),
            dni: document.getElementById("dni").value.trim().toUpperCase(), // Siempre mayúsculas
            fecha: document.getElementById("fecha").value.trim(),
            cp: document.getElementById("cp").value.trim(),
            correo: document.getElementById("correo").value.trim(),
            telefono: document.getElementById("telefono").value.trim(),
            movil: document.getElementById("movil").value.trim(),
            tarjeta: document.getElementById("tarjeta").value.trim(),
            iban: document.getElementById("iban").value.trim().toUpperCase(), // IBAN en mayúsculas
            contrasenha: document.getElementById("contrasenha").value.trim()
        };
        
        console.log("Datos preparados:", datos); // Para debugging
        return datos;
    };

    /**
     * Rellena el formulario con datos recibidos (desde JSON, BD, etc.)
     * @param {Object} datos - Datos a cargar en el formulario
     */
    const rellenarFormulario = (datos) => {
        console.log("Rellenando formulario con:", datos);
        
        // Mapeo de nombres de campos (pueden variar según fuente de datos)
        const campos = {
            'nombre': datos.nombre || '',                     // Nombre directo o vacío
            'apellido': datos.apellido || datos.apellidos || '', // Apellido o apellidos
            'dni': datos.dni || '',                          // DNI
            'fecha': datos.fecha || datos.fecha_nacimiento || '', // fecha o fecha_nacimiento
            'cp': datos.cp || datos.codigo_postal || '',     // cp o codigo_postal
            'correo': datos.correo || datos.email || '',     // correo o email
            'telefono': datos.telefono || datos.telefono_fijo || '', // telefono o telefono_fijo
            'movil': datos.movil || datos.telefono_movil || '', // movil o telefono_movil
            'tarjeta': datos.tarjeta || datos.tarjeta_credito || '', // tarjeta o tarjeta_credito
            'iban': datos.iban || '',                        // iban
            'contrasenha': datos.contrasenha || datos.contrasena || '' // contrasenha o contrasena
        };

        // Rellenar cada campo del formulario
        Object.entries(campos).forEach(([id, valor]) => {
            const input = document.getElementById(id);
            if (input) {
                input.value = valor;
                // Validar después de rellenar (con delay para permitir renderizado)
                setTimeout(() => validarCampo(input), 100);
            }
        });

        // Rellenar campo "repetir contraseña" si existe y hay contraseña
        const repetirInput = document.getElementById('repetir');
        if (repetirInput && campos.contrasenha) {
            repetirInput.value = campos.contrasenha;
            setTimeout(() => validarCampo(repetirInput), 100);
        }
    };

    /**
     * Limpia completamente el formulario (todos los campos)
     */
    const limpiarFormulario = () => {
        formulario.querySelectorAll("input").forEach(input => {
            input.value = ""; // Vaciar valor
            input.classList.remove("error-input", "correcto"); // Limpiar clases CSS
            const errorSpan = input.nextElementSibling;
            errorSpan.textContent = ""; // Limpiar mensajes de error
        });
    };

    // ========== CONFIGURACIÓN DE EVENT LISTENERS ==========

    // Validación en tiempo real para cada campo
    formulario.querySelectorAll("input").forEach(input => {
        // Validar mientras se escribe
        input.addEventListener("input", () => validarCampo(input));
        // Validar al salir del campo
        input.addEventListener("blur", () => validarCampo(input));
    });

    // ========== BOTÓN GUARDAR (Session Storage) ==========
    botonGuardar.addEventListener("click", async (e) => {
        e.preventDefault(); // Evitar comportamiento por defecto del formulario
        
        // Validar formulario completo antes de guardar
        if (!validarFormularioCompleto()) {
            mostrarMensaje("Corrige los errores en rojo antes de guardar", "error");
            return;
        }

        const datos = prepararDatosParaServidor();
        
        try {
            // Guardar en sessionStorage (persiste durante la sesión del navegador)
            sessionStorage.setItem("usuarioTienda", JSON.stringify(datos));
            mostrarMensaje("✅ Datos guardados en Session Storage", "exito");
            
            // Marcar visualmente todos los campos como correctos
            formulario.querySelectorAll("input").forEach(input => {
                if (input.value.trim() !== "") {
                    input.classList.add("correcto");
                }
            });
        } catch (error) {
            mostrarMensaje("❌ Error al guardar: " + error.message, "error");
        }
    });

    // ========== BOTÓN RECUPERAR (Session Storage) ==========
    botonRecuperar.addEventListener("click", (e) => {
        e.preventDefault();
        
        try {
            // Recuperar datos de sessionStorage
            const datosGuardados = sessionStorage.getItem("usuarioTienda");
            if (!datosGuardados) {
                mostrarMensaje("❌ No hay datos guardados en Session Storage", "error");
                return;
            }

            // Parsear JSON y cargar en formulario
            const datos = JSON.parse(datosGuardados);
            rellenarFormulario(datos);
            mostrarMensaje("✅ Datos recuperados de Session Storage", "exito");
        } catch (error) {
            mostrarMensaje("❌ Error al recuperar: " + error.message, "error");
        }
    });

    // ========== BOTÓN OBTENER DESDE JSON LOCAL ==========
    botonJson.addEventListener("click", async () => {
        try {
            // Fetch del archivo JSON local
            const respuesta = await fetch('datos.json');
            if (!respuesta.ok) {
                throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
            }
            
            // Parsear respuesta JSON
            const datos = await respuesta.json();
            rellenarFormulario(datos);
            mostrarMensaje("✅ Datos cargados desde JSON local", "exito");
        } catch (error) {
            mostrarMensaje(`❌ Error cargando JSON: ${error.message}`, "error");
            console.error("Error JSON:", error);
        }
    });

    // ========== BOTÓN PUBLICAR EN PHP ==========
    botonPublicarPhp.addEventListener("click", async () => {
        // Validar formulario antes de enviar
        if (!validarFormularioCompleto()) {
            mostrarMensaje("Corrige los errores antes de enviar", "error");
            return;
        }

        const datos = prepararDatosParaServidor();
        
        try {
            // Enviar datos al servidor PHP con acción "publicar"
            const respuesta = await fetch('api.php?action=publicar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ datos: datos })
            });

            const resultado = await respuesta.json();
            
            if (resultado.success) {
                mostrarMensaje("✅ Datos guardados directamente en archivo JSON del servidor", "exito");
                console.log("Respuesta PHP (JSON guardado):", resultado);
                
                // También actualizar localmente el archivo datos.json (para consistencia)
                try {
                    const respuestaLocal = await fetch('datos.json');
                    const datosActuales = await respuestaLocal.json();
                    const datosActualizados = { ...datosActuales, ...datos };
                    console.log("Datos actualizados para JSON local:", datosActualizados);
                } catch (e) {
                    console.log("No se pudo actualizar JSON local, pero está guardado en el servidor");
                }
            } else {
                mostrarMensaje(`❌ Error al guardar en JSON: ${resultado.error}`, "error");
            }
        } catch (error) {
            mostrarMensaje(`❌ Error de conexión: ${error.message}`, "error");
            console.error("Error:", error);
        }
    });

    // ========== BOTÓN OBTENER DESDE PHP ==========
    botonObtenerPhp.addEventListener("click", async () => {
        // Necesita DNI para buscar en el servidor
        const dni = document.getElementById("dni").value.trim();
        
        if (!dni) {
            mostrarMensaje("❌ Introduce un DNI para buscar en el JSON del servidor", "error");
            return;
        }

        try {
            // Obtener datos del servidor PHP con acción "obtener" y parámetro DNI
            const respuesta = await fetch(`api.php?action=obtener&dni=${encodeURIComponent(dni)}`);
            const datos = await respuesta.json();
            
            if (datos.error) {
                mostrarMensaje(`❌ ${datos.error}`, "error");
            } else {
                rellenarFormulario(datos);
                mostrarMensaje("✅ Datos obtenidos del archivo JSON del servidor", "exito");
            }
        } catch (error) {
            mostrarMensaje(`❌ Error: ${error.message}`, "error");
            console.error("Error:", error);
        }
    });

    // ========== BOTÓN PUBLICAR EN BASE DE DATOS ==========
    botonPublicarBd.addEventListener("click", async () => {
        // Validar formulario completo
        if (!validarFormularioCompleto()) {
            mostrarMensaje("Corrige los errores antes de guardar en BD", "error");
            return;
        }

        const datos = prepararDatosParaServidor();
        
        // DNI es obligatorio para guardar en BD (como clave primaria)
        if (!datos.dni) {
            mostrarMensaje("❌ El DNI es obligatorio para guardar en BD", "error");
            return;
        }

        try {
            // Enviar datos al servidor con acción "guardar_bd"
            const respuesta = await fetch('api.php?action=guardar_bd', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ datos: datos })
            });

            const resultado = await respuesta.json();
            
            if (resultado.success) {
                mostrarMensaje("✅ Datos guardados en Base de Datos y también en archivo JSON", "exito");
                console.log("Respuesta BD + JSON:", resultado);
            } else {
                mostrarMensaje(`❌ Error: ${resultado.error}`, "error");
            }
        } catch (error) {
            mostrarMensaje(`❌ Error de conexión: ${error.message}`, "error");
            console.error("Error:", error);
        }
    });

    // ========== BOTÓN OBTENER DE BASE DE DATOS ==========
    botonObtenerBd.addEventListener("click", async () => {
        // Necesita DNI para buscar
        const dni = document.getElementById("dni").value.trim();
        
        if (!dni) {
            mostrarMensaje("❌ Introduce un DNI para buscar en BD o JSON", "error");
            return;
        }

        try {
            // Buscar datos con acción "obtener_bd" (busca primero en JSON, luego en BD)
            const respuesta = await fetch(`api.php?action=obtener_bd&dni=${encodeURIComponent(dni)}`);
            const datos = await respuesta.json();
            
            if (datos.error) {
                mostrarMensaje(`❌ ${datos.error}`, "error");
            } else {
                rellenarFormulario(datos);
                mostrarMensaje("✅ Datos obtenidos (del archivo JSON o de la Base de Datos)", "exito");
            }
        } catch (error) {
            mostrarMensaje(`❌ Error: ${error.message}`, "error");
            console.error("Error:", error);
        }
    });

    // ========== BOTÓN EXTRA: GUARDAR DIRECTAMENTE EN JSON LOCAL ==========
    /**
     * Función auxiliar para guardar directamente en JSON local vía servidor
     * @param {Object} datos - Datos a guardar en JSON
     * @returns {Promise} - Promesa con resultado de la operación
     */
    const guardarEnJSONDirecto = async (datos) => {
        try {
            const respuesta = await fetch('api.php?action=guardar_json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ datos: datos })
            });
            
            return await respuesta.json();
        } catch (error) {
            console.error("Error guardando en JSON:", error);
            return { success: false, error: error.message };
        }
    };

    // ========== AGREGAR ANIMACIONES CSS DINÁMICAMENTE ==========
    
    // Crear y agregar estilos CSS para animaciones de mensajes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    console.log("Event listeners configurados correctamente");
});