console.log('Script cargado');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, iniciando carga de datos...');
    const calculateButton = document.getElementById('calculateButton');
    if (calculateButton) {
        calculateButton.addEventListener('click', calculateVotes);
    }

    // Realiza el scraping para obtener el valor de stNEAR y totalVP
    fetch('/scrape')
        .then(response => {
            console.log('Respuesta recibida:', response);
            return response.json();
        })
        .then(data => {
            console.log('Datos obtenidos:', data);
            if (data.grafanaValue !== undefined) {
                document.getElementById('stnearValue').value = data.grafanaValue.toFixed(4);
            } else {
                document.getElementById('stnearValue').value = 'No disponible';
            }
            if (data.totalVP !== undefined) {
                document.getElementById('totalVotes').value = data.totalVP;
            } else {
                document.getElementById('totalVotes').value = 'No disponible';
            }
        })
        .catch(error => {
            console.error('Error al obtener los datos:', error);
            document.getElementById('stnearValue').value = 'Error';
            document.getElementById('totalVotes').value = 'Error';
        });
});

function calculateVotes() {
    console.log('Calculando votos...');
    const treasuryBalance = parseFloat(document.getElementById('treasuryBalance').value);
    const requestedGrant = parseFloat(document.getElementById('requestedGrant').value);
    const totalVotes = parseInt(document.getElementById('totalVotes').value, 10);
    const stnearValue = parseFloat(document.getElementById('stnearValue').value);

    if (isNaN(treasuryBalance) || isNaN(requestedGrant) || isNaN(totalVotes) || isNaN(stnearValue)) {
        alert('Por favor, asegúrate de que todos los campos estén llenos con valores numéricos válidos.');
        return;
    }

    const totalValueInTreasury = treasuryBalance * stnearValue;
    const requiredVotes = (requestedGrant / totalValueInTreasury) * totalVotes;
    const percentageNeeded = (requiredVotes / totalVotes) * 100;

    document.getElementById('requiredVotes').textContent = `Required Votes: ${requiredVotes.toFixed(0)}`;
    document.getElementById('percentageNeeded').textContent = `Percentage of Votes Needed: ${percentageNeeded.toFixed(2)}%`;
}