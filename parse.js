const requestPromise = require('request-promise');
const $ = require('cheerio');
const baseUrl = 'https://www.digikala.com';

async function parseProductPage(uri , tor) {
    try {
        let html = await tor.get(baseUrl+uri);
        html = html.data;
        let brand = $('.product-brand-title', html);
        let category = $('li+ li .btn-link-spoiler', html);
        let name = $('.c-product__title', html);
        let image_url = $('.js-gallery-img', html)[0].attribs['data-src'];
        category = normalizeText(category[0].children[0].data);
        brand = normalizeText(brand[0].children[0].data);
        name = normalizeText(name[0].children[0].data);
        let details = $('.c-params__list', html);
        let cnt = 0;
        let ans = {
            category, name, brand, image_url
        };
        for (let a of details['0'].children){
            data = {};
            let key = normalizeText(a.children[0].children[0] ? a.children[0].children[0].children[0].data : '');
            if(!a.children[1].children[0].children[0])
                continue;
            let value = normalizeText(a.children[1].children[0].children[0].data)
            if (key === 'سایر توضیحات' || !key) {
                key = extractValueFromText(value , cnt);
                if (value != key.value){
                    value = key.value;
                }
                else
                    cnt++;
                key = key.key;
            }
            ans[normalizeText(key)] = normalizeText(value);
        }
        return ans;
    }
    catch (e) {
        console.log(e)
        return null;
    }
}


function extractValueFromText(text , cnt) {
    if (text.split(':').length === 1 || text.split(':')[1] === '') {
        if (text.split('=').length === 1 || text.split('=')[1] === '') {
            if (text.includes('اسیدهای چرب ترانس'))
                return {key: 'اسیدهای چرب ترانس', value: text.replace('اسیدهای چرب ترانس ', '')};
            return {key:`توضیحات${cnt}` , value:text}
        }
        return {key:text.split('=')[0], value:text.split('=')[1]}
    }
    return {key:text.split(':')[0], value:text.split(':')[1]}
}

function normalizeText(txt) {
    if (!txt)
        return '';
    if (txt[0] == '-')
        txt = txt.substr(1);
    if (txt[txt.length - 1] == ':')
        txt = txt.substr(0 , txt.length - 1);
        
    txt = txt.replace( /[\r\n]+/gm, "" );
    txt = txt.replace( /\s\s+/g, ' ' );
    return txt.trim();
}


module.exports = parseProductPage;