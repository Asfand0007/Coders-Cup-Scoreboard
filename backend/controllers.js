const puppeteer = require('puppeteer');
const chromium = require('@sparticuz/chromium');
const puppeteerCore = require('puppeteer-core');

const URL = 'https://vjudge.net/contest/587923#rank';

const getData = async () => {
    let browser = null;

    if (process.env.NODE_ENV === 'development') {
        console.log('Running in development mode with Puppeteer');
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true,
        });
    } else if (process.env.NODE_ENV === 'production') {
        console.log('Running in production mode with Puppeteer-Core and Chromium');
        browser = await puppeteerCore.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });
    }

    const page = await browser.newPage();
    await page.goto(URL);
    await page.waitForSelector('#contest-rank-table');

    const data = await page.evaluate(() => {
        const rows = document.querySelectorAll('#contest-rank-table tbody tr');
        const result = [];

        rows.forEach(row => {
            const rank = row.querySelector('td.rank').innerText.trim();
            const teamName = row.querySelector('td.team a').innerText.trim();
            const score = row.querySelector('td.solved span').innerText.trim();
            const problems = [];
            const problemCells = row.querySelectorAll('td.prob');

            problemCells.forEach(cell => {
                const accepted = cell.classList.contains('accepted');
                const failed = cell.classList.contains('failed');
                let time = '';

                let problemStatus = 'Not attempted';
                if (accepted) {
                    problemStatus = 'Accepted';
                    time = cell.innerText.split('<br>')[0].trim().split('\n')[0].trim();
                } else if (failed) {
                    problemStatus = 'Failed';
                }

                problems.push({
                    status: problemStatus,
                    time: time
                });
            });

            result.push({ rank, teamName, score, problems });
        });

        return result;
    });

    await browser.close();
    return data;
};

const getRanking = async () => {
    try {
        const data = await getData();
        return data;
    } catch (e) {
        console.log(e.message);
        return { error: e.message };
    }
};

module.exports = { getRanking };
