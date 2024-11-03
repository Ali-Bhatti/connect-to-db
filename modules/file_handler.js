const fs = require('fs/promises');


async function readDataFormSqlFile(file_path) {
    try {
        // Read the SQL file
        let sql_file_data = await fs.readFile(file_path, 'utf8');

        // Remove comments, normalize whitespace, and handle delimiters
        sql_file_data = sql_file_data
            .split('\n')
            .map(line => line.replace(/--.*$/, ''))
            .filter(line => line.trim() !== '')
            .join(' ')
            .replace(/\t/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/^\s+|\s+$/g, '')
            .replace(/DELIMITER \$\$/g, '')
            .replace(/DELIMITER /g, '')
            .replace(/\/\//g, '')
            .replace(/\&\&/g, '');

        if (!sql_file_data) return [];

        // Split the file content into separate queries
        const queries = sql_file_data.split(';').map(q => q.trim()).filter(query => query);

        let result_queries = [];
        let complex_statements = [];
        let in_complex_statement = false;

        for (let query of queries) {
            if (/CREATE\s+(DEFINER\s*=\s*`[^`]+`\s*@\s*`[^`]+`\s*)?\s*(TRIGGER|PROCEDURE)/i.test(query)) {
                in_complex_statement = true;
            }

            if (in_complex_statement) {
                complex_statements.push(query);
                if (/END\s*\$\$/i.test(query)) {
                    complex_statements.pop();
                    complex_statements.push('END');
                    result_queries.push(`${complex_statements.join('; ')};`);
                    complex_statements = [];
                    in_complex_statement = false;
                } else if (/END\b/i.test(query) && query.trim() === "END") {
                    result_queries.push(`${complex_statements.join('; ')};`);
                    complex_statements = [];
                    in_complex_statement = false;
                }
            } else {
                if (query) {
                    result_queries.push(query + ';');
                }
            }
        }

        return result_queries;
    } catch (error) {
        console.error("Reading file error", error);
        throw new Error("Error occurred while reading the file");
    }
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
        console.log('Error while writing to file or making a folder:', error);
    }

}

async function copyAndPasteFile(source_folder_name, destination_folder_name, file_name) {
    // read sql data from "queries_file_path" and write it at "write_folder_name"
    if (file_name)
        destination_folder_name = `${destination_folder_name}/${file_name}`;

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
    copyAndPasteFile
};
