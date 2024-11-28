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
        })
        .catch(error => {
            Swal.fire('Error', 'Hubo un problema con la carga de servicios: ' + error.message, 'error');
        });
}

// Función para mostrar el carrito de compras
function displayCart() {
    const content = $("#content");
    content.empty();

    if (cart.length === 0) {
        content.append('<h1 class="text-center">Carrito de Compras vacío</h1>');
        return;
    }

    content.append('<h1 class="text-center">Carrito de Compras</h1>');

        // Agregar campo para el nombre del cliente
        content.append(`
            <div class="form-group">
                <label for="customer-name">Nombre del Cliente:</label>
                <input type="text" id="customer-name" class="form-control" placeholder="Ingresa tu nombre" oninput="customerName = this.value">
            </div>
        `);

    const cartTable = `
        <div class="table-responsive">
            <table class="table table-bordered" id="cart-table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
        <h4>Total: $<span id="total-price">0.00</span></h4>
        <button class="btn btn-success" onclick="generatePDF()">Imprimir Factura</button>
        <button class="btn btn-success" onclick="simulatePayment()">Pagar</button>
    `;

    content.append(cartTable);

    const cartTableBody = $("#cart-table tbody");
    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        cartTableBody.append(`
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

// Función para guardar el carrito en localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartIndicator();
  }

// Función para eliminar un producto del carrito
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    displayCart();
    Swal.fire('Producto eliminado', 'El producto ha sido eliminado del carrito', 'info');
}

// Función para mostrar el indicador del carrito
function updateCartIndicator() {
    if (cart.length > 0) {
        $("#cart-indicator").show();
    } else {
        $("#cart-indicator").hide();
    }
  }

// Función para simular el pago
function simulatePayment() {
    // Obtener la fecha actual en formato YYYY-MM-DD
    const today = new Date();
    const todayString = today.toISOString().split("T")[0]; // Convertir a formato de fecha

    Swal.fire({
        title: 'Pagar',
        html: `
            <input id="card-number" type="text" class="swal2-input" placeholder="Número de tarjeta" maxlength="16" oninput="this.value=this.value.replace(/[^0-9]/g,'')">
            <input id="expiry-date" type="date" class="swal2-input" placeholder="Fecha de Vencimiento" min="${todayString}">
            <input id="card-name" type="text" class="swal2-input" placeholder="Nombre en la tarjeta">
        `,
        focusConfirm: false,
        preConfirm: () => {
            const cardNumber = document.getElementById('card-number').value;
            const expiryDate = document.getElementById('expiry-date').value;
            const cardName = document.getElementById('card-name').value;

            const selectedDate = new Date(expiryDate);
            const cardNumberLength = cardNumber.length;

            if (!cardNumber || !expiryDate || !cardName) {
                Swal.showValidationMessage('Por favor completa todos los campos');
                return false;
            }

            if (cardNumberLength < 13 || cardNumberLength > 16) {
                Swal.showValidationMessage('El número de tarjeta debe tener entre 13 y 16 dígitos');
                return false;
            }

            if (selectedDate < today) {
                Swal.showValidationMessage('La fecha de vencimiento no puede ser anterior al día actual');
                return false;
            }

            return { cardNumber, expiryDate, cardName };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Simular el pago
            Swal.fire('¡Pago realizado!', 'Gracias por tu compra', 'success');
            cart = [];
            saveCart();
            displayCart();
        }
    });
}

// Función para actualizar la cantidad de productos
function updateQuantity(productId, quantity) {
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        cartItem.quantity = parseInt(quantity);
        saveCart();
        displayCart();
    }
}

// Eventos de carga inicial
$(document).ready(() => {
    loadServices(); // Cargar productos desde JSON
    updateCartIndicator();
    displayCart();
});
