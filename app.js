const runAllQueries = require('./classes/run_all_queries');
const { readDataFormSqlFile } = require('./classes/file_handler');

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