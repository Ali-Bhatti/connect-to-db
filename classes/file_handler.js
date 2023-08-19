const fs = require('fs/promises');


async function readDataFormSqlFile(file_path) {
    let sql_file_data;
    try {
        // Read the SQL file
        sql_file_data = await fs.readFile(file_path, 'utf8');

    } catch (error) {
        console.log("Reading file error", error);
        throw ("Error occurred while reading the file");
    }
    // Remove commented lines from the SQL content
    sql_file_data = sql_file_data
        .split('\n')
        .filter((line) => !line.trim().startsWith('--') && !line.trim().startsWith('/*'))
        .join(' ');

    if (sql_file_data?.length === 0) return [];

    // Split the file content into separate queries
    const queries = sql_file_data.split(';');

    // Remove empty queries
    const filtered_queries = queries.filter((query) => query.trim() !== '');

    return filtered_queries;

}

function writeCountOfDataInFile(data, folder_name) {
    let fileName = './COUNT.txt';

    if (typeof data !== 'string') data = JSON.stringify(data, null, 4);

    if (folder_name) {
        const folderName = `INC-${folder_name}`;
        if (!fs.existsSync(folderName)) {
            fs.mkdirSync(folderName);
        }
        fileName = `./${folderName}/count.txt`;
    }

    fs.writeFile(fileName, data, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log(`Data Written to file ${fileName}`);
        }
    });

}

module.exports = { 
    readDataFormSqlFile, 
    writeCountOfDataInFile 
};