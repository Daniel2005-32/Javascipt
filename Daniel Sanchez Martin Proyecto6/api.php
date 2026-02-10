<?php
// api.php - API que maneja tanto operaciones con Base de Datos como con archivos JSON

// ========== CONFIGURACIÓN DE CONEXIÓN ==========
$servername = "localhost";       // Servidor de base de datos
$username = "daniel_clases";     // Usuario de la base de datos
$password = "lanza.pass";        // Contraseña del usuario
$database = "formulario";        // Nombre de la base de datos
$jsonFile = 'datos.json';        // Ruta al archivo JSON

// ========== CONFIGURACIÓN DE CABECERAS HTTP ==========

// Permitir CORS (Cross-Origin Resource Sharing) para peticiones desde cualquier origen
header('Access-Control-Allow-Origin: *');
// Especificar que la respuesta será en formato JSON
header('Content-Type: application/json; charset=utf-8');

// ========== OBTENER PARÁMETROS DE LA PETICIÓN ==========

// Obtener acción solicitada desde parámetro GET
$action = $_GET['action'] ?? '';
// Obtener datos enviados en el cuerpo de la petición POST (en formato JSON)
$postData = json_decode(file_get_contents('php://input'), true) ?? [];

// ========== FUNCIÓN PARA CONECTAR A LA BASE DE DATOS ==========

/**
 * Establece conexión con la base de datos MySQL usando PDO
 * @return PDO|null - Objeto de conexión PDO o null si falla
 */
function conectarBD() {
    global $servername, $username, $password, $database;
    
    try {
        // Crear conexión PDO con configuración UTF-8
        $conn = new PDO("mysql:host=$servername;dbname=$database;charset=utf8mb4", $username, $password);
        // Configurar PDO para que lance excepciones en errores
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch(PDOException $e) {
        // Registrar error en log sin exponer detalles al cliente
        error_log("Error conexión BD: " . $e->getMessage());
        return null;
    }
}

// ========== FUNCIÓN PARA INICIALIZAR LA BASE DE DATOS ==========

/**
 * Crea la base de datos y tabla si no existen
 * @return bool - true si se inicializó correctamente, false si hubo error
 */
function inicializarBD() {
    global $servername, $username, $password, $database;
    
    try {
        // Conectar al servidor MySQL sin especificar base de datos
        $conn = new PDO("mysql:host=$servername", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Crear base de datos si no existe
        $conn->exec("CREATE DATABASE IF NOT EXISTS $database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        // Usar la base de datos creada
        $conn->exec("USE $database");
        
        // Crear tabla de usuarios si no existe
        $sql = "CREATE TABLE IF NOT EXISTS usuarios (
            dni VARCHAR(9) PRIMARY KEY,                 // DNI como clave primaria
            nombre VARCHAR(50) NOT NULL,               // Nombre obligatorio
            apellido VARCHAR(100) NOT NULL,            // Apellido obligatorio
            fecha_nacimiento VARCHAR(10),               // Fecha en formato texto
            codigo_postal VARCHAR(5),                   // Código postal de 5 dígitos
            email VARCHAR(100),                         // Correo electrónico
            telefono_fijo VARCHAR(9),                   // Teléfono fijo
            telefono_movil VARCHAR(9),                  // Teléfono móvil
            tarjeta_credito VARCHAR(16),                // Tarjeta de crédito
            iban VARCHAR(24),                           // IBAN
            contrasena VARCHAR(255),                    // Contraseña (hash en producción)
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP // Fecha automática de creación
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";       // Motor InnoDB con UTF-8
        
        $conn->exec($sql);
        return true;
        
    } catch(PDOException $e) {
        error_log("Error inicializar BD: " . $e->getMessage());
        return false;
    }
}

// ========== FUNCIÓN PARA ACTUALIZAR ARCHIVO JSON ==========

/**
 * Actualiza el archivo JSON con datos de un usuario específico
 * @param string $dni - DNI del usuario a actualizar
 * @param array $datosCompletos - Todos los datos del usuario
 * @return int|false - Bytes escritos o false si error
 */
function actualizarJSON($dni, $datosCompletos) {
    global $jsonFile;
    
    // Leer contenido actual del archivo JSON
    $jsonActual = [];
    if (file_exists($jsonFile)) {
        $contenido = file_get_contents($jsonFile);
        $jsonActual = json_decode($contenido, true) ?: []; // Array vacío si falla decode
    }
    
    // Buscar si el DNI ya existe en el JSON actual
    $dniEncontrado = false;
    if (isset($jsonActual['dni']) && $jsonActual['dni'] === $dni) {
        // Si existe, fusionar datos antiguos con nuevos
        $jsonActual = array_merge($jsonActual, $datosCompletos);
        $dniEncontrado = true;
    }
    
    // Si no se encontró el DNI, crear nuevo registro
    if (!$dniEncontrado) {
        $jsonActual = $datosCompletos;
    }
    
    // Guardar archivo JSON con formato legible
    return file_put_contents(
        $jsonFile, 
        json_encode($jsonActual, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
    );
}

// ========== FUNCIÓN PARA OBTENER DATOS DEL JSON ==========

/**
 * Obtiene datos de un usuario desde el archivo JSON por DNI
 * @param string $dni - DNI a buscar
 * @return array|null - Datos del usuario o null si no existe
 */
function obtenerDelJSON($dni) {
    global $jsonFile;
    
    // Verificar que el archivo existe
    if (!file_exists($jsonFile)) {
        return null;
    }
    
    // Leer y decodificar el JSON
    $contenido = file_get_contents($jsonFile);
    $datos = json_decode($contenido, true);
    
    // Solo devolver si el DNI coincide exactamente
    if ($datos && isset($datos['dni']) && $datos['dni'] === $dni) {
        return $datos;
    }
    
    return null;
}

// ========== MANEJADOR DE ACCIONES ==========

switch ($action) {
    
    // ========== PRUEBA SIMPLE ==========
    case 'test':
        // Respuesta de prueba para verificar que la API funciona
        echo json_encode([
            'status' => 'ok',
            'message' => 'API funcionando',
            'time' => date('Y-m-d H:i:s'), // Hora actual del servidor
            'modo' => 'BD + JSON'           // Modo de operación
        ]);
        break;
        
    // ========== PUBLICAR (prueba simple) ==========
    case 'publicar':
        // Acción simple de prueba que solo recibe datos
        if (!empty($postData['datos'])) {
            echo json_encode([
                'success' => true,
                'message' => 'Datos recibidos en PHP (solo prueba)',
                'timestamp' => time() // Timestamp UNIX
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'No hay datos']);
        }
        break;
        
    // ========== GUARDAR EN BASE DE DATOS + ACTUALIZAR JSON ==========
    case 'guardar_bd':
        // Registrar datos recibidos para depuración
        error_log("Datos recibidos en guardar_bd: " . print_r($postData, true));
        
        // Verificar que se recibieron datos
        if (empty($postData['datos'])) {
            echo json_encode(['success' => false, 'error' => 'No se recibieron datos']);
            break;
        }
        
        // Inicializar base de datos (crear si no existe)
        if (!inicializarBD()) {
            echo json_encode(['success' => false, 'error' => 'Error al inicializar BD']);
            break;
        }
        
        // Conectar a la base de datos
        $conn = conectarBD();
        if (!$conn) {
            echo json_encode(['success' => false, 'error' => 'Error de conexión a BD']);
            break;
        }
        
        $datos = $postData['datos'];
        
        // Validar campos mínimos requeridos
        if (empty($datos['dni']) || empty($datos['nombre']) || empty($datos['apellido'])) {
            echo json_encode([
                'success' => false, 
                'error' => 'Faltan campos requeridos (DNI, Nombre, Apellido)'
            ]);
            break;
        }
        
        try {
            // SQL para insertar o actualizar (UPSERT)
            $sql = "INSERT INTO usuarios (
                dni, 
                nombre, 
                apellido, 
                fecha_nacimiento, 
                codigo_postal, 
                email, 
                telefono_fijo, 
                telefono_movil, 
                tarjeta_credito, 
                iban, 
                contrasena
            ) VALUES (
                :dni, 
                :nombre, 
                :apellido, 
                :fecha_nacimiento, 
                :codigo_postal, 
                :email, 
                :telefono_fijo, 
                :telefono_movil, 
                :tarjeta_credito, 
                :iban, 
                :contrasena
            ) ON DUPLICATE KEY UPDATE 
                nombre = VALUES(nombre),
                apellido = VALUES(apellido),
                fecha_nacimiento = VALUES(fecha_nacimiento),
                codigo_postal = VALUES(codigo_postal),
                email = VALUES(email),
                telefono_fijo = VALUES(telefono_fijo),
                telefono_movil = VALUES(telefono_movil),
                tarjeta_credito = VALUES(tarjeta_credito),
                iban = VALUES(iban),
                contrasena = VALUES(contrasena)";
            
            // Preparar sentencia SQL
            $stmt = $conn->prepare($sql);
            
            // Parámetros para la consulta
            $params = [
                ':dni' => $datos['dni'],
                ':nombre' => $datos['nombre'],
                ':apellido' => $datos['apellido'],
                ':fecha_nacimiento' => $datos['fecha'] ?? '', // Valor por defecto si no existe
                ':codigo_postal' => $datos['cp'] ?? '',
                ':email' => $datos['correo'] ?? '',
                ':telefono_fijo' => $datos['telefono'] ?? '',
                ':telefono_movil' => $datos['movil'] ?? '',
                ':tarjeta_credito' => $datos['tarjeta'] ?? '',
                ':iban' => $datos['iban'] ?? '',
                ':contrasena' => $datos['contrasenha'] ?? ''
            ];
            
            // Registrar parámetros para depuración
            error_log("Parámetros para BD: " . print_r($params, true));
            
            // Ejecutar consulta
            if ($stmt->execute($params)) {
                $rowCount = $stmt->rowCount(); // Filas afectadas
                
                // ===== ACTUALIZAR ARCHIVO JSON EN PARALELO =====
                $datosParaJSON = [
                    'nombre' => $datos['nombre'],
                    'apellido' => $datos['apellido'],
                    'dni' => $datos['dni'],
                    'fecha' => $datos['fecha'] ?? '',
                    'cp' => $datos['cp'] ?? '',
                    'correo' => $datos['correo'] ?? '',
                    'telefono' => $datos['telefono'] ?? '',
                    'movil' => $datos['movil'] ?? '',
                    'tarjeta' => $datos['tarjeta'] ?? '',
                    'iban' => $datos['iban'] ?? '',
                    'contrasenha' => $datos['contrasenha'] ?? ''
                ];
                
                // Intentar actualizar JSON y registrar resultado
                if (actualizarJSON($datos['dni'], $datosParaJSON)) {
                    $mensajeJSON = " y archivo JSON actualizado";
                } else {
                    $mensajeJSON = " (error al actualizar JSON)";
                }
                // ===============================================
                
                // Respuesta de éxito
                echo json_encode([
                    'success' => true, 
                    'message' => "Datos guardados en BD. Filas afectadas: $rowCount$mensajeJSON",
                    'dni' => $datos['dni'],
                    'json_actualizado' => true
                ]);
            } else {
                echo json_encode(['success' => false, 'error' => 'Error al ejecutar consulta en BD']);
            }
            
        } catch(PDOException $e) {
            // Manejar errores de base de datos
            error_log("Error PDO: " . $e->getMessage());
            echo json_encode([
                'success' => false, 
                'error' => 'Error de base de datos: ' . $e->getMessage()
            ]);
        }
        break;
        
    // ========== OBTENER DE BASE DE DATOS ==========
    case 'obtener_bd':
        $dni = $_GET['dni'] ?? '';
        
        // Verificar que se proporcionó DNI
        if (empty($dni)) {
            echo json_encode(['error' => 'DNI no proporcionado']);
            break;
        }
        
        // PRIMERO: intentar obtener del archivo JSON (más rápido)
        $datosJSON = obtenerDelJSON($dni);
        if ($datosJSON) {
            echo json_encode($datosJSON);
            break;
        }
        
        // SEGUNDO: si no está en JSON, buscar en base de datos
        $conn = conectarBD();
        if (!$conn) {
            echo json_encode(['error' => 'Error de conexión a BD']);
            break;
        }
        
        try {
            // Consulta para buscar usuario por DNI
            $stmt = $conn->prepare("SELECT * FROM usuarios WHERE dni = :dni");
            $stmt->execute([':dni' => $dni]);
            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($usuario) {
                // Mapear nombres de campos de BD a nombres del formulario
                $response = [
                    'nombre' => $usuario['nombre'],
                    'apellido' => $usuario['apellido'],
                    'dni' => $usuario['dni'],
                    'fecha' => $usuario['fecha_nacimiento'],
                    'cp' => $usuario['codigo_postal'],
                    'correo' => $usuario['email'],
                    'telefono' => $usuario['telefono_fijo'],
                    'movil' => $usuario['telefono_movil'],
                    'tarjeta' => $usuario['tarjeta_credito'],
                    'iban' => $usuario['iban'],
                    'contrasenha' => $usuario['contrasena'],
                    'fecha_creacion' => $usuario['fecha_creacion'] // Campo adicional
                ];
                echo json_encode($response);
            } else {
                echo json_encode(['error' => "No se encontró usuario con DNI: $dni (ni en JSON ni en BD)"]);
            }
            
        } catch(PDOException $e) {
            echo json_encode(['error' => 'Error de BD: ' . $e->getMessage()]);
        }
        break;
        
    // ========== OBTENER DESDE PHP (solo del JSON) ==========
    case 'obtener':
        $dni = $_GET['dni'] ?? '';
        
        if (empty($dni)) {
            echo json_encode(['error' => 'DNI no proporcionado']);
            break;
        }
        
        // Solo obtener del archivo JSON (no busca en BD)
        $datos = obtenerDelJSON($dni);
        if ($datos) {
            echo json_encode($datos);
        } else {
            echo json_encode(['error' => "No se encontró usuario con DNI: $dni en el JSON"]);
        }
        break;
        
    // ========== LISTAR TODOS LOS USUARIOS (para debug) ==========
    case 'listar_todos':
        $conn = conectarBD();
        if (!$conn) {
            echo json_encode(['error' => 'Error de conexión']);
            break;
        }
        
        try {
            // Consulta para obtener todos los usuarios ordenados por fecha
            $stmt = $conn->query("SELECT * FROM usuarios ORDER BY fecha_creacion DESC");
            $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'count' => count($usuarios), // Número total de usuarios
                'usuarios' => $usuarios     // Array con todos los usuarios
            ]);
            
        } catch(PDOException $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;
        
    // ========== ACCIÓN POR DEFECTO (si no se reconoce la acción) ==========
    default:
        echo json_encode([
            'error' => 'Acción no válida',
            'acciones_disponibles' => [
                'test',           // Prueba de conexión
                'publicar',       // Recibir datos (prueba)
                'guardar_bd',     // Guardar en BD + JSON
                'obtener_bd',     // Obtener (JSON primero, luego BD)
                'obtener',        // Obtener solo de JSON
                'listar_todos'    // Listar todos los usuarios (debug)
            ]
        ]);
        break;
}
?>