const converter = require('json-2-csv');
const fs = require('fs');
module.exports = (todos) => {
    // console.log('productArr = ' , todos);
    fs.writeFileSync('arr.json',JSON.stringify(todos));
    converter.json2csv(todos, (err, csv) => {
        if (err) {
            throw err;
        }
        csv = csv.replace('undefined','');
        fs.writeFileSync('out.csv',csv);
    });
}