const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: process.env.CHROME_EXECUTABLE_PATH || '/usr/bin/google-chrome-stable'
    });

    const page = await browser.newPage();

    try {
        // Navegar a la primera página y esperar a que cargue
        await page.goto('https://eth-metapool.narwallets.com/votes/table/user?id=brianmai.near&dateIso=2024-07-01');
        await page.waitForSelector('body');

        // Extraer el texto completo del cuerpo de la página
        const pageContent = await page.evaluate(() => document.body.innerText);
        console.log('Contenido de la página:', pageContent);

        // Extraer el número específico utilizando expresiones regulares
        const regex = /total VP:\s*([\d,]+)/i;
        const match = pageContent.match(regex);
        const totalVPText = match ? match[1] : '0';

        // Convertir el texto del número a un número entero sin comas
        const totalVP = parseInt(totalVPText.replace(/,/g, ''), 10);

        console.log('Total VP:', totalVP);

        // Navegar a Grafana y obtener el valor de stNEAR
        await page.goto('https://stats.metapool.app/d/o6-y_wQ7k/meta-pool-public-dashboard?orgId=2');
        await page.waitForSelector('#reactRoot > div > main > div.css-1mwktlb > div > div > div.scrollbar-view > div > div:nth-child(2) > div > div:nth-child(15) > section > div.panel-content.panel-content--no-padding > div > div > div > div:nth-child(1) > div > div > span:nth-child(2)', { timeout: 60000 });

        // Extraer el valor de stNEAR
        const stnearValueText = await page.evaluate(() => {
            const element = document.querySelector('#reactRoot > div > main > div.css-1mwktlb > div > div > div.scrollbar-view > div > div:nth-child(2) > div > div:nth-child(15) > section > div.panel-content.panel-content--no-padding > div > div > div > div:nth-child(1) > div > div > span:nth-child(2)');
            return element ? element.textContent : null;
        });

        if (!stnearValueText) {
            throw new Error('No se pudo encontrar el valor de stNEAR en Grafana');
        }

        console.log('Valor de stNEAR:', stnearValueText);

        const stnearValue = parseFloat(stnearValueText.replace(/[^0-9.]/g, ''));

        res.status(200).json({ totalVP, stnearValue });
    } catch (error) {
        console.error('Error en el scraping:', error);
        res.status(500).json({ error: 'Error al obtener los datos.' });
    } finally {
        await browser.close();
    }
};


