const runAllQueries = require('./run_all_queries');
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

async function main() {

    try {

        let queries_file_path = './queries.sql';
        let queries = await readDataFormSqlFile(queries_file_path);

        console.log("Done reading all queries from file\n");
        await runAllQueries(queries, { should_export: true });

    } catch (error) {
        console.log(error);
    }

}

main();