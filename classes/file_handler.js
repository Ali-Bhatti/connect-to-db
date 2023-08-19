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

async function writeCountOfDataInFile(data, folder_name) {
    let fileName = './COUNT.txt';

    if (typeof data !== 'string') data = JSON.stringify(data, null, 4);

    try {
        if (folder_name) {
            await fs.mkdir(folder_name, { recursive: true });
            fileName = `${folder_name}/COUNT.txt`;
        }

        await fs.writeFile(fileName, data);
        console.log(`Data Written to file '${fileName}'`);

    } catch (error) {
        console.error('Error while writing to file or making a folder:', error);
    }

}

async function copySqlQueriesFile(source_folder_name, destination_folder_name){
    // read sql data from "queries_file_path" and write it at "write_folder_name"
    destination_folder_name = `${destination_folder_name}/queries.sql`;

    try {
        let file_data = await fs.readFile(source_folder_name, 'utf8');

        await fs.writeFile(destination_folder_name, file_data, 'utf8');

        console.log("\'Queries\' file copied successfully")

    } catch (error) {
        console.error('Error occurred while copying file:', error);
    }
}

module.exports = {
    readDataFormSqlFile,
    writeCountOfDataInFile,
    copySqlQueriesFile
};