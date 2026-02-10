// ============================================
// CALCULADORA COMPLETA - LÓGICA PRINCIPAL
// ============================================

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // 1. VARIABLES GLOBALES Y ESTADO
    // ============================================
    
    // Referencias a elementos del DOM
    const display = document.getElementById('display');
    const historyDisplay = document.getElementById('history');
    const recentHistory = document.getElementById('recentHistory');
    const memoryIndicator = document.getElementById('memoryIndicator');
    const errorIndicator = document.getElementById('errorIndicator');
    const clearHistoryBtn = document.getElementById('clearHistory');
    const themeToggle = document.getElementById('themeToggle');
    const resetCalculatorBtn = document.getElementById('resetCalculator');
    
    // Estado de la calculadora
    let currentValue = '0';          // Valor actual en pantalla
    let previousValue = null;        // Valor anterior
    let currentOperator = null;      // Operador actual (+, -, ×, ÷)
    let waitingForNewValue = false;  // ¿Esperando nuevo valor después de operador?
    let memoryValue = 0;             // Valor almacenado en memoria
    let calculationHistory = [];     // Historial de cálculos
    let isErrorState = false;        // ¿Está en estado de error?
    
    // ============================================
    // 2. FUNCIONES DE MANEJO DE PANTALLA
    // ============================================
    
    /**
     * Actualiza el contenido de la pantalla principal
     * @param {string} value - Valor a mostrar
     */
    function updateDisplay(value) {
        // Limitar la longitud para evitar desbordamiento
        if (value.length > 12) {
            // Usar notación científica para números muy largos
            const num = parseFloat(value);
            display.textContent = num.toExponential(6);
        } else {
            // Formatear números grandes con separadores de miles
            const formattedValue = formatNumber(value);
            display.textContent = formattedValue;
        }
    }
    
    /**
     * Formatea un número con separadores de miles
     * @param {string} value - Número a formatear
     * @returns {string} Número formateado
     */
    function formatNumber(value) {
        // Si no es un número válido, devolver el valor original
        if (value === 'Error' || value === 'Infinity' || isNaN(value)) {
            return value;
        }
        
        // Separar parte entera y decimal
        const parts = value.split('.');
        let integerPart = parts[0];
        const decimalPart = parts.length > 1 ? '.' + parts[1] : '';
        
        // Añadir separadores de miles
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        return integerPart + decimalPart;
    }
    
    /**
     * Actualiza el historial en pantalla
     */
    function updateHistoryDisplay() {
        if (previousValue !== null && currentOperator !== null) {
            historyDisplay.textContent = `${previousValue} ${currentOperator}`;
        } else {
            historyDisplay.textContent = '';
        }
    }
    
    /**
     * Actualiza el historial reciente en el panel lateral
     */
    function updateRecentHistory() {
        // Limpiar el contenido actual
        recentHistory.innerHTML = '';
        
        if (calculationHistory.length === 0) {
            recentHistory.innerHTML = '<p class="empty-history">No hay operaciones recientes</p>';
            return;
        }
        
        // Mostrar las últimas 5 operaciones (las más recientes primero)
        const reversedHistory = [...calculationHistory].reverse().slice(0, 5);
        
        reversedHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <span class="history-expression">${item.expression}</span>
                <span class="history-result">= ${item.result}</span>
            `;
            recentHistory.appendChild(historyItem);
        });
    }
    
    /**
     * Añade una operación al historial
     * @param {string} expression - Expresión matemática
     * @param {string} result - Resultado de la operación
     */
    function addToHistory(expression, result) {
        calculationHistory.push({
            expression: expression,
            result: result,
            timestamp: new Date().toLocaleTimeString()
        });
        
        // Mantener solo las últimas 50 operaciones
        if (calculationHistory.length > 50) {
            calculationHistory.shift();
        }
        
        updateRecentHistory();
    }
    
    // ============================================
    // 3. FUNCIONES DE MANEJO DE MEMORIA
    // ============================================
    
    /**
     * Actualiza el indicador de memoria
     */
    function updateMemoryIndicator() {
        if (memoryValue !== 0) {
            memoryIndicator.style.display = 'inline-flex';
            memoryIndicator.title = `Memoria: ${memoryValue}`;
        } else {
            memoryIndicator.style.display = 'none';
        }
    }
    
    /**
     * Maneja las operaciones de memoria
     * @param {string} action - Acción a realizar (memory-clear, memory-recall, etc.)
     */
    function handleMemoryAction(action) {
        switch(action) {
            case 'memory-clear':
                memoryValue = 0;
                showNotification('Memoria borrada');
                break;
                
            case 'memory-recall':
                if (memoryValue !== 0) {
                    currentValue = memoryValue.toString();
                    updateDisplay(currentValue);
                    showNotification(`Memoria recuperada: ${memoryValue}`);
                } else {
                    showNotification('La memoria está vacía', 'error');
                }
                break;
                
            case 'memory-add':
                if (!isErrorState) {
                    memoryValue += parseFloat(currentValue) || 0;
                    showNotification(`Sumado a memoria: ${formatNumber(currentValue)}`);
                }
                break;
                
            case 'memory-subtract':
                if (!isErrorState) {
                    memoryValue -= parseFloat(currentValue) || 0;
                    showNotification(`Restado de memoria: ${formatNumber(currentValue)}`);
                }
                break;
        }
        
        updateMemoryIndicator();
    }
    
    // ============================================
    // 4. FUNCIONES MATEMÁTICAS
    // ============================================
    
    /**
     * Realiza el cálculo basado en el operador
     * @param {number} a - Primer número
     * @param {number} b - Segundo número
     * @param {string} operator - Operador (+, -, ×, ÷)
     * @returns {number|string} Resultado o mensaje de error
     */
    function calculate(a, b, operator) {
        a = parseFloat(a);
        b = parseFloat(b);
        
        switch(operator) {
            case 'add':
                return a + b;
                
            case 'subtract':
                return a - b;
                
            case 'multiply':
                return a * b;
                
            case 'divide':
                if (b === 0) {
                    return 'Error';
                }
                return a / b;
                
            case 'percentage':
                return (a * b) / 100;
                
            default:
                return b;
        }
    }
    
    /**
     * Realiza cálculos científicos
     * @param {string} action - Acción a realizar
     * @param {number} value - Valor sobre el que operar
     * @returns {number|string} Resultado
     */
    function scientificCalculation(action, value) {
        const num = parseFloat(value);
        
        switch(action) {
            case 'square-root':
                if (num < 0) {
                    return 'Error';
                }
                return Math.sqrt(num);
                
            case 'square':
                return num * num;
                
            case 'sin':
                return Math.sin(num * (Math.PI / 180)); // Convertir a radianes
                
            case 'cos':
                return Math.cos(num * (Math.PI / 180));
                
            case 'tan':
                return Math.tan(num * (Math.PI / 180));
                
            case 'pi':
                return Math.PI;
                
            case 'factorial':
                if (num < 0 || !Number.isInteger(num)) {
                    return 'Error';
                }
                if (num === 0 || num === 1) return 1;
                let result = 1;
                for (let i = 2; i <= num; i++) {
                    result *= i;
                }
                return result;
                
            default:
                return num;
        }
    }
    
    // ============================================
    // 5. MANEJO DE ENTRADA DE NÚMEROS Y OPERACIONES
    // ============================================
    
    /**
     * Maneja la entrada de un número
     * @param {string} number - Número a añadir
     */
    function inputNumber(number) {
        // Si hay un error, reiniciar
        if (isErrorState) {
            resetCalculator();
            isErrorState = false;
            errorIndicator.style.display = 'none';
        }
        
        // Si estamos esperando un nuevo valor (después de operador)
        if (waitingForNewValue) {
            currentValue = number;
            waitingForNewValue = false;
        } else {
            // Evitar múltiples ceros al inicio
            if (currentValue === '0' && number !== '.') {
                currentValue = number;
            } else {
                // Limitar la longitud del número
                if (currentValue.replace('.', '').length < 12) {
                    currentValue += number;
                }
            }
        }
        
        updateDisplay(currentValue);
    }
    
    /**
     * Maneja la entrada del punto decimal
     */
    function inputDecimal() {
        if (isErrorState) return;
        
        if (waitingForNewValue) {
            currentValue = '0.';
            waitingForNewValue = false;
        } else if (!currentValue.includes('.')) {
            currentValue += '.';
        }
        
        updateDisplay(currentValue);
    }
    
    /**
     * Maneja la entrada de un operador
     * @param {string} operator - Operador a aplicar
     */
    function inputOperator(operator) {
        if (isErrorState) return;
        
        const inputValue = parseFloat(currentValue);
        
        // Si ya hay un operador pendiente, calcular primero
        if (previousValue !== null && currentOperator !== null && !waitingForNewValue) {
            const result = calculate(previousValue, inputValue, currentOperator);
            
            // Manejar errores
            if (result === 'Error' || result === 'Infinity' || isNaN(result)) {
                handleError();
                return;
            }
            
            // Añadir al historial
            const operatorSymbol = getOperatorSymbol(currentOperator);
            addToHistory(`${previousValue} ${operatorSymbol} ${inputValue}`, result.toString());
            
            currentValue = result.toString();
            updateDisplay(currentValue);
        }
        
        // Preparar para el siguiente valor
        previousValue = parseFloat(currentValue);
        currentOperator = operator;
        waitingForNewValue = true;
        
        updateHistoryDisplay();
    }
    
    /**
     * Realiza el cálculo final
     */
    function performCalculation() {
        if (previousValue === null || currentOperator === null || waitingForNewValue) {
            return;
        }
        
        const inputValue = parseFloat(currentValue);
        const result = calculate(previousValue, inputValue, currentOperator);
        
        // Manejar errores
        if (result === 'Error' || result === 'Infinity' || isNaN(result)) {
            handleError();
            return;
        }
        
        // Añadir al historial
        const operatorSymbol = getOperatorSymbol(currentOperator);
        addToHistory(`${previousValue} ${operatorSymbol} ${inputValue}`, result.toString());
        
        // Actualizar pantalla
        currentValue = result.toString();
        updateDisplay(currentValue);
        
        // Reiniciar estado
        previousValue = null;
        currentOperator = null;
        waitingForNewValue = true;
        updateHistoryDisplay();
    }
    
    /**
     * Obtiene el símbolo del operador para mostrar
     * @param {string} operator - Operador interno
     * @returns {string} Símbolo del operador
     */
    function getOperatorSymbol(operator) {
        const symbols = {
            'add': '+',
            'subtract': '−',
            'multiply': '×',
            'divide': '÷',
            'percentage': '%'
        };
        return symbols[operator] || operator;
    }
    
    // ============================================
    // 6. FUNCIONES DE LIMPIEZA Y RESET
    // ============================================
    
    /**
     * Limpia la entrada actual
     */
    function clearEntry() {
        currentValue = '0';
        updateDisplay(currentValue);
    }
    
    /**
     * Limpia todo (reset completo)
     */
    function clearAll() {
        currentValue = '0';
        previousValue = null;
        currentOperator = null;
        waitingForNewValue = false;
        isErrorState = false;
        errorIndicator.style.display = 'none';
        updateDisplay(currentValue);
        updateHistoryDisplay();
    }
    
    /**
     * Elimina el último dígito
     */
    function deleteLastDigit() {
        if (isErrorState) {
            clearAll();
            return;
        }
        
        if (currentValue.length > 1) {
            currentValue = currentValue.slice(0, -1);
        } else {
            currentValue = '0';
        }
        
        updateDisplay(currentValue);
    }
    
    /**
     * Cambia el signo del número actual
     */
    function toggleSign() {
        if (isErrorState) return;
        
        if (currentValue !== '0') {
            if (currentValue.startsWith('-')) {
                currentValue = currentValue.substring(1);
            } else {
                currentValue = '-' + currentValue;
            }
            updateDisplay(currentValue);
        }
    }
    
    /**
     * Reinicia completamente la calculadora
     */
    function resetCalculator() {
        clearAll();
        memoryValue = 0;
        calculationHistory = [];
        updateMemoryIndicator();
        updateRecentHistory();
        showNotification('Calculadora reiniciada');
    }
    
    // ============================================
    // 7. MANEJO DE ERRORES Y NOTIFICACIONES
    // ============================================
    
    /**
     * Maneja un error en la calculadora
     */
    function handleError() {
        currentValue = 'Error';
        isErrorState = true;
        errorIndicator.style.display = 'inline-flex';
        updateDisplay(currentValue);
        showNotification('Error matemático', 'error');
    }
    
    /**
     * Muestra una notificación temporal
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación (success, error, info)
     */
    function showNotification(message, type = 'success') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
        `;
        
        // Colores según tipo
        if (type === 'success') {
            notification.style.backgroundColor = '#27ae60';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#e74c3c';
        } else {
            notification.style.backgroundColor = '#3498db';
        }
        
        // Añadir al documento
        document.body.appendChild(notification);
        
        // Eliminar después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // ============================================
    // 8. MANEJO DE TECLADO
    // ============================================
    
    /**
     * Maneja la entrada por teclado
     * @param {KeyboardEvent} event - Evento de teclado
     */
    function handleKeyboardInput(event) {
        const key = event.key;
        
        // Prevenir comportamiento por defecto para teclas de la calculadora
        if ('0123456789.+-*/=EnterEscapeDeleteBackspace'.includes(key)) {
            event.preventDefault();
        }
        
        // Mapeo de teclas a funciones
        switch(key) {
            case '0': case '1': case '2': case '3': case '4':
            case '5': case '6': case '7': case '8': case '9':
                inputNumber(key);
                break;
                
            case '.':
            case ',':
                inputDecimal();
                break;
                
            case '+':
                inputOperator('add');
                break;
                
            case '-':
                inputOperator('subtract');
                break;
                
            case '*':
                inputOperator('multiply');
                break;
                
            case '/':
                inputOperator('divide');
                break;
                
            case '=':
            case 'Enter':
                performCalculation();
                break;
                
            case 'Escape':
            case 'c':
            case 'C':
                clearAll();
                break;
                
            case 'Delete':
            case 'Backspace':
                deleteLastDigit();
                break;
                
            case '%':
                inputOperator('percentage');
                break;
        }
    }
    
    // ============================================
    // 9. CONFIGURACIÓN DE EVENT LISTENERS
    // ============================================
    
    /**
     * Configura todos los event listeners
     */
    function setupEventListeners() {
        // Event listeners para botones de números
        document.querySelectorAll('.number-btn').forEach(button => {
            button.addEventListener('click', () => {
                inputNumber(button.getAttribute('data-number'));
            });
        });
        
        // Event listeners para botones de operaciones
        document.querySelectorAll('.operation-btn').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.getAttribute('data-action');
                if (['percentage', 'square-root', 'square'].includes(action)) {
                    // Operacione

