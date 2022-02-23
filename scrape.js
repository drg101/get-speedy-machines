import puppeteer from "puppeteer";
import fs from 'fs';
import { exec } from "child_process";

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

const write_machine_list_to_file = (machine_list_json, path, silent=false) => {
    if (!silent) {
        console.log("\n\nWriting...")
        console.log(machine_list_json.slice(0,5))
    }

    const file_contents = machine_list_json.map(node => node.machine).join("\n")
    fs.writeFileSync(path, file_contents)
}


let blacklist;

const get_blacklist = () => {
    return new Set(fs.readFileSync('blacklist.txt').toString().split('\n'));
}

blacklist = get_blacklist();

(async () => {
    let times_run = 0;

    while (true) {
        if(times_run % 60 === 0) {
            console.log("\n=-=-=-=-=-=\n rebuilding blacklist \n=-=-=-=-=-=\n")
            blacklist = get_blacklist();
            try {
                exec('./create_blacklist.sh');
            }
            catch {}
        }
        
        const top = await get_top();
        write_machine_list_to_file(top, './all_machines.txt', true);
        const filtered = top.filter(n => !blacklist.has(n.machine));
        const sorted = filtered.sort((a,b) => (a.cpu + a.memory) - (b.cpu + b.memory));
        write_machine_list_to_file(sorted, '/s/chopin/n/under/dr101/public_html/good_machines.txt');
        await new Promise(resolve => {
            setTimeout(() => {
                resolve()
            }, 30000)
        })
        times_run++;
    }
})()
