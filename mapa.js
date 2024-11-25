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
    zoom: 18,
    center: position,
    mapId: "DEMO_MAP_ID",
  });

  // Crear el contenido del InfoWindow
  const infoWindowContent = `
    <div style="font-family: Arial, sans-serif; font-size: 14px;">
      <h2 style="font-size: 20px;">TurisTicos</h2>
      <p>Nuestra ubicación</p>
    </div>
  `;

  // Crear el InfoWindow
  const infoWindow = new google.maps.InfoWindow({
    content: infoWindowContent,
  });

  // Agregar un marcador en la posición inicial
  const marker = new AdvancedMarkerElement({
    map: map,
    position: position,
    title: "Mi Ubicación",
  });

  // Abrir el InfoWindow al hacer clic en el marcador
  marker.addListener("click", () => {
    infoWindow.open(map, marker);
  });
}

// Iniciar el mapa al cargar la página
initMap();
