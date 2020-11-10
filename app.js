const $ = require('cheerio');
const fs = require('fs');
const requestPromise = require('request-promise');
const parse = require('./parse');
const save = require('./csvWriter');
let productArray = JSON.parse(String(fs.readFileSync('arr.json')));
// console.log(productArray);
async function parsePage(pageNo , idx){
    try {
        let html = await requestPromise(`https://www.digikala.com/search/category-beverages/?pageno=${pageNo + 1}&sortby=1`)
        let products = $('.c-product-box__title .js-product-url', html);
        if (products.length===0){
            throw Error('no connected')
        }
        for(let i=idx; i<products.length; i++){
            let urlProduct = products[i].attribs.href;
            let encodeUrl = encodeURI(urlProduct);
            //console.debug(encodeUrl);
            let parsedProductPage = await parse(encodeUrl);
            //console.debug(parsedProductPage);
            if (parsedProductPage !== null){
                parsedProductPage['page_url'] = 'https://www.digikala.com' + encodeUrl;
                productArray.push(parsedProductPage)
            }else{
               console.debug(`error in ${encodeUrl} 
                id = ${i}`);
                return i;
            }
        }
        return -1;
    }
    catch (e) {
        console.debug(`page ${pageNo} not process`, e)
        return idx;
    }

}


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}  
let start = async () =>{
    const number_of_page = 260;
    const start = 0;
    let idx = 0;

    for (let i = start ; i < number_of_page; i++){
        let ok = await parsePage(i , idx);
        idx = 0;
        if (ok === -1)
           console.debug(`page ${i} is finished`);
        else{
            i--;
            idx = ok;
            console.log('again');
            // await save(productArray);
            // await sleep(10000);
            console.log('finish sleep');
        }
    }
    save(productArray);
};
start().then();