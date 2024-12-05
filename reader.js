//este script lê todos os links de arquivo links.txt, faz o download dos arquivos .xls
//encontrados nos respectivos links e gera o arquivo result.json

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const links = fs.readFileSync('./links.txt', 'utf8').split('\n');
console.log('links:', links);

const repeatedNames = []; //Este array deve armazenar os nomes dos arquivos que já foram passados
//para renameArray, evitando nomes repetidos
const result = [];


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
        //print header information
        const headerArray = await page.$$eval('.scGridHeaderFont', (data) => {
            return data.map((item) => {
                return item.textContent;
            });
        })
        const header = headerArray.find((line) => {
            return line.includes('PROVA') || line.includes('RESULTADO') || line.includes('HORA')
        })
        console.log('header: ', header);

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
            console.log('finished downloading:');
            const name = fs.readdirSync(downloadPath).find((i) => {
                return i.startsWith('sc_xls') && !repeatedNames.includes(i)
            });
            repeatedNames.push(name);
            result.push({name, link, header})

            clearInterval(interval);
            browser.close();
            resolve();
          }
        }, 1000);
      });
    }
  

    //console.log('result: ', result);
    console.log('Todos os downloads concluídos.');
    const finalResult = [];
    for(const item of result){
        const sheet = XLSX.readFile(`${downloadPath}/${item.name}`).Sheets['Consulta'];
        const finalSheet = XLSX.utils.sheet_to_json(sheet);
        finalResult.push({...item, sheet: finalSheet})
    }
    console.log(finalResult);

    fs.writeFileSync('./result.json', JSON.stringify(finalResult, null, 2))
  })();
  

//readLink('https://www.appmais.com.br/inscricao-online/resultado_online/?concurso=38&prova=PROVA%2001&ordem=classificacao_geral');
