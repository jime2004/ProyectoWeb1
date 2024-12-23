let services = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Función para cargar servicios desde JSON
function loadServices() {
  fetch('servicios.json') // Cambia esta URL si usas un archivo local http://localhost:8080/servicios.json    servicios.json
    .then(response => {
      if (!response.ok) {
        Swal.fire('Error', 'No se pudo cargar el archivo JSON. Código de error: ' + response.status, 'error');
      }
      return response.json();
    })
    .then(data => {
      services = data; // Guardamos los servicios cargados
      displayServices(data);
    })
    .catch(error => {
      Swal.fire('Error', 'Hubo un problema con la carga de servicios: ' + error.message, 'error');
    });
}

// Función para mostrar los servicios en la página(cards)
function displayServices(services) {
  const serviceContainer = $("#services");
  serviceContainer.empty();

  services.forEach(service => {
    serviceContainer.append(`
          <div class="col-6 col-md-4 col-lg-3 mb-4"  data-etiquetas="${service.category}">
              <div class="card h-100 shadow-sm">
                  <img src="${service.image}" class="card-img-top" alt="${service.name}" onclick="showProductDetails(${service.id})">
                  <div class="card-body">
                      <h5 class="card-title">${service.name}</h5>
                      <p class="card-text">${service.description}</p>
                      <p class="price">$${service.price.toFixed(2)}</p>
                      <div class="d-flex justify-content-between">
                          <button class="btn btn-primary me-2" onclick="addToCart(${service.id})" ><i class="fas fa-cart-plus"></i> Agregar al carrito</button>
                          <button class="btn btn-secondary" onclick="showProductDetails(${service.id})">Detalles</button>
                      </div>
                  </div>
              </div>
          </div>
      `);
  });

}

let filteredServices = services;

// Función para filtrar servicios por categoría
function filterServices(category) {
  const servicesContainer = document.getElementById("services");
  servicesContainer.innerHTML = "";

  if (category === "all") {
    filteredServices = services;
  } else {
    filteredServices = services.filter(service => service.category === category);
  }

  displayServices(filteredServices);
}

// Función para ordenar servicios por precio
function sortServicesByPrice(order) {
  const servicesContainer = document.getElementById("services");
  servicesContainer.innerHTML = "";

  if (order) {
    filteredServices.sort((a, b) => {
      return order === "asc" ? a.price - b.price : b.price - a.price;
    });
  }

  displayServices(filteredServices);
}


// Función para mostrar el modal con los detalles de cada servicio
function showProductDetails(productId) {
  fetch('servicios.json')
    .then(response => response.json())
    .then(products => {
      const product = products.find(p => p.id === productId);
      if (product) {
        // Actualizar los elementos del modal
        document.getElementById('productName').textContent = product.name;
        document.getElementById('productPrice').textContent = `$${product.price.toFixed(2)}`;
        document.getElementById('productCategory').textContent = product.category || 'General';
        document.getElementById('productDescription').textContent = product.descripcionDetallada || 'No disponible';

        // Configurar el carousel
        const carouselInner = document.getElementById('carouselInner');
        carouselInner.innerHTML = ''; // Limpiar las imágenes previas del carousel

        const images = [product.image, product.image2, product.image3].filter(img => img); // Filtrar imágenes no vacías
        if (images.length === 0) {
          images.push('img/default.jpg'); // Agregar una imagen por defecto si no hay imágenes disponibles
        }

        images.forEach((imgSrc, index) => {
          const slide = document.createElement('div');
          slide.classList.add('carousel-item');
          
          // La primera imagen debe tener la clase "active"
          if (index === 0) {
            slide.classList.add('active');
          }

           // Configurar el ID del producto en el botón del modal
        const addToCartBtn = document.getElementById('add-to-cart-modal-btn');
        addToCartBtn.setAttribute('data-product-id', productId);
        
          const imgElement = document.createElement('img');
          imgElement.classList.add('d-block', 'w-100');
          imgElement.src = imgSrc;
          imgElement.alt = product.name;

          slide.appendChild(imgElement);
          carouselInner.appendChild(slide);
        });

        // Mostrar las estrellas de calificación (de 1 a 5 estrellas)
        const ratingContainer = document.getElementById('productRating');
        ratingContainer.innerHTML = ''; // Limpiar las estrellas actuales

        for (let i = 0; i < 5; i++) {
          const star = document.createElement('span');
          star.classList.add('fa', i < product.rating ? 'fa-star' : 'fa-star-o'); // Llenar o vaciar estrellas
          ratingContainer.appendChild(star);
        }

        // Mostrar el botón "Contáctanos"
        const contactBtn = document.getElementById('contactUsBtn');
        contactBtn.style.display = 'block'; // Asegúrate de que el botón esté visible

        // Mostrar el modal
        const productModal = new bootstrap.Modal(document.getElementById('productModal'));
        productModal.show();
      }
    })
    .catch(error => console.error('Error al cargar detalles del producto:', error));
}




// Función para agregar productos al carrito
function addToCart(productId) {
  const product = services.find(p => p.id === productId);
  const cartItem = cart.find(item => item.id === productId);
  console.log(product);

  if (cartItem) {
    cartItem.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  Swal.fire('Producto agregado', `${product.name} ha sido agregado al carrito`, 'success');
}

// Función para guardar el carrito en localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartIndicator();
}

// Función para agregar al carrito desde el modal
function addToCartFromModal() {
  const productId = parseInt(document.getElementById('add-to-cart-modal-btn').getAttribute('data-product-id'), 10);

  if (!isNaN(productId)) {
    addToCart(productId);
  } else { 
    console.error('No se pudo obtener el ID del producto para añadir al carrito');
  }
}

// Función para actualizar el indicador del carrito
function updateCartIndicator() {
  const cartBadge = document.getElementById("cart-indicator");
  const cartIndicator = document.getElementById("cart-indicator");

  // Calcula el total de productos (incluyendo cantidades)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (totalItems > 0) {
    cartIndicator.style.display = "inline"; // Muestra el indicador si hay productos
    cartBadge.style.display = "flex"; // Muestra el badge
    cartBadge.textContent = totalItems; // Muestra el total de artículos en el badge
  } else {
    cartIndicator.style.display = "none"; // Oculta el indicador si no hay productos
    cartBadge.style.display = "none"; // Oculta el badge
  }
}


// Inicialización 
$(document).ready(function () {

  loadServices();

  updateCartIndicator()

  $("#view-cart").on("click", function () {
    displayCart();
  });

  $("#cart-indicator").on("click", function () {
    displayCart();
  });

});

