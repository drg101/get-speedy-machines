import puppeteer from "puppeteer";

const sorted_by_memory = 'https://www.cs.colostate.edu/machinestats/?column=percent_used_memory&order=asc';
const sorted_by_cpu = 'https://www.cs.colostate.edu/machinestats/?column=cpu&order=asc';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(sorted_by_memory);
    const first_n_machines = await page.evaluate((n) => {
        const table_body = document.querySelector('tbody');
        const rows = [...table_body.children].slice(1, n+1);
        const machines = rows.map(trow => [...trow.children][0].innerText)

        return machines
    }, 10);
    console.log(first_n_machines)
    await browser.close();
})();