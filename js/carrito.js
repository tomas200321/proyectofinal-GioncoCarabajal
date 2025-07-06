// carrito.js

const listaCarrito = document.getElementById('lista-carrito');
const totalSpan = document.getElementById('total');
const comprarBtn = document.getElementById('comprarBtn');
const vaciarCarritoBtn = document.getElementById('vaciarCarritoBtn');
const checkoutSection = document.getElementById('checkout');
const formCompra = document.getElementById('formularioCompra');

const MAX_CANTIDAD_POR_SKIN = 5;

let carrito = [];

// Inputs del formulario
const nombreInput = document.getElementById('nombre');
const emailInput = document.getElementById('email');
const steamUserInput = document.getElementById('steamUser');
const metodoPagoInput = document.getElementById('metodoPago');

const inputs = [nombreInput, emailInput, steamUserInput, metodoPagoInput];

// -------------------- FUNCIONES DE FORMULARIO --------------------

function precargarFormulario() {
  if (!localStorage.getItem('nombre')) nombreInput.value = 'Juan Pérez';
  if (!localStorage.getItem('email')) emailInput.value = 'juanperez@example.com';
  if (!localStorage.getItem('steamUser')) steamUserInput.value = 'juansteam123';
  if (!localStorage.getItem('metodoPago')) metodoPagoInput.value = 'tarjeta';

  inputs.forEach(input => {
    const valorGuardado = localStorage.getItem(input.id);
    if (valorGuardado) {
      input.value = valorGuardado;
    }
  });
}

// Guardar en localStorage cada vez que el usuario cambia un input
inputs.forEach(input => {
  input.addEventListener('input', () => {
    localStorage.setItem(input.id, input.value);
  });
});

// -------------------- CARRITO --------------------

function agregarAlCarrito(index) {
  const skin = skins[index];
  const existente = carrito.find(item => item.nombre === skin.nombre);
  if (existente) {
    if (existente.cantidad < MAX_CANTIDAD_POR_SKIN) {
      existente.cantidad++;
    } else {
      Swal.fire('Máximo alcanzado', `No puedes agregar más de ${MAX_CANTIDAD_POR_SKIN} unidades de esta skin`, 'warning');
      return;
    }
  } else {
    carrito.push({ ...skin, cantidad: 1 });
  }
  guardarCarrito();
  actualizarCarrito();
}

function actualizarCarrito() {
  listaCarrito.innerHTML = '';
  let total = 0;

  carrito.forEach((item, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${item.nombre} - ${item.precio} monedas x${item.cantidad}
      <button onclick="incrementarCantidad(${i})">+</button>
      <button onclick="disminuirCantidad(${i})">−</button>
      <button onclick="eliminarItem(${i})">🗑</button>
    `;
    listaCarrito.appendChild(li);
    total += item.precio * item.cantidad;
  });

  totalSpan.textContent = total;
}

function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function cargarCarrito() {
  const data = localStorage.getItem('carrito');
  if (data) carrito = JSON.parse(data);
}

// -------------------- CONTROL DE UNIDADES --------------------

function incrementarCantidad(i) {
  if (carrito[i].cantidad < MAX_CANTIDAD_POR_SKIN) {
    carrito[i].cantidad++;
    guardarCarrito();
    actualizarCarrito();
  } else {
    Swal.fire('Máximo alcanzado', `No puedes tener más de ${MAX_CANTIDAD_POR_SKIN} unidades de esta skin`, 'warning');
  }
}

function disminuirCantidad(i) {
  carrito[i].cantidad--;
  if (carrito[i].cantidad <= 0) {
    carrito.splice(i, 1);
  }
  guardarCarrito();
  actualizarCarrito();
}

function eliminarItem(i) {
  carrito.splice(i, 1);
  guardarCarrito();
  actualizarCarrito();
}

vaciarCarritoBtn.addEventListener('click', () => {
  carrito = [];
  guardarCarrito();
  actualizarCarrito();
  Swal.fire('🧹 Carrito vaciado', '', 'info');
});

// -------------------- CHECKOUT --------------------

comprarBtn.addEventListener('click', () => {
  if (carrito.length === 0) {
    Swal.fire('Tu carrito está vacío', '', 'warning');
    return;
  }
  precargarFormulario(); // <--- Aquí la llamamos también
  checkoutSection.classList.remove('oculto');
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
});

formCompra.addEventListener('submit', (e) => {
  e.preventDefault();

  const nombre = nombreInput.value.trim();
  const email = emailInput.value.trim();
  const steamUser = steamUserInput.value.trim();
  const metodoPago = metodoPagoInput.value;

  if (!nombre || !email || !steamUser || !metodoPago) {
    Swal.fire('Por favor completa todos los campos', '', 'error');
    return;
  }

  const resumen = carrito.map(item => `${item.nombre} x${item.cantidad} = ${item.precio * item.cantidad} monedas`).join('\n');
  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  Swal.fire({
    title: '✅ Compra realizada',
    html: `
      <p><strong>Nombre:</strong> ${nombre}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Usuario Steam:</strong> ${steamUser}</p>
      <p><strong>Método de pago:</strong> ${metodoPago}</p>
      <hr />
      <pre style="text-align: left; white-space: pre-wrap;">${resumen}</pre>
      <p><strong>Total:</strong> ${total} monedas</p>
    `,
    icon: 'success'
  });

  // Agregar skins al inventario (se asume inventario global accesible)
  carrito.forEach(item => {
    for (let i = 0; i < item.cantidad; i++) {
      inventario.push(item);
    }
  });

  // Reset carrito e inventario persistente
  carrito = [];
  guardarCarrito();
  guardarInventario();
  actualizarCarrito();
  actualizarInventario();

  // Limpio localStorage de los inputs del formulario
  inputs.forEach(input => localStorage.removeItem(input.id));

  formCompra.reset();
  checkoutSection.classList.add('oculto');
});

// -------------------- INICIALIZACIÓN --------------------

window.addEventListener('DOMContentLoaded', () => {
  precargarFormulario();
  cargarCarrito();
  actualizarCarrito();
});

