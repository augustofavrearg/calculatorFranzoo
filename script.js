window.onload = function() {
    fetch('http://localhost:3000/scrape')
        .then(response => response.json())
        .then(data => {
            const totalVotes = data.totalVP || 0;
            document.getElementById('totalVotes').value = totalVotes; // Actualizar el campo totalVotes con el valor obtenido
        })
        .catch(error => {
            console.error('Error al obtener los datos:', error);
            document.getElementById('totalVotes').value = 'No disponible';
        });
};

function calculateVotes() {
    // Get the input values
    const treasuryBalance = parseFloat(document.getElementById('treasuryBalance').value);
    const stnearValue = parseFloat(document.getElementById('stnearValue').value);
    const totalVotes = parseInt(document.getElementById('totalVotes').value, 10);
    const requestedGrant = parseFloat(document.getElementById('requestedGrant').value);

    // Calculate total value in treasury
    const totalValueInTreasury = treasuryBalance * stnearValue;

    // Calculate required votes
    const requiredVotes = (requestedGrant / totalValueInTreasury) * totalVotes;

    // Calculate percentage of votes needed
    const percentageNeeded = (requiredVotes / totalVotes) * 100;

    // Display results
    document.getElementById('requiredVotes').textContent = `Required Votes: ${requiredVotes.toFixed(0)}`;
    document.getElementById('percentageNeeded').textContent = `Percentage of Votes Needed: ${percentageNeeded.toFixed(2)}%`;
}

