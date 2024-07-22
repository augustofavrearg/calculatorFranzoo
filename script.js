console.log('Script cargado');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, iniciando carga de datos...');

    const calculateButton = document.getElementById('calculateButton');
    if (calculateButton) {
        calculateButton.addEventListener('click', calculateVotes);
    } else {
        console.error('El botón de calcular no se encontró en el DOM.');
    }

    // Realiza el scraping para obtener el valor de stNEAR y totalVP
    fetch('/api/scrape')
        .then(response => {
            console.log('Respuesta recibida:', response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos obtenidos:', data);

            const stnearValueElement = document.getElementById('stnearValue');
            const totalVotesElement = document.getElementById('totalVotes');

            if (!stnearValueElement || !totalVotesElement) {
                console.error('Elementos de valor stNEAR o totalVotes no encontrados en el DOM.');
                return;
            }

            if (data.grafanaValue !== undefined) {
                stnearValueElement.value = data.grafanaValue.toFixed(4);
            } else {
                stnearValueElement.value = 'No disponible';
            }

            if (data.totalVP !== undefined) {
                totalVotesElement.value = data.totalVP;
            } else {
                totalVotesElement.value = 'No disponible';
            }
        })
        .catch(error => {
            console.error('Error al obtener los datos:', error);

            const stnearValueElement = document.getElementById('stnearValue');
            const totalVotesElement = document.getElementById('totalVotes');

            if (stnearValueElement) {
                stnearValueElement.value = 'Error';
            }
            if (totalVotesElement) {
                totalVotesElement.value = 'Error';
            }
        });
});

function calculateVotes() {
    console.log('Calculando votos...');

    const treasuryBalanceElement = document.getElementById('treasuryBalance');
    const requestedGrantElement = document.getElementById('requestedGrant');
    const totalVotesElement = document.getElementById('totalVotes');
    const stnearValueElement = document.getElementById('stnearValue');

    if (!treasuryBalanceElement || !requestedGrantElement || !totalVotesElement || !stnearValueElement) {
        console.error('Uno o más elementos del DOM no se encontraron.');
        alert('Uno o más campos necesarios no se encontraron.');
        return;
    }

    const treasuryBalance = parseFloat(treasuryBalanceElement.value);
    const requestedGrant = parseFloat(requestedGrantElement.value);
    const totalVotes = parseInt(totalVotesElement.value, 10);
    const stnearValue = parseFloat(stnearValueElement.value);

    if (isNaN(treasuryBalance) || isNaN(requestedGrant) || isNaN(totalVotes) || isNaN(stnearValue)) {
        alert('Por favor, asegúrate de que todos los campos estén llenos con valores numéricos válidos.');
        return;
    }

    const totalValueInTreasury = treasuryBalance * stnearValue;
    const requiredVotes = (requestedGrant / totalValueInTreasury) * totalVotes;
    const percentageNeeded = (requiredVotes / totalVotes) * 100;

    const requiredVotesElement = document.getElementById('requiredVotes');
    const percentageNeededElement = document.getElementById('percentageNeeded');

    if (requiredVotesElement) {
        requiredVotesElement.textContent = `Required Votes: ${requiredVotes.toFixed(0)}`;
    } else {
        console.error('Elemento requiredVotes no encontrado en el DOM.');
    }

    if (percentageNeededElement) {
        percentageNeededElement.textContent = `Percentage of Votes Needed: ${percentageNeeded.toFixed(2)}%`;
    } else {
        console.error('Elemento percentageNeeded no encontrado en el DOM.');
    }
}
