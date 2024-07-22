// api/scrape.js

const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto('https://eth-metapool.narwallets.com/votes/table/user?id=brianmai.near&dateIso=2024-07-01', {
      waitUntil: 'networkidle2'
    });

    await page.waitForSelector('body');
    
    const result = await page.evaluate(() => {
      const pageContent = document.body.textContent;
      const regex = /(\d{1,3}(?:,\d{3})*)\s*total VP/i;
      const match = pageContent.match(regex);
      const totalVP = match ? match[1].replace(/,/g, '') : '0';
      return { totalVP };
    });

    await browser.close();

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in scraping:', error);
    res.status(500).json({ error: 'Failed to scrape data' });
  }
};
