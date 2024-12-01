let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Función para mostrar el indicador del carrito
function updateCartIndicator() {
    if (cart.length > 0) {
        $("#cart-indicator").show();
    } else {
        $("#cart-indicator").hide();
    }
  };

  // Inicialización 
  $(document).ready(function() {

    updateCartIndicator();
  
  });