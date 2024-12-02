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

        // Agregar campo para el nombre del cliente
        content.append(`
            <div class="form-group">
                <label for="customer-name">Nombre del Cliente:</label>
                <input type="text" id="customer-name" class="form-control" placeholder="Ingresa tu nombre" value="*Sin Nombre*" oninput="customerName = this.value">
                
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

    //oninput="this.value=this.value.replace(/[^0-9]/g,'')"

    Swal.fire({
        title: 'Pagar',
        html: `
            <input id="card-number" type="text" class="swal2-input" placeholder="Número de tarjeta" maxlength="16" oninput="getCreditCardType(event)"> 
            <img src="./img/visa.png" alt="" id="visa" class="img-tarjeta" style="display: none;">
            <img src="./img/mastercard.png" alt="" id="mastercard" class="img-tarjeta" style="display: none;">
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
function applyPromoCode() {
    const promoInput = $("#promo-code").val().trim(); // Leer el valor ingresado
    const discountCode = "BFRIDAY"; // Código válido
    const totalPriceElement = $("#total-price"); // Elemento que muestra el total
    let total = parseFloat(totalPriceElement.text()); // Obtener el total actual como número

    // Verificar si el descuento ya fue aplicado
    if (discountApplied) {
        Swal.fire('Descuento ya aplicado.', 'Ya un codigo fue ingresado anteriormente', 'info');
        $("#promo-code").val("");
        return;
    }

    // Verificar si el código ingresado es correcto
    if (promoInput === discountCode) {
        const discount = total * 0.1; // Calcular el 10% de descuento
        total -= discount; // Restar el descuento del total
        totalPriceElement.text(total.toFixed(2)); // Actualizar el total en el carrito

        // Actualizar la bandera para evitar múltiples aplicaciones
        discountApplied = true;

        // Limpiar el campo del código promocional
        $("#promo-code").val("");

        // Mostrar un mensaje de éxito
        Swal.fire('¡Código promocional aplicado!', `Se ha descontado un 10% del total.`, 'success');
    } else {
        // Si el código no es válido
        Swal.fire('Código promocional inválido', ` Por favor, inténtalo de nuevo.`, 'error');
        $("#promo-code").val("");     
    }
}

// Función para generar un PDF del contenido del carrito
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Generar la fecha y hora actual en el formato especificado
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Asegurar que el mes tenga dos dígitos
    const day = String(now.getDate()).padStart(2, '0'); // Asegurar que el día tenga dos dígitos
    const hours = String(now.getHours()).padStart(2, '0'); // Asegurar que la hora tenga dos dígitos
    const minutes = String(now.getMinutes()).padStart(2, '0'); // Asegurar que los minutos tengan dos dígitos
    const seconds = String(now.getSeconds()).padStart(2, '0'); // Asegurar que los segundos tengan dos dígitos
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0'); // Asegurar que los milisegundos tengan tres dígitos

    const invoiceNumber = `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;

    doc.setFontSize(20);
    doc.setTextColor(143, 169, 109 ); // Color
    doc.setFont("helvetica", "bold"); // Establecer fuente en negrita
    doc.text("Factura de Compra", 105, 20, null, null, 'center'); // Centrado horizontalmente
    doc.setTextColor(0, 0, 0); // Color negro
    doc.setFont("helvetica", "normal"); // Establecer fuente normal
    doc.setFontSize(12);

    // Agregar el número de factura
    doc.text(`Factura Número: ${invoiceNumber}`, 105, 30, null, null, 'center'); // Centrado horizontalmente
// Verificar el nombre del cliente y asignar "Contado" si está vacío
    const customerNameDisplay = customerName.trim() == "" ? "*Sin Nombre*" : customerName;

    doc.text(`Nombre del Cliente: ${customerNameDisplay}`, 14, 40); // Posición vertical después del número de factura

    let y = 45; // posición vertical inicial
    let total = 0;

    // Definir el ancho de la tabla y la altura de las filas
    const tableWidth = 180;
    const rowHeight = 10;

    // Cabecera de la tabla
    doc.setFillColor(143, 169, 109 ); // Color azul
    doc.rect(14, y, tableWidth, rowHeight, 'F'); // Fondo de la cabecera
    doc.setTextColor(255, 255, 255); // Texto blanco
    doc.text("Producto", 15, y + 7);
    doc.text("Precio", 80, y + 7);
    doc.text("Cantidad", 120, y + 7);
    doc.text("Subtotal", 150, y + 7);
    doc.setTextColor(0, 0, 0); // Restablecer el color del texto a negro
    y += rowHeight;
    const maxWidth = 180;
    // Detalles de los productos
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        doc.rect(14, y, tableWidth, rowHeight); // Bordes de la fila
        doc.text(item.name, 15, y + 7);
        doc.text(`$${item.price.toFixed(2)}`, 80, y + 7);
        doc.text(item.quantity.toString(), 120, y + 7);
        doc.text(`$${subtotal.toFixed(2)}`, 150, y + 7);
        y += rowHeight; // Incremento para la siguiente línea
        total += subtotal;
    });

    // Total
    doc.setFillColor(211, 211, 211); // Color gris
    doc.rect(14, y, tableWidth, rowHeight, 'F'); // Fondo del total
    doc.setTextColor(0, 0, 0); // Texto negro
    doc.text("Total:", 15, y + 7);
    doc.text(`$${total.toFixed(2)}`, 150, y + 7);
    
    // Información adicional (pie de página)
    y += rowHeight + 5;
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128); // Gris claro
    doc.text("Gracias por elegir nuestros servicios. ¡Esperamos verte pronto!", 14, y);

    // Agregar número de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i); // Establecer la página actual
        doc.text(`Página ${i} de ${pageCount}`, 190, 285, null, null, 'right'); // Añadir número de página
    }


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

    for(var card in cardReaderVisa){
        if(cardReaderVisa[card].test(accountNumber)){
            imgvisa.style.display = 'inline';
        }
    }

    for(var card in cardReaderMaster){
        if(cardReaderMaster[card].test(accountNumber)){
            imgmaster.style.display = 'inline';
        }
    }

}



// Eventos de carga inicial
$(document).ready(() => {
    loadServices();
    updateCartIndicator();
    displayCart();

    //const inputElement = document.getElementById('card-number');
    //inputElement.addEventListener('card-number', getCreditCardType);

    //document.getElementById("card-number").addEventListener('keyup',getCreditCardType);

});
