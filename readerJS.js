'use scrict';
xmlContent = '';
let table = document.querySelector('#mainTable');
let divBlock = document.createElement('div');
var finalXMLParse;
var newParam;
var oldOffers;
var OffersNameArr = [];
OffersName = {};

const axios = require('axios');
const cheerio = require('cheerio');

function addingNewTable() {
    table.innerHTML += `<tr><td>ID</td><td>Рус. название</td><td>Укр. название</td><td>Цена</td></tr>`;
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

function fetching(addingNewTable) {
    
    fetch('https://masteram.com.ua/uk/yml/epicentr-stem-1/').then((response) => {

        response.text().then((xml) => {
            let parse = new DOMParser();
            finalXMLParse = parse.parseFromString(xml, 'text/xml');
            console.log(finalXMLParse);
            oldOffers = finalXMLParse.querySelectorAll('offer');
            oldOffers.forEach((item) => {
                newParam = finalXMLParse.createElement('newParam');
                newParam.innerHTML = "Атрибуты параметра";
                item.appendChild(newParam);

            });
            oldOffers.forEach((item) => {
                OffersName.id = item.getAttribute('id');
                OffersName.ruLang = item.querySelector(`[lang="ru"]`).innerHTML;
                OffersName.uaLang = item.querySelector(`[lang="ua"]`).innerHTML;
                OffersName.price = item.querySelector(`price`).innerHTML;
                let ObjBuffer = Object.assign({}, OffersName);
                OffersNameArr.push(ObjBuffer);
            });
        })
        document.body.append(divBlock);
    });
    console.log("Finished!");
    setTimeout(addingNewTable, 1000);
    
}
fetching(addingNewTable);


