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
            services = data;
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

    //campo para el nombre del cliente
    content.append(`
            <div class="form-group">
                <label for="customer-name">Nombre del Cliente:</label>
                <input type="text" id="customer-name" class="form-control" placeholder="Ingresa tu nombre" oninput="customerName = this.value">
                
            <br>
            </div>
        `);

    const cartTable = `
        <div class="table-responsive">
            <table class="table table-bordered" id="cart-table">
                <thead>
                    <tr>
                        <th>Paquete</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
        <h4>Total: $<span id="total-price">0.00</span></h4>
        <button class="btn btn-success" onclick="generatePDF()"><i class="fa fa-print "></i> Imprimir Factura</button>
        <button class="btn btn-success" onclick="simulatePayment()"><i class="fa fa-credit-card"></i> Pagar</button>
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
                    <button class="btn btn-danger btn-sm" onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i> Eliminar</button>
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

// Función para simular el pago
function simulatePayment() {
    // Obtener la fecha actual en formato YYYY-MM-DD
    const today = new Date();
    const todayString = today.toISOString().split("T")[0]; // Convertir a formato de fecha

    Swal.fire({
        title: 'Pagar',
        html: `
            <input id="card-number" type="text" class="swal2-input" placeholder="Número de tarjeta" maxlength="16" oninput="getCreditCardType(event)"> 
            <img src="./img/VisaLogo.png" alt="" id="visa" class="img-tarjeta" style="display: none;">
            <img src="./img/MastercardLogo.png" alt="" id="mastercard" class="img-tarjeta" style="display: none;">
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
        const newQuantity = parseInt(quantity);

        if (newQuantity === 0) {
            removeFromCart(productId);
        } else {
            cartItem.quantity = newQuantity;
            saveCart();
            displayCart();
        }
    }
}

// Variable para rastrear si el descuento ya fue aplicado
let discountApplied = false;

// Función para aplicar el código promocional
let originalTotal = 0; // Variable global para almacenar el total original
let discountedTotal = 0; // Variable global para almacenar el total con descuento

function applyPromoCode() {
    const promoInput = $("#promo-code").val().trim(); 
    const discountCode = "BFRIDAY"; // Código válido
    const totalPriceElement = $("#total-price");
    let total = parseFloat(totalPriceElement.text());
    
    // Verificar si el descuento ya fue aplicado
    if (discountApplied) {
        Swal.fire('Descuento ya aplicado.', 'Ya un código fue ingresado anteriormente', 'info');
        $("#promo-code").val("");
        return;
    }
    
    // Verificar si el código ingresado es correcto
    if (promoInput === discountCode) {
        const discount = total * 0.1; // Calcular el 10% de descuento
        discountedTotal = total - discount; // Calcular el total con descuento
        originalTotal = total; // Guardar el total original

        // Actualizar la visualización del precio
        totalPriceElement.html(`
            <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 5px;">
                <span style="font-size: 1em; color: #a0a0a0; text-decoration: line-through;">
                    Precio original: $${originalTotal.toFixed(2)} 
                </span>
                <span style="font-size: 1em; font-weight: bold; color: #6BAE6C;">
                    Precio con descuento: $${discountedTotal.toFixed(2)} 
                </span>
            </div>
        `);

        // Actualizar para evitar múltiples aplicaciones
        discountApplied = true;

        // Limpiar el campo del código promocional
        $("#promo-code").val("");

        // Mostrar un mensaje de éxito
        Swal.fire('¡Código promocional aplicado!', `Se ha descontado un 10% del total.`, 'success');
    } else {
        // Si el código no es válido
        Swal.fire('Código promocional inválido', `Por favor, inténtalo de nuevo.`, 'error');
        $("#promo-code").val("");
    }
}



// Función para generar un PDF del contenido del carrito
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Generar la fecha y hora actual en formato especificado
    const now = new Date();
    const invoiceNumber = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    // Encabezado
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(143, 169, 109); // Verde suave
    doc.text("Factura de Compra", 105, 20, null, null, 'center');
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Negro
    doc.setFont("helvetica", "normal");
    doc.text(`Factura Número: ${invoiceNumber}`, 105, 30, null, null, 'center');
    
    const customerNameDisplay = customerName.trim() === "" ? "*Sin Nombre*" : customerName;
    doc.text(`Nombre del Cliente: ${customerNameDisplay}`, 14, 40);

    // Tabla: Configuración inicial
    let y = 50;
    const tableWidth = 180;
    const rowHeight = 10;
    const colWidths = [70, 30, 30, 50]; // Ancho de columnas: Producto, Precio, Cantidad, Subtotal

    // Cabecera de la tabla
    doc.setFillColor(143, 169, 109); // Verde claro
    doc.rect(14, y, tableWidth, rowHeight, 'F'); // Fondo de la cabecera
    doc.setTextColor(255, 255, 255); // Texto blanco
    doc.setFont("helvetica", "bold");
    doc.text("Producto", 16, y + 7);
    doc.text("Precio", 90, y + 7);
    doc.text("Cantidad", 120, y + 7);
    doc.text("Subtotal", 160, y + 7);
    y += rowHeight;

    // Datos de la tabla
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Negro
    let total = 0;

    
    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;

        // Alternar color de fondo para filas
        if (index % 2 === 0) {
            doc.setFillColor(245, 245, 245); // Gris claro
            doc.rect(14, y, tableWidth, rowHeight, 'F');
        }

        // Añadir datos del producto
        doc.text(item.name, 16, y + 7);
        doc.text(`$${item.price.toFixed(2)}`, 90, y + 7);
        doc.text(`${item.quantity}`, 125, y + 7);
        doc.text(`$${subtotal.toFixed(2)}`, 165, y + 7);

        y += rowHeight; // Mover a la siguiente fila
        total += subtotal; // Sumar al total
    });


    if(discountApplied){
    // Total
    y += 5; // Espaciado antes del total
    doc.setFont("helvetica", "bold");
    doc.setFillColor(211, 211, 211); // Fondo gris claro para total
    doc.rect(14, y, tableWidth, rowHeight, 'F');
    doc.setTextColor(0, 0, 0);
    doc.text("Total con un 10% descuento aplicado:", 16, y + 7);
    doc.text(`$${discountedTotal.toFixed(2)}`, 165, y + 7);
    }else
    {
        y += 5; // Espaciado antes del total
        doc.setFont("helvetica", "bold");
        doc.setFillColor(211, 211, 211); // Fondo gris claro para total
        doc.rect(14, y, tableWidth, rowHeight, 'F');
        doc.setTextColor(0, 0, 0);
        doc.text("Total", 16, y + 7);
        doc.text(`$${total.toFixed(2)}`, 165, y + 7);
    }

    // Mensaje de pie de página
    y += rowHeight + 10;
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128); // Gris oscuro
    doc.text("Gracias por elegir nuestros servicios. ¡Esperamos que sigas viajando con nosotros!", 105, y, null, null, 'center');

    // Número de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Página ${i} de ${pageCount}`, 190, 285, null, null, 'right');
    }

    // Guardar PDF
    doc.save('factura_compra.pdf');
}

//**

function getCreditCardType(event) {

    var accountNumber = document.getElementById("card-number").value;

    const imgvisa = document.getElementById('visa');
    const imgmaster = document.getElementById('mastercard');

    var cardReaderVisa = {
        "visa": /^4/
    };

    var cardReaderMaster = {
        "mastercard": /^5[1-5]/
    };

    imgvisa.style.display = 'none';
    imgmaster.style.display = 'none';

    for (var card in cardReaderVisa) {
        if (cardReaderVisa[card].test(accountNumber)) {
            imgvisa.style.display = 'inline';
        }
    }

    for (var card in cardReaderMaster) {
        if (cardReaderMaster[card].test(accountNumber)) {
            imgmaster.style.display = 'inline';
        }
    }

}


// Eventos de carga inicial
$(document).ready(() => {
    loadServices();
    updateCartIndicator();
    displayCart();
});