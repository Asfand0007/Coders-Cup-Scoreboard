const puppeteer = require('puppeteer');
const chromium = require('@sparticuz/chromium');
const puppeteerCore = require('puppeteer-core');
const userAgent = require('user-agents');

const URL = 'https://vjudge.net/contest/587923#rank';
const getData = async () => {
    let browser = null;
    const viewportSize = { width: 1920, height: 1080 };
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            defaultViewport: viewportSize
        });
    } catch (error) {
        console.error('Error:', error);
    }

    const page = await browser.newPage();
    await page.setUserAgent(new userAgent().toString());
    await page.goto(URL, { waitUntil: 'networkidle0' });  // Wait for network to be idle

    try {
        await page.waitForSelector('#contest-rank-table', { timeout: 60000 });  // Wait up to 60 seconds
    } catch (e) {
        console.error('Table not found:', e);
        await page.screenshot({ path: 'error_screenshot.png' });
        console.log(await page.content());
        await browser.close();
        return { error: 'Table not found' };
    }

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
