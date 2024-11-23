// Declarar el mapa globalmente
let map;

async function initMap() {
  // La posición inicial del marcador (Latitud y Longitud)
  const position = { lat: 10.0701973, lng: -84.3087960 };

  // Importar las bibliotecas necesarias
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // Inicializar el mapa centrado en la posición
  map = new Map(document.getElementById("map"), {
    zoom: 19,
    center: position,
    mapId: "DEMO_MAP_ID",
  });

  // Agregar un marcador en la posición inicial
  const marker = new AdvancedMarkerElement({
    map: map,
    position: position,
    title: "Uluru",
  });
}

// Iniciar el mapa al cargar la página
initMap();