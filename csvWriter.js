const converter = require('json-2-csv');
const fs = require('fs');
module.exports = async (todos) => {
    // console.log('productArr = ' , todos);
    await fs.writeFileSync('arr.json',JSON.stringify(todos));
    converter.json2csv(todos,async (err, csv) => {
        if (err) {
            throw err;
        }
        //csv = csv.replace('undefined','');
        await fs.writeFileSync('out.csv',csv);
    });
}
