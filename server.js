const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const port = 3000;

// Servir archivos estáticos desde el directorio raíz
app.use(express.static(path.join(__dirname, '/')));

// Ruta para obtener los datos con Puppeteer
app.get('/scrape', async (req, res) => {
    try {
        const data = await scrapeData();
        console.log('Datos obtenidos:', data); // Verifica en la consola que obtienes los datos correctamente
        res.json(data);
    } catch (error) {
        console.error('Error al scrapear los datos:', error);
        res.status(500).json({ error: 'Ocurrió un error al obtener los datos.' });
    }
});

async function scrapeData() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        // Navegar a la página y esperar a que cargue
        await page.goto('https://eth-metapool.narwallets.com/votes/table/user?id=brianmai.near&dateIso=2024-07-01');
        await page.waitForSelector('body');  // Espera al cuerpo de la página

        // Extraer el texto completo del cuerpo de la página
        const pageContent = await page.evaluate(() => document.querySelector('body').textContent);

        // Extraer el número específico utilizando expresiones regulares
        const regex = /total VP:\s*([\d,]+)/;
        const match = pageContent.match(regex);
        const totalVPText = match ? match[1] : '0'; // Si no se encuentra, devuelve '0'
        
        // Convertir el texto del número a un número entero sin comas
        const totalVP = parseInt(totalVPText.replace(/,/g, ''), 10);

        return { totalVP };
    } catch (error) {
        console.error('Error en el scraping:', error);
        return { error: 'Error al obtener los datos.' };
    } finally {
        await browser.close();
    }
}

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
