let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Función para mostrar el indicador del carrito
function updateCartIndicator() {
  const cartBadge = document.getElementById("cart-badge");
  const cartIndicator = document.getElementById("cart-indicator");

  // Calcula el total de productos (incluyendo cantidades)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (totalItems > 0) {
      cartIndicator.style.display = "inline";
      cartBadge.style.display = "flex";
      cartBadge.textContent = totalItems; // Muestra el total de artículos en el badge
  } else {
      cartIndicator.style.display = "none";
      cartBadge.style.display = "none";
  }
}


  // Inicialización 
  $(document).ready(function() {

    updateCartIndicator();
  
  });