import puppeteer from "puppeteer";
import fs from 'fs';

const machinestats_url = 'https://www.cs.colostate.edu/machinestats';

const get_top = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(machinestats_url);
    const first_n_machines = await page.evaluate((n) => {
        const table_body = document.querySelector('tbody');
        const rows = [...table_body.children].slice(1);
        const machines = rows.map(trow =>  { 
            const cols = [...trow.children];
            return {
                machine: cols[0].innerText,
                cpu: Number(cols[4].innerText),
                memory: Number(cols[6].innerText)
            }
        })

        return machines
    });
    await browser.close();
    return first_n_machines;
};

const write_machine_list_to_file = (machine_list_json, path) => {
    const file_contents = machine_list_json.map(node => node.machine).join("\n")
    fs.writeFileSync(path, file_contents)
}

(async () => {
    while (true) {
        const top = await get_top();
        const sorted = top.sort((a,b) => (a.cpu + a.memory) - (b.cpu + b.memory));
        write_machine_list_to_file(sorted, '/home/drg101/public_html/good_machines.txt');
        await new Promise(resolve => {
            setTimeout(() => {
                resolve()
            }, 30000)
        })
    }
})()