let services = [];
// Carrito de compras almacenado en localStorage
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
            displayServices(data); // Mostramos las tarjetas de servicios
        })
        .catch(error => {
            Swal.fire('Error', 'Hubo un problema con la carga de servicios: ' + error.message, 'error');
        });
}
// Función para mostrar los servicios en la pagina
function displayServices(services) {
    const serviceContainer = $("#services");
    serviceContainer.empty();

    services.forEach(service => {
        serviceContainer.append(`
        <div class="col-6 col-md-4 col-lg-3 mb-4"  data-etiquetas="${service.category}">
                <div class="card h-100 shadow-sm">
                     <a href="vacaciones-perfectas.html">
                        <img src="${service.image}" class="card-img-top" alt="${service.name}">
                    </a>
                    <div class="card-body">
                        <h5 class="card-title">${service.name}</h5>
                        <p class="card-text">${service.description}</p>
                        <p class="price">$${service.price.toFixed(2)}</p>
                        <button class="btn btn-primary w-100" onclick="addToCart(${service.id})">Agregar al Carrito</button>
                        <button class="btn btn-info" onclick="showProductDetails(${service.id})">Detalles</button>
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
  
    // Filtrar servicios según la categoría seleccionada
    if (category === "all") {
      filteredServices = services;
    } else {
      filteredServices = services.filter(service => service.category === category);
    }
  
    // Mostrar los servicios filtrados
    displayServices(filteredServices);
  }
  
  // Función para ordenar servicios por precio
  function sortServicesByPrice(order) {
    const servicesContainer = document.getElementById("services");
    servicesContainer.innerHTML = "";
  
    // Ordenar los servicios filtrados según el orden seleccionado
    if (order) {
      filteredServices.sort((a, b) => {
        return order === "asc" ? a.price - b.price : b.price - a.price;
      });
    }
  
    // Mostrar los servicios ordenados
    displayServices(filteredServices);
  }



  function showProductDetails(productId) {
    fetch('servicios.json')
        .then(response => response.json())
        .then(products => {
            const product = products.find(p => p.id === productId);
            if (product) {
                // Actualizar los elementos del modal
                document.getElementById('productImage').src = product.image || 'img/default.jpg';
                document.getElementById('productName').textContent = product.name;
                document.getElementById('productDescription').textContent = product.description || 'No disponible';
                document.getElementById('productPrice').textContent = `$${product.price.toFixed(2)}`;
                document.getElementById('productCategory').textContent = product.category || 'General';

                // Mostrar el modal
                const productModal = new bootstrap.Modal(document.getElementById('productModal'));
                productModal.show();
            }
        })
        .catch(error => console.error('Error al cargar detalles del producto:', error));
}

//**
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

// Función para mostrar el indicador del carrito
function updateCartIndicator() {
  if (cart.length > 0) {
      $("#cart-indicator").show();
  } else {
      $("#cart-indicator").hide();
  }
}



//**



  // Inicialización de la tienda
$(document).ready(function() {

    loadServices(); // Cargar los servicios al iniciar la página

    updateCartIndicator();

    $("#view-cart").on("click", function() {
      displayCart();
    });

    $("#cart-indicator").on("click", function() {
      displayCart();
    });

});
  
