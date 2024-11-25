let services = [];
let cart = [];

// Función para cargar servicios desde JSON
function loadServices() {
    fetch('servicios.json') // Cambia esta URL si usas un archivo local
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
// Función para mostrar los servicios en la tienda
function displayServices(services) {
    const serviceContainer = $("#services");
    serviceContainer.empty();

    services.forEach(service => {
        serviceContainer.append(`
        <div class="col-6 col-md-4 col-lg-3 mb-4">
                <div class="card h-100 shadow-sm">
                    <img src="${service.image}" class="card-img-top" alt="${service.name}">
                    <div class="card-body">
                        <h5 class="card-title">${service.name}</h5>
                        <p class="card-text">${service.description}</p>
                        <p class="price">$${service.price.toFixed(2)}</p>
                        <button class="btn btn-primary w-100" onclick="addToCart(${service.id})">Agregar al Carrito</button>
                    </div>
                </div>
            </div>

        `);
    });
}

// Función para agregar servicios al carrito
function addToCart(serviceId) {
    fetch('servicios.json')
    .then(response => response.json())
    .then(services => {
        const service = services.find(s => s.id === serviceId);
        const cartItem = cart.find(item => item.id === serviceId);

        if (cartItem) {
            cartItem.quantity++;
        } else {
            cart.push({ ...service, quantity: 1 });
        }
        displayCart();
        Swal.fire('Servicio agregado', `${service.name} ha sido agregado al carrito`, 'success');
    });
}

// Función para mostrar los servicios en el carrito
function displayCart() {
    const cartTable = $("#cart-table tbody");
    cartTable.empty();

    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        cartTable.append(`
            <tr>
                <td>${item.name}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>
                    <input type="number" min="1" class="form-control" value="${item.quantity}" onchange="updateQuantity(${item.id}, this.value)">
                </td>
                <td>$${subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="removeFromCart(${item.id})">Eliminar</button>
                </td>
            </tr>
        `);
    });

    $("#total-price").text(total.toFixed(2));
}

// Función para actualizar la cantidad de servicios
function updateQuantity(serviceId, quantity) {
    const cartItem = cart.find(item => item.id === serviceId);
    if (cartItem) {
        cartItem.quantity = parseInt(quantity);
        displayCart();
    }
}

// Función para eliminar un servicio del carrito
function removeFromCart(serviceId) {
    cart = cart.filter(item => item.id !== serviceId);
    displayCart();
    Swal.fire('Servicio eliminado', 'El servicio ha sido eliminado del carrito', 'info');
}

// Inicialización de la tienda
$(document).ready(function() {
    loadServices(); // Cargar los servicios al iniciar la página
});