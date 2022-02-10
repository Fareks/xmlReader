'use scrict';
//ПАРСИМ ДАННЫЕ С МАСТЕРАМ
var resultArr = [];
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
let categoryName;
let OffersName = {};
let OffersNameArr = [];
let OfferFeatureArr = []; // сюда приходят обьекты в виде функция:необработанное значение
var itemFeaturesEpicSortedArr = [];
let paramName = 'Характеристики товара';
const axios = require('axios');
const cheerio = require('cheerio');
const {
    text
} = require('cheerio/lib/api/manipulation');

$('.categoryText').fadeOut(1);

const {
    getChildren,
    findOneChild
} = require('domutils');

start_button.addEventListener('click', MasteramParseBuilder);
parse_yml_button.addEventListener('click', initYML_Parser);

// inputURL_Button.addEventListener('click',somefunc);
//masteram parser
//основной замес с коннектом на мастерам и формированием массивов данных 

let FirstListener = 0;
function MasteramParseBuilder() {
    //инициализация формы и ожидание ввода данных (урл)
    if (document.forms[0].classList.contains('URLform_active')) {
        logTxt ("Проверка на URLform_active= "+document.forms[0].classList.contains('URLform_active'));
        document.forms[0].classList.remove('URLform_active');
        document.forms[0].classList.add('fade');
        document.forms[0].classList.add('URLform_disable');
        
    }
    else if (document.forms[0].classList.contains('URLform_disable')) {
        logTxt ("Проверка на URLform_disable= "+ document.forms[0].classList.contains('URLform_active'));
        document.forms[0].classList.remove('URLform_disable');
        document.forms[0].classList.add('show');
        document.forms[0].classList.add('URLform_active');
    }

    if (FirstListener == 0)
    {
        FirstListener++;
        $('#inputURL_Button').on('click', function (e) {
            
            e.preventDefault();
            initMasteramParser();
        });

    }

}

function initMasteramParser() {
    table.className = 'invisible';
    var item_list_ua = [];
    let item_as_object_ua = {};

    let item_list_ru = [];
    let item_as_object_ru = {};

    let ua_link;
    let rulink;
    table.innerHTML = '';
    let input_value = document.getElementById("url").value;
    var itemFeatures = []; //переменная, в которую будет заходить массивы с фиачерсами для вывода в таблицу
    var itemFeaturesEpic = [];


    logTxt('connecting to masteram...<img  src="https://fareks.github.io/xmlReader/loading.gif" width="20" height="20" alt="загрузка" >');

    axios.get(`${input_value}`).then(html => {
        logTxt('......................');

        const htmlData = cheerio.load(html.data);
        categoryName = htmlData('main').children().eq(1).children().eq(0).children().eq(0).text();
        let text = '';
        htmlData('.pr-t_link').each((i, elem) => {
            text += `${htmlData(elem).text()}\n`;
            ua_link = `https://masteram.com.ua/${htmlData(elem).attr('href')}`;
            rulink = `https://masteram.com.ua/ru${htmlData(elem).attr('href').slice(3)}`;
            parseFeatures(ua_link, rulink, item_as_object_ua, item_list_ua, item_as_object_ru, item_list_ru);

        });
        //допиляти парс
        function parseFeatures(fromURL, fromRUS_URL, parseObj, outputTo, parseObj_ru, outputTo_ru) {

            //ТУТ НЕОБХОДИМО ДОДЕЛАТЬ РУС ВЕРСИЮ ПАРСА, КОТОРАЯ БУДЕТ ТОЛЬКО БИЛДИТЬ МАССИВЫ ДЛЯ СОЗДАНИЯ ТАБЛИЦЫ
            axios.get(fromURL).then((html) => {
                parseObj.ua_features = '';
                parseObj.ru_features = '';
                parseObj.id = '';
                parseObj.complect = '';
                parseObj.warranty = '';


                const linkData = cheerio.load(html.data);

                linkData(`[class = "prp_id align-center"]`).each((i, elem) => {

                    parseObj.id += `${linkData(elem).text().slice(4)}`;
                });
                getItemsFeatures(categoryName, parseObj.id);
                parseObj.warranty = parseInt(linkData('[class="prp_info_item info-warranty"] > b').text());
                let miniFeaturesAreParsed = false; //проверяем, спарсили ли мы таблицу в таблице
                linkData(`h2:contains("Особливості"), h2:contains("ОСОБЛИВОСТІ")`).next().children().each((i, elem) => {
                    miniFeaturesAreParsed = false;
                    linkData(elem).children().children().each((i, elem2) => {
                        // ДОДЕЛАТЬ ПРОВЕРКУ ПО ТЕГУ И ДЕСТРУКТУРИЗАЦИЮ

                        parseObj.ua_features += `<p>${linkData(elem2).text()}</p>`;

                        miniFeaturesAreParsed = true;
                    });

                    if (!miniFeaturesAreParsed) {
                        parseObj.ua_features += `<p>${linkData(elem).text()}</p> `;

                    }
                });

                linkData('h2:contains("Комплектація"), h2:contains("КОМПЛЕКТАЦІЯ")').next().children().each((i, elem) => {
                    parseObj.complect += `<p>${linkData(elem).text()}</p> `;

                });

                //Функция для парса характеристик. Вход - стринг "Категория", выход - массив массивов(перечень из атрибутов "[Функции:...],[Измерение:...]")
                function getItemsFeatures(category, test) {
                    switch (category) {
                        case 'Мультиметри ':
                            paramName = 'Функции';
                            let regExp = new RegExp(/не/);
                            getFeature("list_to_list", ["Ємність", "Постійна напруга",
                                "Постійний струм", "Опір", "Змінна напруга",
                                "Змінний струм", "Температура", "Тестування діодів", "Частота"
                            ], ["емкость", "постоянное напряжение", "постоянный ток", "сопротивление",
                                "переменное напряжение", "переменный ток", "температура", "тестирование диодов", "частота"
                            ], regExp);
                            break;
                            //отдали getFeature все необходимые свойства, теперь превращаем в false все ненужное, используя РегВыр
                        case 'Паяльні станції термоповітряні ':
                            break;
                        case 'Паяльні станції ':
                            getFeature('text_area', ['Потужність']);

                        default:
                            break;
                    }

                    function getFeature(type, featuresArr = ['param1', 'param2'], featuresArrEpic = ['epicParam1', 'epicParam2'], regExp) {
                        if (type == "list_to_list") {

                            featuresArr.forEach((item, i) => {
                                if (!(regExp.test(linkData('.specification').find(`td:contains(${item})`).next().text())) && (linkData('.specification').find(`td:contains(${item})`).next().text().length > 0)) {
                                    itemFeaturesEpic.push(featuresArrEpic[i]);
                                }
                            });

                            itemFeaturesEpicSortedArr.push(`${itemFeaturesEpic.join(';')}`);
                            OfferFeatureArr.push(itemFeatures.join(';'));
                        } else if (type == "text_area") {
                            itemFeaturesEpic = featuresArr[0];
                            itemFeaturesEpicSortedArr.push(linkData('.specification').find(`td:contains(${featuresArr[0]})`).next().text());
                        }
                    }
                    itemFeatures = [];
                    itemFeaturesEpic = [];
                }


                outputTo.push(Object.assign({}, parseObj));
                parseObj.complect = '';
                parseObj.ua_features = '';
            });
            axios.get(fromRUS_URL).then((html) => {
                parseObj_ru.ru_features = '';
                parseObj_ru.id = '';

                const linkData = cheerio.load(html.data);

                //Вытаскиваем айди
                linkData(`[class = "prp_id align-center"]`).each((i, elem) => {

                    parseObj_ru.id += `${linkData(elem).text().slice(4)}`;
                });

                let miniFeaturesAreParsed = false; //проверяем, спарсили ли мы таблицу в таблице
                linkData(`h2:contains("Особенности"), h2:contains("ОСОБЕННОСТИ")`).next().children().each((i, elem) => {
                    miniFeaturesAreParsed = false;
                    linkData(elem).children().children().each((i, elem2) => {
                        // ДОДЕЛАТЬ ПРОВЕРКУ ПО ТЕГУ И ДЕСТРУКТУРИЗАЦИЮ

                        parseObj_ru.ru_features += `<p>${linkData(elem2).text()}</p> `;
                        miniFeaturesAreParsed = true;
                    });

                    if (!miniFeaturesAreParsed) {
                        parseObj_ru.ru_features += `<p>${linkData(elem).text()}</p> `;
                    }
                });

                linkData('h2:contains("Комплектация"), h2:contains("КОМПЛЕКТАЦИЯ")').next().children().each((i, elem) => {
                    parseObj_ru.ru_complect += `<p>${linkData(elem).text()}</p> `;

                });

                outputTo_ru.push(Object.assign({}, parseObj_ru));
                parseObj_ru.ru_complect = '';
            });
        }

        //Переробити функ під універсал
        // function sortAllData (a,b) {
        //     let arrayMap = a.filter(({ id: idv }) => b.every(({ id: idc }) => idv !== idc));
        //     b = b.concat(arrayMap).map((v) => v.ua_features ? v : { ...v,  ua_features: null , complect: null, ru_complect: null, });
        // }
        function merge() {
            resultArr = innerJoin(item_list_ua, item_list_ru,
                ({
                    id: uid,
                    ua_features,
                    complect,
                    warranty
                }, {
                    id,
                    ru_features,
                    ru_complect
                }) =>
                id === uid && {
                    id,
                    ua_features,
                    ru_features,
                    complect,
                    ru_complect,
                    warranty
                });
        }
        setTimeout(merge, 5000);
        // setTimeout(addingNewTable, 7500, "Особенности UA", "Особенности RU", "Комплектация UA", "Комплектация RU", "Что-то там", item_list_ua, item_list_ru, 100);
        setTimeout(addingNewTable, 7500, ["Особенности UA", "Особенности RU", "Комплектация UA", "Комплектация RU", "Гарантия", paramName], resultArr, 200);
    });

    function innerJoin(xs, ys, sel) {
        return (xs.reduce((zs, x) =>
            ys.reduce((zs, y) => // cartesian product - all combinations
                zs.concat(sel(x, y) || []), // filter out the rows and columns you want
                zs), []));
    }

};


//вспомогательная функция, которая билдит таблицу
function addingNewTable(col_name, objArr, maxCount = 50) {
    logTxt('Starting to create table');

    logTxt(resultArr.length);
    generateDefaultTable(`<tr><td>ID</td><td>${col_name[0]}</td><td>${col_name[1]}</td><td>${col_name[2]}</td><td>${col_name[3]}</td>
    <td>${col_name[4]}</td><td>${col_name[5]}</td></tr>`);
    addRow('mainTable', resultArr.length, 7, [resultArr, itemFeaturesEpicSortedArr]);
    // for (let i = 0; i < resultArr.length; i++) {
    //     if (i > maxCount) {
    //         break;
    //     }
    //     table.innerHTML += `<tr class = "griddy"><td class="offerID">${resultArr[i].id}</td><td class="first">
    //         ${resultArr[i].ua_features}</td><td class="second">${resultArr[i].ru_features}</td><td class="third">${resultArr[i].complect}</td>
    //         <td class="forty">${resultArr[i].ru_complect}</td><td>${itemFeaturesEpicSortedArr[i]}</td><td>${resultArr[i].warranty}</td></tr>`;
    // }
    clearLog();
    setTimeout(visibleTable, 10);
    setTimeout(displayCategory_name, 10, `Category: ${categoryName}`);
}


//yml parser
function initYML_Parser() {

    table.innerHTML = '';
    clearLog();
    parseYML(generateDefaultTable);



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
                generateDefaultTable(`<tr><td>ID</td><td>Укр название</td><td>Ru Название</td> <td>Цена</td> <td> Фото </td>  <td>Описание UA</td> <td>Описание RU</td> 
                <td>Категория</td> <td>Наличие</td>  </tr>`);

                let parser = new DOMParser();
                let XMLDocument = parser.parseFromString(xml, 'application/xml');
                offers = XMLDocument.querySelectorAll('offer');
                logTxt('offers ready.');

                //проходимся по всем офферам, билдим обьект офера и отправляем в таблицу
                offers.forEach((item) => {
                    OffersName.id = item.getAttribute('id');
                    OffersName.nameUA = item.querySelector(`name[lang="ua"]`);
                    OffersName.nameRU = item.querySelector(`name[lang="ru"]`);
                    OffersName.price = `value: ${item.querySelector(`price`).textContent}`;
                    OffersName.picture = item.querySelector('picture');
                    OffersName.descriptionUA = item.querySelector('description[lang="ua"]');
                    OffersName.descriptionRU = item.querySelector('description[lang="ru"]');
                    OffersName.category = item.querySelector('category');
                    OffersName.available = item.getAttribute('available');
                    let ObjBuffer = Object.assign({}, OffersName);
                    OffersNameArr.push(ObjBuffer);
                });

                addRow('mainTable', OffersNameArr.length, 8, [OffersNameArr]);
                setTimeout(visibleTable, 10);
                displayCategory_name('YML Data');


            });
        });
    };
};

function generateDefaultTable(firstRow) {
    table.innerHTML += firstRow;
}


//consoleLogAnalog
function logTxt(str) {
    divBlock.innerHTML += (`>> ${str}<br>`);
}

function clearLog() {
    divBlock.innerHTML = (``);
}

// функция addRow принимает в себя 1.Айди таблицы, которую и будем билдить. 2. Количество строк. 3. Количество столбцов, массив контента, 
// который содержит минимум один массив контента.
function addRow(tableID, rowsAmount, cellsAmmount = 8, contentArray) {
    // Get a reference to the table
    var tableRef = document.getElementById(tableID);
    let cellsArr = new Array(cellsAmmount);
    let rowArr = new Array(rowsAmount);

    // Append a text node to the cell
    for (let i = 0; i < rowsAmount; i++) {
        // Insert a row in the table at row index 0
        rowArr[i] = tableRef.insertRow(-1);
        // Insert a cell in the row at index 0

        //Вход: массив для принятия n массивов, в которых лежит контент для таблицы. 
        let iterand = 0; //проходися по массиву и открываем массивы
        contentArray.forEach((content_data) => { //если в массиве только строки, то нет необходиомости в деструктуризации, просто билбим ячейку таблицы с помощью данной строки
            if (typeof (content_data[i]) == 'string') {
                cellsArr[iterand] = rowArr[i].insertCell(-1);
                cellsArr[iterand].textContent = (content_data[i]);
                iterand++;
            } else if (content_data[i] === null || typeof (content_data[i]) == 'undefined') { //в другом случае открываем как обьект и проверяем, нет ли там ещё обьектов. 
                cellsArr[iterand] = rowArr[i].insertCell(-1);
                cellsArr[iterand].textContent = 'Данные отсутствуют';
                iterand++;
            } else {
                Object.values(content_data[i]).forEach((item, y) => {
                    cellsArr[iterand] = rowArr[i].insertCell(-1);
                    if (typeof (item) == 'object') {
                        cellsArr[iterand].textContent = (item.textContent);
                    } else {
                        cellsArr[iterand].textContent = (item);
                    }
                    iterand++;
                });
            }


        });


        // cellsArr[cellsArr.length-1] = rowArr[i].insertCell(-1);
        // cellsArr[cellsArr.length-1].textContent = (content[1][i]);

    }
}



//да будет свет таблице!
function visibleTable() {
    table.className = 'visible';
}

function displayCategory_name(categoryName = " ") {
    $('.categoryText').text(' ');
    $('.categoryText').fadeIn('600');
    $('.categoryText').append(categoryName);
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
                    $(this).find('img').attr('src', "https://fareks.github.io/xmlReader/content\\excelGif.gif");
                    break;
                case 'button_2':
                    $(this).find('img').attr('src', "https://fareks.github.io/xmlReader/content\\MasteramGif.gif");
                    break;
                case 'button_3':
                    $(this).find('img').attr('src', "https://fareks.github.io/xmlReader/content\\ymlGif.gif");
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
                    $(this).find('img').attr('src', "https://fareks.github.io/xmlReader/content\\excelButtonStart.png");
                    break;
                case 'button_2':
                    $(this).find('img').attr('src', "https://fareks.github.io/xmlReader/content\\startMasteram.png");
                    break;
                case 'button_3':
                    $(this).find('img').attr('src', "https://fareks.github.io/xmlReader/content\\ymlStart.png");
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