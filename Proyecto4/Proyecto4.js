// Ejecuta cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', () => {

  const fileNameInput = document.getElementById('fileNameInput'); // Input para nombre de elemento
  const filterInput = document.getElementById('filterInput');     // Input para filtrar

  // Crea un archivo dentro de una carpeta
  function createFile(parentUl) {
    const fileName = fileNameInput.value.trim();
    if (!fileName) {
      alert('Por favor, escribe un nombre de archivo.');
      return;
    }

    // Verifica si ya existe un archivo con ese nombre en la misma carpeta
    const exists = Array.from(parentUl.querySelectorAll(':scope > li > .file-item > span'))
      .some(span => span.textContent === fileName);
    if (exists) {
      alert('Ya existe un archivo con ese nombre.');
      return;
    }

    // Crea elementos HTML para el archivo
    const li = document.createElement('li');
    li.classList.add('file');

    const div = document.createElement('div');
    div.classList.add('file-item');

    // Botón para eliminar
    const delBtn = document.createElement('img');
    delBtn.src = 'eliminar.png';
    delBtn.alt = 'eliminar.png';
    delBtn.classList.add('deleteBtn');

    // Nombre del archivo
    const span = document.createElement('span');
    span.textContent = fileName;
    span.classList.add('file-name');

    // Ensambla los elementos
    div.append(delBtn, span);
    li.append(div);
    parentUl.append(li);

    // Evento para eliminar archivo
    delBtn.addEventListener('click', () => {
      li.remove();
    });

    // Limpia el input
    fileNameInput.value = '';
  }

  // Crea una nueva carpeta
  function createFolder(name, parentUl) {
    // Verifica si ya existe una carpeta con ese nombre
    const existing = Array.from(parentUl.querySelectorAll(':scope > li > .folder-item > .folder-name'))
      .some(span => span.textContent === name);
    if (existing) {
      alert('Ya existe una carpeta con ese nombre.');
      return;
    }

    // Crea elementos HTML para la carpeta
    const li = document.createElement('li');
    li.classList.add('folder');

    const div = document.createElement('div');
    div.classList.add('folder-item');

    // Botón eliminar
    const delBtn = document.createElement('img');
    delBtn.src = 'eliminar.png';
    delBtn.alt = 'Eliminar';
    delBtn.classList.add('deleteBtn');

    // Icono de carpeta
    const img = document.createElement('img');
    img.src = 'carpeta.png';
    img.alt = 'Carpeta';
    img.classList.add('folder-icon');

    // Nombre de la carpeta
    const span = document.createElement('span');
    span.textContent = name;
    span.classList.add('folder-name');

    // Botón para agregar contenido
    const addBtn = document.createElement('button');
    addBtn.textContent = '+';
    addBtn.classList.add('addBtn');

    // Contenedor para hijos (subcarpetas o archivos)
    const childrenUl = document.createElement('ul');
    childrenUl.classList.add('children');

    // Ensambla los elementos
    div.append(delBtn, img, span, addBtn);
    li.append(div, childrenUl);
    parentUl.append(li);

    // Click en icono de carpeta crea un archivo dentro
    img.addEventListener('click', () => createFile(childrenUl));

    // Click en botón '+' crea una subcarpeta
    addBtn.addEventListener('click', () => {
      const folderName = fileNameInput.value.trim();
      if (!folderName) {
        alert('Escribe un nombre en el campo de texto para crear la carpeta.');
        return;
      }
      createFolder(folderName, childrenUl);
      fileNameInput.value = '';
    });

    // Click en botón eliminar
    delBtn.addEventListener('click', () => {
      // Solo elimina si la carpeta está vacía
      if (childrenUl.children.length === 0) {
        li.remove();
      } else {
        alert('No se puede eliminar: la carpeta contiene archivos o subcarpetas.');
      }
    });
  }

  // Filtra elementos del árbol según texto ingresado
  function filterElements(query) {
    query = query.toLowerCase().trim();
    const allItems = document.querySelectorAll('.folder, .file');

    // Muestra/oculta elementos según si coinciden con la búsqueda
    allItems.forEach(item => {
      const name = item.querySelector('span').textContent.toLowerCase();
      item.style.display = name.includes(query) || query === '' ? '' : 'none';
    });
  }

  // Autocompleta el input de filtro al presionar Tab
  function autocomplete(input, e) {
    const query = input.value.toLowerCase().trim();
    if (!query) return;

    // Obtiene todos los nombres en el árbol
    const allNames = Array.from(document.querySelectorAll('.folder-name, .file-name'))
      .map(span => span.textContent);

    // Encuentra nombres que comiencen con el texto ingresado
    const matches = allNames.filter(name => name.toLowerCase().startsWith(query));

    // Si hay exactamente una coincidencia, autocompleta
    if (matches.length === 1) {
      e.preventDefault(); // Evita comportamiento normal de Tab
      input.value = matches[0];
      filterElements(matches[0]); // Aplica filtro con el nombre autocompletado
    }
  }

  // Configura el nodo raíz del árbol
  const root = document.querySelector('#root > li');
  const rootImg = root.querySelector('.folder-icon');
  const rootAddBtn = root.querySelector('.addBtn');
  const rootChildren = root.querySelector('.children');
  
  // Click en icono de carpeta raíz crea archivo
  rootImg.addEventListener('click', () => createFile(rootChildren));
  
  // Click en botón '+' de la raíz crea carpeta
  rootAddBtn.addEventListener('click', () => {
    const folderName = fileNameInput.value.trim();
    if (!folderName) {
      alert('Escribe un nombre en el campo de texto para crear una carpeta.');
      return;
    }
    createFolder(folderName, rootChildren);
    fileNameInput.value = '';
  });

  // Filtra en tiempo real al escribir
  filterInput.addEventListener('input', () => filterElements(filterInput.value));
  
  // Autocompleta al presionar Tab
  filterInput.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') autocomplete(filterInput, e);
  });
});