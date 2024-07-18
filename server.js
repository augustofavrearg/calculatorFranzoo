const express = require('express');
const { chromium } = require('playwright');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Servir archivos estáticos desde el directorio 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta raíz para servir el archivo HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para scraping
app.get('/scrape', async (req, res) => {
    try {
        const data = await scrapeData();
        console.log('Datos obtenidos:', data);
        res.json(data);
    } catch (error) {
        console.error('Error al scrapear los datos:', error);
        res.status(500).json({ error: 'Ocurrió un error al obtener los datos.' });
    }
});

async function scrapeData() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto('https://eth-metapool.narwallets.com/votes/table/user?id=brianmai.near&dateIso=2024-07-01');
        await page.waitForSelector('body', { timeout: 30000 });

        const totalVP = await page.evaluate(() => {
            const pageContent = document.body.innerText;
            const regex = /total VP:\s*([\d,]+)/i;
            const match = pageContent.match(regex);
            return match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
        });

        await page.goto('https://stats.metapool.app/d/o6-y_wQ7k/meta-pool-public-dashboard?orgId=2');
        await page.waitForSelector('#reactRoot > div > main > div.css-1mwktlb > div > div > div.scrollbar-view > div > div:nth-child(2) > div > div:nth-child(15) > section > div.panel-content.panel-content--no-padding > div > div > div > div:nth-child(1) > div > div > span:nth-child(2)', { timeout: 60000 });

        const grafanaValue = await page.evaluate(() => {
            const element = document.querySelector('#reactRoot > div > main > div.css-1mwktlb > div > div > div.scrollbar-view > div > div:nth-child(2) > div > div:nth-child(15) > section > div.panel-content.panel-content--no-padding > div > div > div > div:nth-child(1) > div > div > span:nth-child(2)');
            return element ? parseFloat(element.textContent.replace(/[^0-9.]/g, '')) : null;
        });

        return { totalVP, grafanaValue };
    } catch (error) {
        console.error('Error en el scraping:', error);
        return { error: 'Error al obtener los datos.' };
    } finally {
        await browser.close();
    }
}

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
