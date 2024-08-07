const runAllQueries = require('./modules/run_all_queries');
const { readDataFormSqlFile } = require('./modules/file_handler');

async function main() {

    try {

        let queries_file_path = './queries.sql';
        let queries = await readDataFormSqlFile(queries_file_path);

        console.log(`\nDone reading all queries from file.\nQueries Count: ${queries.length}`);
        await runAllQueries(queries, { should_export: true });

    } catch (error) {
        console.log(error);
    }

}

main();