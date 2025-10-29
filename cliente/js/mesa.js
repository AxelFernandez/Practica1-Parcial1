// URL del servidor
const API_URL = 'http://localhost:5000/api';

let numeroMesa = 0;

// Cuando carga la pagina
window.onload = function() {
  // Obtener numero de mesa de la URL
  const params = new URLSearchParams(window.location.search);
  numeroMesa = params.get('numero');
  
  if (numeroMesa) {
    cargarMesa();
  } else {
    alert('No se especifico numero de mesa');
  }
  
  // Configurar formulario
  const form = document.getElementById('form-mesa');
  form.onsubmit = function(e) {
    e.preventDefault();
    guardarMesa();
  };
};

// Cargar informacion de la mesa
function cargarMesa() {
  fetch(API_URL + '/mesas/' + numeroMesa)
    .then(response => response.json())
    .then(mesa => {
      mostrarMesa(mesa);
    })
    .catch(error => {
      console.log('Error:', error);
      alert('Error al cargar la mesa');
    });
}

// Mostrar informacion de la mesa
function mostrarMesa(mesa) {
  // Cambiar color de fondo
  const colores = {
    'azul': '#3498db',
    'verde': '#27ae60',
    'naranja': '#e67e22',
    'roja': '#c0392b',
    'violeta': '#8e44ad',
    'turquesa': '#1abc9c',
    'gris': '#7f8c8d',
    'rosa': '#fd79a8',
    'amarillo': '#f1c40f'
  };
  
  document.body.style.backgroundColor = colores[mesa.color];
  
  // Titulo
  document.getElementById('titulo-mesa').textContent = 'Mesa ' + mesa.numero;
  
  // Informacion
  const info = document.getElementById('info-mesa');
  
  if (mesa.estado === 'Ocupada') {
    info.innerHTML = 
      '<p><strong>Estado:</strong> ' + mesa.estado + '</p>' +
      '<p><strong>Mozo:</strong> ' + (mesa.mozo || 'Sin asignar') + '</p>' +
      '<p><strong>Clientes:</strong> ' + mesa.clientes + ' personas</p>' +
      '<p><strong>Pedido:</strong> ' + (mesa.pedido || 'Sin pedido') + '</p>';
    
    // Mostrar boton liberar
    document.getElementById('btn-liberar').style.display = 'inline-block';
  } else {
    info.innerHTML = 
      '<p><strong>Estado:</strong> ' + mesa.estado + '</p>' +
      '<p style="color: #00d9ff;">Esta mesa esta disponible</p>';
    
    // Ocultar boton liberar
    document.getElementById('btn-liberar').style.display = 'none';
  }
  
  // Llenar formulario
  document.getElementById('estado').value = mesa.estado;
  document.getElementById('mozo').value = mesa.mozo || '';
  document.getElementById('clientes').value = mesa.clientes || 0;
  document.getElementById('pedido').value = mesa.pedido || '';
  
  mostrarOcultarCampos();
}

// Mostrar u ocultar campos segun estado
function mostrarOcultarCampos() {
  const estado = document.getElementById('estado').value;
  const campos = document.getElementById('campos-ocupada');
  const mozo = document.getElementById('mozo');
  const clientes = document.getElementById('clientes');
  
  if (estado === 'Ocupada') {
    campos.style.display = 'block';
    // Hacer campos obligatorios
    mozo.required = true;
    clientes.required = true;
  } else {
    campos.style.display = 'none';
    // Quitar obligatoriedad
    mozo.required = false;
    clientes.required = false;
  }
}

// Mostrar/ocultar formulario
function toggleFormulario() {
  const form = document.getElementById('formulario-edicion');
  const info = document.getElementById('info-mesa');
  
  if (form.style.display === 'none' || form.style.display === '') {
    form.style.display = 'block';
    info.style.display = 'none';
  } else {
    form.style.display = 'none';
    info.style.display = 'block';
  }
}

// Guardar cambios
function guardarMesa() {
  const estado = document.getElementById('estado').value;
  const mozo = document.getElementById('mozo').value;
  const clientes = document.getElementById('clientes').value;
  const pedido = document.getElementById('pedido').value;
  
  const datos = {
    estado: estado,
    mozo: estado === 'Ocupada' ? mozo : null,
    clientes: estado === 'Ocupada' ? parseInt(clientes) : 0,
    pedido: estado === 'Ocupada' ? pedido : null
  };
  
  fetch(API_URL + '/mesas/' + numeroMesa, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  })
  .then(response => response.json())
  .then(mesa => {
    mostrarMesa(mesa);
    toggleFormulario();
    alert('Cambios guardados');
  })
  .catch(error => {
    console.log('Error:', error);
    alert('Error al guardar');
  });
}

// Liberar mesa
function liberarMesa() {
  if (confirm('¿Seguro que quieres liberar esta mesa?')) {
    fetch(API_URL + '/mesas/' + numeroMesa + '/liberar', {
      method: 'POST'
    })
    .then(response => response.json())
    .then(mesa => {
      mostrarMesa(mesa);
      alert('Mesa liberada');
    })
    .catch(error => {
      console.log('Error:', error);
      alert('Error al liberar mesa');
    });
  }
}
