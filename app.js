'use scrict';
//ПАРСИМ ДАННЫЕ С МАСТЕРАМ
let URLForm = document.forms[0];
let start_button = document.querySelector('#button_2');
let parse_yml_button = document.body.querySelector('#button_3');
let table = document.querySelector('#mainTable');
table.className = 'invisible';
let divBlock = document.createElement('div');
let inputURL_Button = document.querySelector('#inputURL_Button');
document.body.append(divBlock);
divBlock.classList.add('console');
let iterate = 1;

let OffersName = {};
let OffersNameArr = [];
const axios = require('axios');
const cheerio = require('cheerio');



const {
    getChildren
} = require('domutils');

start_button.addEventListener('click', MasteramParseBuilder);
parse_yml_button.addEventListener('click', initYML_Parser);

// inputURL_Button.addEventListener('click',somefunc);
//masteram parser
//основной замес с коннектом на мастерам и формированием массивов данных 


function MasteramParseBuilder() {
        //инициализация формы и ожидание ввода данных (урл)
        document.forms[0].classList.toggle('URLform_active');
        document.forms[0].classList.toggle('URLform_disable');
        $('#inputURL_Button').on('click', function (e) {
            e.preventDefault(); 
            initMasteramParser();
        });
}

function initMasteramParser() {
    table.className = 'invisible';
    let multimetters_list = [];
    let multimetter = {};
    let link;
    table.innerHTML = '';
    let input_value = document.getElementById("url").value;


    logTxt('connecting to masteram...<img  src="loading.gif" width="20" height="20" alt="загрузка" >');
    axios.get(`${input_value}`).then(html => {
        logTxt('......................');
        const htmlData = cheerio.load(html.data);
        let text = '';
        htmlData('.pr-t_link').each((i, elem) => {
            text += `${htmlData(elem).text()}\n`;
            link = `https://masteram.com.ua/${htmlData(elem).attr('href')}`;

            parseFeatures(link, multimetter, multimetters_list);
        });
        // console.log(link);


        //допиляти парс
        function parseFeatures(fromURL, parseObj, outputTo) {
            axios.get(fromURL).then((html) => {
                parseObj.ua_features = '';
                parseObj.ru_features = '';
                parseObj.id = '';

                const linkData = cheerio.load(html.data);
                linkData(`[class = "prp_id align-center"]`).each((i, elem) => {
                    parseObj.id += `${linkData(elem).text()}`;
                });
                let miniFeaturesAreParsed = false; //проверяем, спарсили ли мы таблицу в таблице
                linkData('h2:contains("Особливості")').next().children().each((i, elem) => {
                    miniFeaturesAreParsed = false;
                    linkData(elem).children().children().each((i, elem2) => {
                        // ДОДЕЛАТЬ ПРОВЕРКУ ПО ТЕГУ И ДЕСТРУКТУРИЗАЦИЮ
                        parseObj.ua_features += `&lt;p&gt;${linkData(elem2).text()}&lt;/p&gt; `;
                        miniFeaturesAreParsed = true;
                    });

                    if (!miniFeaturesAreParsed) {
                        parseObj.ua_features += `&lt;p&gt;${linkData(elem).text()}&lt;/p&gt; `;
                    }
                });

                linkData('h2:contains("Комплектація")').next().children().each((i, elem) => {
                    parseObj.complect += `&lt;p&gt;${linkData(elem).text()}&lt;/p&gt; `;

                });

                outputTo.push(Object.assign({}, parseObj));
                parseObj.complect = '';
                parseObj.ua_features = '';
            });
        }
        //Переробити функ під універсал
        setTimeout(addingNewTable, 3000, "Особенности", "Комплектация", multimetters_list, 100);

    });
};

//вспомогательная функция, которая билдит таблицу
function addingNewTable(col_name_2, col_name_3, objArr, maxCount = 50) {
    logTxt('Starting to create table');
    table.innerHTML += `<tr><td>ID</td><td>${col_name_2}</td><td>${col_name_3}</td></tr>`;
    for (let i = 0; i < objArr.length; i++) {
        if (i > maxCount) {
            break;
        }
        table.innerHTML += `<tr class = "griddy"><td class="offerID">${objArr[i].id}.
        </td><td class="first">${objArr[i].ua_features}</td><td class="first">${objArr[i].complect}</td></tr>`;
    }
    clearLog();
    setTimeout(visibleTable, 10);
}
//XLSX МОДУЛЬ 2

//XLSX МОДУЛЬ
// const xlsx = require('xlsx');
// let file = xlsx.readFile('parser.xlsx');
// let ws = file.Sheets['One'];
// let data = xlsx.utils.sheet_to_json(ws);
// console.log(data.One);
// let newData = data.map(function (record) {
//     record.Net = record.One - record.Two + 100;
//     delete record.One;
//     return record;
// });
// var newWB = xlsx.utils.book_new();
// var newWS = xlsx.utils.json_to_sheet(newData);
// xlsx.utils.book_append_sheet(newWB, newWS, 'New Data');
// xlsx.writeFile(newWB, 'readyFile.xlsx');
// console.log(data);



//yml parser
function initYML_Parser() {

    table.innerHTML = '';
    clearLog();
    parseYML(generateDefaultTable);

    function generateDefaultTable() {
        table.innerHTML += `<tr><td>ID</td><td>Укр название</td><td>Ru Название</td> <td>Цена</td> <td> Фото </td>  <td>Описание UA</td> <td>Описание RU</td> 
    <td>Категория</td> <td>Наличие</td>  </tr>`;
    };

    function parseYML(generateDefaultTable) {
        table.className = 'invisible';
        let xmlContent = '';
        var offers = [];
        // let offer = {
        //     id,
        //     price,
        //     pic,
        //     nameUa,
        //     nameRu,
        //     desUa,
        //     desRu
        // };
        logTxt(`init yml parse script: ${iterate++}`);
        fetch('https://masteram.com.ua/uk/yml/epicentr-stem-1/').then((response) => {
            logTxt('xml response...');
            response.text().then((xml) => {
                logTxt('xml ready.');
                let e_iterator = 0;
                logTxt('generating default table...');
                generateDefaultTable();

                let parser = new DOMParser();
                let XMLDocument = parser.parseFromString(xml, 'application/xml');
                offers = XMLDocument.querySelectorAll('offer');
                logTxt('offers ready.');

                offers.forEach((item) => {
                    OffersName.id = item.getAttribute('id');
                    OffersName.nameUA = item.querySelector(`name[lang="ua"]`);
                    OffersName.nameRU = item.querySelector(`name[lang="ru"]`);
                    OffersName.price = `0${item.querySelector(`price`).textContent}`;
                    OffersName.picture = item.querySelector('picture');
                    OffersName.descriptionUA = item.querySelector('description[lang="ua"]');
                    OffersName.descriptionRU = item.querySelector('description[lang="ru"]');
                    OffersName.category = item.querySelector('category');
                    OffersName.available = item.getAttribute('available');
                    let ObjBuffer = Object.assign({}, OffersName);
                    OffersNameArr.push(ObjBuffer);
                });

                addRow('mainTable', OffersNameArr.length, 8);
                setTimeout(visibleTable, 10);
                //проходимся по все офферам, билдим обьект офера и отправляем в таблицу
                // try {
                //     offers.forEach((item) => {
                //         logTxt('starting to eaching offers!');
                //         item.getAttribute('id');
                //         table.innerHTML += `<tr><td>${item.getAttribute('id')}</td>
                //         <td>${item.querySelector('price')}</td>
                //         <td>${item.querySelector('picture')}</td>
                //         <td>${item.querySelector('picture')}</td>
                //         <td> ${item.querySelector('name[lang="ua"]')} ua</td>
                //         <td>${item.querySelector('name[lang="ru"]')} ru</td>
                //         <td>${item.querySelector('description[lang="ua"]')} ua</td> 
                //         <td>${item.querySelector('description[lang="ru"]')} ru</td> </tr>`;
                //         e_iterator++;
                //     });
                // } catch (e) {
                //     if (e < 50) throw e
                // }

            });
        });
    };
};


//consoleLogAnalog
function logTxt(str) {
    divBlock.innerHTML += (`>> ${str}<br>`);
}

function clearLog() {
    divBlock.innerHTML = (``);
}

function addRow(tableID, rowsAmount, cellsAmmount = 8) {
    // Get a reference to the table
    var tableRef = document.getElementById(tableID);
    let cellsArr = new Array(cellsAmmount);
    let rowArr = new Array(rowsAmount);

    // Append a text node to the cell
    for (let i = 0; i < rowsAmount; i++) {
        // Insert a row in the table at row index 0
        rowArr[i] = tableRef.insertRow(-1);
        // Insert a cell in the row at index 0

        //Проходим по обьекту (возвращая индекс значения и само значение и в этом же цикле вставляем в cells[i])
        Object.values(OffersNameArr[i]).forEach((item, y) => {
            cellsArr[y] = rowArr[i].insertCell(-1);
            if (typeof (item) == 'object') {
                cellsArr[y].textContent = (item.textContent);
            } else {
                cellsArr[y].textContent = (item);
            }

        });

    }
}



//да будет свет таблице!
function visibleTable() {
    table.className = 'visible';
}
//изменения кнопок при наведении
$(".buttonCard").each(function () {
    let oldText = $(this).children('button').text();
    $(this).hover(
        function () {

            $(this).children('button').text($(this).children('button').text() + " >>>");
            $(this).attr('class', 'buttonCard__active');
            $(this).children('button').attr('class', 'button__active');
            switch ($(this).children('button').attr('id')) {
                case 'button':
                    $(this).find('img').attr('src', "\\content\\excelGif.gif");
                    break;
                case 'button_2':
                    $(this).find('img').attr('src', "\\content\\MasteramGif.gif");
                    break;
                case 'button_3':
                    $(this).find('img').attr('src', "\\content\\ymlGif.gif");
                    break;
                default:
                    break;
            }


        },
        function () {
            $(this).children('button').text(oldText);
            $(this).attr('class', 'buttonCard');
            $(this).children('button').attr('class', 'button');
            switch ($(this).children('button').attr('id')) {
                case 'button':
                    $(this).find('img').attr('src', "\\content\\excelButtonStart.png");
                    break;
                case 'button_2':
                    $(this).find('img').attr('src', "\\content\\startMasteram.png");
                    break;
                case 'button_3':
                    $(this).find('img').attr('src', "\\content\\ymlStart.png");
                    break;
                default:
                    break;
            }
        }

    );
});

//наведение на кнопку СтартПарсинг
$('#inputURL_Button').hover(

    function () {
        $(this).text('Start >>');

    },
    function () {
        $(this).text('>');

    }
);

let x = $('main').children()[0].children()[0].textContent();
logTxt(x);