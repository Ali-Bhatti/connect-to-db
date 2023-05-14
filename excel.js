const XLSX = require("xlsx");
const moment = require("moment");
const fs = require('fs');


// data must be an array of json
function convertJsonToExcel(data = [], params = {}) {
    let { folder_name = undefined, rds_instance = "NONE" } = params;
    let path = '', date = moment().format("YYYY-MM-DD");

    if (data?.length > 0) {
        // Convert JSON to XLSX sheet
        const workBook = XLSX.utils.book_new();
        let workSheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workBook, workSheet, rds_instance);

        if(folder_name){
            // Create a new folder
            const folderName = `INC-${folder_name}`;
            if (!fs.existsSync(folderName)) {
                fs.mkdirSync(folderName);
            }
    
            // Save the XLSX file
            path = `${folderName}/INC-${folder_name} - ${rds_instance} (${date}).xlsx`;
        } else {
            path = `${rds_instance} (${date}).xlsx`;
        }

        XLSX.writeFile(workBook, path, {
            bookType: "xlsx",
            compression: true
        });
        return path;
    } else {
        console.log("No Data found");
    }
};

//convertJsonToExcel();

module.exports = convertJsonToExcel;