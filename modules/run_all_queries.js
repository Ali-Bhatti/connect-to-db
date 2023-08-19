const mysql = require('mysql2/promise');
const moment = require('moment');
const MYSQL_DDL_KEYWORDS = ['RENAME', 'TRUNCATE', 'DROP', 'ALTER', 'CREATE', 'DELETE', 'UPDATE', 'INSERT'];

async function runAllQueries(queries = [], params = {}) {
    let { should_export = true } = params;
    let data = [], data_count_for_each_query = {},
        execution_folder = `queries-executions/execution on ${moment().format('YYYY-MM-DD (hh_mm_ss a)')}`;
    var logger = getLogStream(execution_folder);

    try {
        if (db_configs?.length === 0) {
            console.log("No DB Configs Found");
            return;
        }
        if (queries?.length === 0) {
            console.log("There are no Queries to Run");
            return;
        }

        for (let i = 0; i < db_configs.length; i++) {
            const db_config = db_configs[i];
            let connection = await dbh.getConnection(db_config);

            console.log(`--------------------------------------------------`)
            console.log(`Connected to ${db_config.name} database!\n`);


            for (let j = 0; j < queries.length; j++) {
                const query = queries[j];

                console.log(`DB # ${i + 1} ( ${db_config.name} ) => Query # ${j + 1}`);
                data = await dbh.executeQuery(connection, queries[j]);

                // if query is "SELECT" then export that data, otherwise just print the data
                if (should_export && !MYSQL_DDL_KEYWORDS.some(keyword => query.toUpperCase().includes(keyword))) {
                    convertJsonToExcel(data, { rds_instance: db_config.name.split('_')[1] || db_config.name || 'localhost', folder_name: `${execution_folder}/query-${j + 1}`, query_number: j + 1 });

                    // preparing data of count to write in the file.
                    let quey_num = `query_${j + 1}`;
                    if (!data_count_for_each_query.hasOwnProperty(quey_num)) {
                        data_count_for_each_query[quey_num] = {};
                    }
                    data_count_for_each_query[quey_num][db_config.name] = data?.length || 0;

                } else {
                    console.log('Query results:', data);
                }

            }

            if (connection) {
                connection.end();
                console.log(`Database ${db_config.name} connection closed.`);
                console.log(`--------------------------------------------------\n`)
            }

        }

        console.log("\nDone, Ran Queries on ALL DBs");
        if (Object.keys(data_count_for_each_query)?.length > 0)
            await fh.writeCountOfDataInFile(data_count_for_each_query, execution_folder);

        // saving "queries" file to "execution_folder"
        await fh.copyAndPasteFile('./queries.sql', execution_folder, 'queries.sql');


    } catch (error) {
        console.log("error occurred while execution", error);
    } finally{
        logger.end();
    }

}

//runAllQueries(queries);

module.exports = runAllQueries;

const db_configs = require('../config/db_configs');
const convertJsonToExcel = require("./excel");
const dbh = require('./db_handler');
const fh = require('./file_handler');
const getLogStream = require('./logger');