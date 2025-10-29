// URL del servidor
const API_URL = 'http://localhost:5000/api';

// Cuando carga la pagina
window.onload = function() {
  cargarMesas();
  cargarEstadisticas();
};

// Funcion para cargar las mesas
function cargarMesas() {
  fetch(API_URL + '/mesas')
    .then(response => response.json())
    .then(mesas => {
      mostrarMesas(mesas);
    })
    .catch(error => {
      console.log('Error:', error);
      alert('Error al cargar las mesas. Asegurate de que el servidor este corriendo.');
    });
}

// Funcion para mostrar las mesas
function mostrarMesas(mesas) {
  const contenedor = document.getElementById('contenedor-mesas');
  contenedor.innerHTML = '';
  
  for (let i = 0; i < mesas.length; i++) {
    const mesa = mesas[i];
    
    // Crear elemento mesa
    const div = document.createElement('a');
    div.href = 'mesa.html?numero=' + mesa.numero;
    div.className = 'mesa ' + mesa.forma + ' ' + mesa.color;
    
    // Si esta ocupada agregar clase
    if (mesa.estado === 'Ocupada') {
      div.className += ' ocupada';
    } else {
      div.className += ' libre';
    }
    
    // Posicion de la mesa
    div.style.top = mesa.posicion_top + 'px';
    div.style.left = mesa.posicion_left + 'px';
    div.style.width = mesa.ancho + 'px';
    div.style.height = mesa.alto + 'px';
    div.style.lineHeight = mesa.alto + 'px';
    
    div.textContent = 'Mesa ' + mesa.numero;
    
    contenedor.appendChild(div);
  }
}

// Funcion para cargar estadisticas
function cargarEstadisticas() {
  fetch(API_URL + '/estadisticas')
    .then(response => response.json())
    .then(stats => {
      const estadisticas = document.getElementById('estadisticas');
      estadisticas.innerHTML = 
        '<span>Total: ' + stats.total_mesas + ' mesas</span>' +
        '<span>Ocupadas: ' + stats.mesas_ocupadas + '</span>' +
        '<span>Libres: ' + stats.mesas_libres + '</span>' +
        '<span>Clientes: ' + stats.total_clientes + '</span>';
    })
    .catch(error => {
      console.log('Error al cargar estadisticas:', error);
    });
}
