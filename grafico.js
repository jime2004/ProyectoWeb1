async function cargarYGenerarGrafico() {
    try {
        // Cargar el archivo JSON
        const response = await fetch('grafico.json'); // Asume que el archivo JSON está en la misma carpeta
        const data = await response.json();

        // Ordenar los paquetes por el número de veces vendidos de mayor a menor
        const top5 = data
            .sort((a, b) => b.numeroDeVecesVendido - a.numeroDeVecesVendido) // Ordenar de mayor a menor
            .slice(0, 5); // Obtener los 5 primeros

        // Extraer nombres y cantidades
        const labels = top5.map(item => item.name);
        const dataValues = top5.map(item => item.numeroDeVecesVendido);

        // Colores personalizados para el gráfico
        const colors = [
            '#8fa96d', // verde oscuro
            '#D4DDB1', // verde claro
            '#7A6448', // café
            '#e4d5b7', // cálido reemplazo del beige
            '#d1d1d1'  // gris claro reemplazo del blanco
        ];

        // Crear el gráfico de barras con Chart.js
        const ctx = document.getElementById('paquetesChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar', // Cambiar a gráfico de barras
            data: {
                labels: labels,
                datasets: [{
                    label: '',
                    data: dataValues,
                    backgroundColor: colors, // Usamos los colores definidos arriba
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false, // Ocultar leyenda
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.label + ': ' + tooltipItem.raw + ' vendidos';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 50 // Ajuste de los intervalos en el eje Y
                        }
                    },
                    x: {
                        ticks: {
                            display: false, // Eliminar los nombres debajo de las barras
                        }
                    }
                }
            }
        });

        // Mostrar la lista de paquetes más vendidos con cuadros de color
        const listaPaquetes = document.getElementById('paquetesLista');
        top5.forEach((item, index) => {
            const li = document.createElement('li');
            const colorCuadro = document.createElement('div');
            colorCuadro.classList.add('color-cuadro');
            colorCuadro.style.backgroundColor = colors[index]; // Asignar color del cuadro

            li.innerHTML = `${item.name} <span>‎ ‎ ‎ ‎ ${item.numeroDeVecesVendido} vendidos</span>`;
            li.insertBefore(colorCuadro, li.firstChild); // Insertar el cuadro de color antes del nombre
            listaPaquetes.appendChild(li);
        });

    } catch (error) {
        console.error('Error al cargar el JSON o generar el gráfico:', error);
    }
}

// Ejecutar la función para cargar y generar el gráfico
cargarYGenerarGrafico();
