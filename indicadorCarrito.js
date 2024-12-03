let cart = JSON.parse(localStorage.getItem('cart')) || [];

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

  updateCartIndicator();

});