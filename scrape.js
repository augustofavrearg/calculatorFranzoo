const puppeteer = require('puppeteer');

async function scrapeVotes() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        // Navegar a la página que contiene la información de votos
        await page.goto('https://eth-metapool.narwallets.com/votes/table/user?id=brianmai.near&dateIso=2024-07-01');
        
        // Esperar a que el contenido necesario esté cargado
        await page.waitForSelector('body'); // Espera cualquier elemento <body> en la página

        // Extraer el número que precede a "total VP"
        const totalVP = await page.evaluate(() => {
            const pageContent = document.body.textContent; // Obtener el contenido completo de la página
            const regex = /(\d{1,3}(?:,\d{3})*)\s*total VP/i; // Expresión regular para encontrar el número antes de "total VP"
            const match = pageContent.match(regex);
            return match ? match[1].replace(/,/g, '') : '0'; // Eliminar comas y retornar el número encontrado o '0' si no se encuentra
        });

        console.log(`Total VP: ${totalVP}`);
    } catch (error) {
        console.error('Error en el scraping:', error);
    } finally {
        await browser.close();
    }
}

scrapeVotes();
