const runAllQueries = require('./run_all_queries');

async function main() {

    let folder_name = '3344';

    // write queries in the order you want to run
    let queries = [
        `select * from users`
    ];


    await runAllQueries(queries, { folder_name});
}

main();