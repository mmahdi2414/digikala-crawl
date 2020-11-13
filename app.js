
const $ = require('cheerio');
const fs = require('fs');
const requestPromise = require('request-promise');
const parse = require('./parse');
const save = require('./csvWriter');
let productArray = JSON.parse(String(fs.readFileSync('arr.json')));
const tor_axios = require('tor-axios');
const tor = tor_axios.torSetup({
    ip: 'localhost',
    port: 9050,
    controlPort: '9051',
    controlPassword: 'giraffe',
})
// console.log(productArray);
async function parsePage(pageNo , idx){
    try {
        let html = await tor.get(`https://www.digikala.com/search/category-beverages/?pageno=${pageNo + 1}&sortby=1`);
        html = html.data;
        let products = $('.c-product-box__title .js-product-url', html);
        if (products.length===0){
            throw Error('no connected')
        }
        for(let i=idx; i<products.length; i++){
            let urlProduct = products[i].attribs.href;
            let encodeUrl = encodeURI(urlProduct);
            //console.debug(encodeUrl);
            let parsedProductPage = await parse(encodeUrl , tor);
            //console.debug(parsedProductPage);
            if (parsedProductPage !== null){
                parsedProductPage['page_url'] = 'https://www.digikala.com' + encodeUrl;
                productArray.push(parsedProductPage)
      		await save(productArray);
		console.log(`page ${pageNo} index ${i} done...`);
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
    productArray = JSON.parse(String(await fs.readFileSync('arr.json')));
    await save(productArray);
    return;
    const number_of_page = 260;
    const start = 143;
    let idx = 41;

    for (let i = start ; i < number_of_page; i++){
        let ok = await parsePage(i , idx);
        idx = 0;
        if (ok === -1){
            console.debug(`page ${i} is finished`);
//            await save(productArray);
        }
        else{
            i--;
            idx = ok;
            console.log('again');
            await tor.torNewSession();
            console.log('finish sleep');
        }
    }
    save(productArray);
};
start().then();
