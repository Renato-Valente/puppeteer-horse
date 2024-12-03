const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/* const readLink = async (link) => {
    const browser = await puppeteer.launch({
        headless: false
    });

    const page = await browser.newPage();
    const downloadPath = path.resolve('./meus-downloads');
    await page._client().send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: downloadPath
  });
    await page.goto(link);
    console.log('started downloading');
    await page.evaluate(() => {
        nm_gp_move('xls', '1', 'grid');
    })
    await new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            const files = fs.readdirSync(downloadPath);
            const downloading = files.some((file) => file.endsWith('.crdownload'));

            if(!downloading) {
                console.log('finisehd downloading')
                clearInterval(interval);
                resolve();
            }
            //else{console.log('not finished yet')}
        }, 1000)
    });
    await browser.close();

} */

const links = fs.readFileSync('./links.txt', 'utf8').split('\n');
console.log('links:', links);


(async () => {
    const downloadPath = path.resolve('./meus-downloads');
    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath); // Cria o diretório se não existir
    }
  
    for (const link of links) {
      console.log('starting download');
      const browser = await puppeteer.launch({
        headless: false,
      });
      const page = await browser.newPage();
      await new Promise(async (resolve) => {
        await page.goto(link);
  
        // Substitua pela função que inicia o download
        await page.evaluate(() => {
          nm_gp_move('xls', '1', 'grid');
        });
  
        // Configura o comportamento de download
        await page._client().send('Page.setDownloadBehavior', {
          behavior: 'allow',
          downloadPath: downloadPath,
        });
  
        // Monitora o progresso do download
        const interval = setInterval(() => {
          const files = fs.readdirSync(downloadPath);
          const downloading = files.some((file) => file.endsWith('.crdownload'));
  
          if (!downloading) {
            console.log('finished downloading');
            clearInterval(interval);
            browser.close();
            resolve();
          }
        }, 1000);
      });
    }
  
    console.log('Todos os downloads concluídos.');
  })();
  

//readLink('https://www.appmais.com.br/inscricao-online/resultado_online/?concurso=38&prova=PROVA%2001&ordem=classificacao_geral');
