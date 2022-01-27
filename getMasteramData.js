'use scrict';
//ПАРСИМ ДАННЫЕ С МАСТЕРАМ
const axios = require('axios');
const cheerio = require('cheerio');
const { getChildren } = require('domutils');

let table = document.querySelector('#mainTable');
let divBlock = document.createElement('div');

let multimetters_list = [];
let multimetter = {};
let link;
console.log('connecting to masteram...');
axios.get('https://masteram.com.ua/uk/catalogue/test-and-measuring-equipment/multimeters/').then(html => {
    const htmlData = cheerio.load(html.data);
    let text = '';
    htmlData('.pr-t_link').each((i, elem) => 
    {
        alert('232');
        text += `${htmlData(elem).text()}\n`;
        link = `https://masteram.com.ua/${htmlData(elem).attr('href')}`;

        parseFeatures(link,multimetter,multimetters_list[i]);
    });
    // console.log(link);

    function parseFeatures(fromURL, parseObj, outputTo)
    {

        axios.get(fromURL).then((html) => {
            parseObj.ua_features = '';
            parseObj.ru_features = '';
            parseObj.id = '';

            const linkData = cheerio.load(html.data);
            linkData(`[class = "prp_id align-center"]`).each((i, elem) => 
                {
                    parseObj.id += `${linkData(elem).text()}`;
                });
            linkData(`[class = "page_product_description prd-overview"] > ul`).first().each((i, elem) => 
                {
                    parseObj.ua_features += `${i}: ${linkData(elem).text()}\n`;
                });
    
        console.log(`My Text:${multimetter.ua_features}`);
    
        });

    }

    function addingNewTable() {
        table.innerHTML += `<tr><td>ID</td><td>ID</td><td>UA описание</td><td>RU Описание</td></tr>`;
        for (let i=0; i<OffersNameArr.length; i++) {
            if (i>50)
            {
                break;
            }
            console.log('addingNewRow!');
            table.innerHTML += `<tr class = "griddy"><td class="offerID"> ID: ${OffersNameArr[i].id}.
            </td><td class="offerLang">${OffersNameArr[i].ruLang}</td><td class="offerLang">${OffersNameArr[i].uaLang}</td><td>${OffersNameArr[i].price} грн</td></tr>`;   
        }
    
    }
    
});