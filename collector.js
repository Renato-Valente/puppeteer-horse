//Este script coleta todos os links disponiveis e os escreve no arquivo links.txt

const puppeteer = require('puppeteer');
const fs = require('fs');

const main = async () => {
    const browser = await puppeteer.launch({
        headless: false
    });

    const page = await browser.newPage();
    fs.writeFile('./links.txt', '', (err) => {
        if(err) console.error('deu erro', err);
    })

    const getPageLinks = async (pageIndex) => {
        await page.goto(`https://www.appmais.com.br/inscricao-online/ordem_de_entrada_resultado/?concurso=${pageIndex}`);
        const title = await page.title();
        if(title) console.log(title);

        const elements = await page.$$eval('.scButton_default', (elements) => {
            return elements.map((e) => {
                return {
                    click: e.getAttribute('onclick'),
                    text: e.textContent
                }
            })
        })

        if(!elements) return;
        const results = elements.filter((e) => {
            return (/Resultado/.test(e.text) && !e.click.includes('alert') && !e.click.includes('pdf'))
        })

        const links = results.map((i) => {
            const result = i.click.match(/'([^']+)'/);
            if(!result) return;
            return 'https://www.appmais.com.br/inscricao-online/' + result[1].replace(/ /g, '%20').slice(3);
        })

        if(!links) return;
        //console.log('links: ', links);
        links.forEach((link) => {
            console.log(link);
            fs.appendFile(`./links.txt`, link + '\n', (err) => {
                if(err){
                    console.error('erro ao tentar escrever no arquivo', err);
                }
            });
        })
    }


    for(let pageIndex = 1; pageIndex <= 300; pageIndex++){
        await getPageLinks(pageIndex);
    }

    await browser.close();
}

main();
