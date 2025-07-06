// main.js

const abrirCajaBtn = document.getElementById('abrirCajaBtn');
const carruselContainer = document.getElementById('carrusel-container');
const resultadoDiv = document.getElementById('resultado');
const tiendaDiv = document.getElementById('skins-tienda');
const inventarioDiv = document.getElementById('contenedor-inventario');

let skins = [];
let inventario = [];

// ----------- CARGAR SKINS -----------

async function cargarSkins() {
  try {
    const response = await fetch('data/skins.json');
    if (!response.ok) throw new Error('Error al cargar skins.json');
    skins = await response.json();
    mostrarTienda();
  } catch (error) {
    resultadoDiv.textContent = 'Error cargando skins: ' + error.message;
  }
}

// ----------- APERTURA DE CAJA -----------

function mensajeRareza(rareza) {
  switch (rareza) {
    case "común": return "Es una skin común. Nada mal.";
    case "raro": return "¡Una skin rara! Bien ahí.";
    case "épico": return "¡Épico! Esta skin es bastante valiosa.";
    case "legendario": return "¡Legendaria! Una joya del arsenal.";
    default: return "Rareza desconocida.";
  }
}

function abrirCaja() {
  if (!skins.length || abrirCajaBtn.disabled) return;

  abrirCajaBtn.disabled = true;
  resultadoDiv.textContent = "";
  carruselContainer.innerHTML = "";

  const strip = document.createElement('div');
  strip.className = 'strip';

  const tirada = [];
  for (let i = 0; i < 50; i++) {
    const skin = skins[Math.floor(Math.random() * skins.length)];
    tirada.push(skin);

    const item = document.createElement('div');
    item.className = `item ${skin.rareza}`;
    item.innerHTML = `<img src="${skin.img}" alt="${skin.nombre}" /><span>${skin.nombre}</span>`;
    strip.appendChild(item);
  }

  carruselContainer.appendChild(strip);

  const ganadorIndex = 30 + Math.floor(Math.random() * 10);
  const desplazamiento = -(ganadorIndex * 130 - (carruselContainer.clientWidth / 2 - 130 / 2));
  strip.style.left = '0px';

  setTimeout(() => {
    strip.style.transition = 'left 3s cubic-bezier(0.4, 0, 0.2, 1)';
    strip.style.left = `${desplazamiento}px`;
  }, 100);

  setTimeout(() => {
    const skinGanadora = tirada[ganadorIndex];
    inventario.push(skinGanadora);
    guardarInventario();

    resultadoDiv.innerHTML = `
      <p><strong class="rareza-${skinGanadora.rareza}">¡Obtuviste:</strong> ${skinGanadora.nombre}</p>
      <p class="rareza-${skinGanadora.rareza}">${mensajeRareza(skinGanadora.rareza)}</p>
      <img src="${skinGanadora.img}" alt="${skinGanadora.nombre}" />
    `;

    actualizarInventario();
    abrirCajaBtn.disabled = false;

    Swal.fire({
      title: '🎁 ¡Ganaste una skin!',
      text: `${skinGanadora.nombre} (${skinGanadora.rareza})`,
      imageUrl: skinGanadora.img,
      imageHeight: 150,
      confirmButtonText: 'Genial 😎'
    });

  }, 3200);
}

// ----------- INVENTARIO -----------

function guardarInventario() {
  localStorage.setItem('inventario', JSON.stringify(inventario));
}

function cargarInventario() {
  const data = localStorage.getItem('inventario');
  if (data) inventario = JSON.parse(data);
}

function actualizarInventario() {
  inventarioDiv.innerHTML = '';
  if (inventario.length === 0) {
    inventarioDiv.innerHTML = '<p>No tienes skins aún.</p>';
    return;
  }

  inventario.forEach((skin) => {
    const div = document.createElement('div');
    div.className = 'skin-inventario';
    div.innerHTML = `
      <img src="${skin.img}" alt="${skin.nombre}" />
      <p>${skin.nombre}</p>
    `;
    inventarioDiv.appendChild(div);
  });
}

// ----------- TIENDA -----------

function mostrarTienda() {
  tiendaDiv.innerHTML = '';

  skins.forEach((skin, index) => {
    const card = document.createElement('div');
    card.className = `skin-card ${skin.rareza}`;
    card.innerHTML = `
      <img src="${skin.img}" alt="${skin.nombre}" />
      <h3>${skin.nombre}</h3>
      <p>${skin.precio} monedas</p>
      <button onclick="agregarAlCarrito(${index})">Agregar al carrito</button>
    `;
    tiendaDiv.appendChild(card);
  });
}

// ----------- INICIO -----------

abrirCajaBtn.addEventListener('click', abrirCaja);

window.addEventListener('DOMContentLoaded', () => {
  cargarSkins();
  cargarInventario();
  actualizarInventario();
});
