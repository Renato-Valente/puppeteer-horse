//Este script lê o arquivo result.json para tratar as informações, deixá-las
//no formato correto e então as escreve no arquivo finalFile.json

const fs = require('fs');
console.log('I am the generator hahaahah');

format_row = (row, table) => {

    const result = {};
    result.id = null;
    result.category = row.CATEGORIA ? row.CATEGORIA : 'Não informado';

    //extraindo o valor de data ex: 23/02/2019
    const date = table.header.match(/(\d{2}\/\d{2}\/\d{4})/g);
    result.ano_prova = date ? date[0].slice(-4) : "Não informado";

    //capturando o valor de hora ex: 9h30min
    const hora = table.header.match(/(\d{2}:\d{2})/g);
    result.hora = hora ? hora[0] : 'Não informado';

    //extraindo o valor de fouls
    if(row.FALTA == undefined || row.FALTA == null) {
        result.fouls = 'Não informado';
    }
    else {result.fouls = row.FALTA};

    if(result.fouls == 'FORF.') result.fouls = 'Forfait';
    if(result.fouls == 'ELIM.') result.fouls = 'Eliminado';

    //extraindo o valor de altura ex: 1,00M
    const altura = table.header.match(/(\d{1},\d{2}M)/g);

    result.dados_prova = {
        hora: hora ? hora[0] : 'Não informado',
        data: date ? date[0] : 'Não informado',
        altura_salto: altura ? altura[0] : 'Não informado',

    }



    result.classification = row.CL ? row.CL : 'Não informado';

    result.competitorInfo = {
        competitor: row.CONCORRENTE ? row.CONCORRENTE : 'Não informado',
        entity: row.ENTIDADE ? row.ENTIDADE : 'Não informado',
        county: null
    }

    result.cavalo = {
        name: row.CAVALO ? row.CAVALO : 'Não informado',
        birth_date: null,
        sex: null,
        race: null,
        owner: row.CONCORRENTE ? row.CONCORRENTE : 'Não informado',
    }

    result.time = row.TEMPO ? row.TEMPO : 'Não informado',

    result.federation = 'TODO';

    return result;

}

const file = JSON.parse(fs.readFileSync('./result.json'));
const finalData = [];
/* for(const item of file) {
    finalData.push({...item});
} */

//console.log(finalData);


if(!file) return;
for(const table of file){
    const newTable = {
        header: table.header,
        link: table.link,
        name: table.name
    }
    const sheet = table.sheet;
    const newSheet = [];
    for(const row of sheet){
        if(row['FALTA_1'] || row['TEMPO_1']) {
            const copy = {...row};
            console.log('adding copy row', copy);
            copy.FALTA = row['FALTA_1'];
            copy.TEMPO = row['TEMPO_1'];
            delete copy['FALTA_1'];
            delete copy['TEMPO_1'];
            delete row['FALTA_1'];
            delete row['TEMPO_1'];
            //console.log('imprimindo uma copia');
            //console.log(format_row(copy, table));
            newSheet.push(format_row(copy, table));
        }
        newSheet.push(format_row(row, table));
        //finalData[index].sheet = format_row(row, table);
        //console.log(format_row(row, table));
    }
    //newTable.sheet = newSheet;
    finalData.push({...newTable, sheet: newSheet});
}

fs.writeFileSync('./finalFile.json', JSON.stringify(finalData, null, 2));

for(const item of finalData) {
    //console.log(item);
}

//console.log(finalData)

