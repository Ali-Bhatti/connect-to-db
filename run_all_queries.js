const mysql = require('mysql2/promise');
const db_configs = require('./db_configs');
const convertJsonToExcel = require("./excel");


async function connectToDatabase(db_config) {
    try {
        const connection = await mysql.createConnection({
            host: db_config.host,
            user: db_config.user,
            password: db_config.password,
            database: db_config.database,
        });

        console.log(`--------------------------------------------------`)
        console.log(`Connected to ${db_config.name} database!`);
        return connection;
    } catch (error) {
        console.log('Err to connect with MySQL database!', error);
    }
}

async function executeQuery(db_config, query) {
    let connection;
    try {
        connection = await connectToDatabase(db_config);

        const [rows, fields] = await connection.execute(query);
        // console.log('Query results:', rows);

        connection.end();
        return rows;
    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) {
            connection.end();
            console.log(`Database ${db_config.name} connection closed.`);
            console.log(`--------------------------------------------------\n`)
        }
    }
}

async function runAllQueries(queries = [], params = {}) {
    let { folder_name, should_export = true } = params;
    let data = [];

    try {

        if (db_configs?.length > 0) {
            for (let i = 0; i < db_configs.length; i++) {

                for (let j = 0; j < queries.length; j++) {
                    const query = queries[j];

                    console.log(`DB # ${i + 1} ( ${db_configs[i].name} ) => Query # ${j + 1}`);
                    data = await executeQuery(db_configs[i], queries[j]);

                    // if query is "SELECT" then export that data, otherwise just print the data
                    if (should_export && query.split(' ')[0].toLowerCase() === 'select') {
                        convertJsonToExcel(data, { rds_instance: db_configs[i].name.split('_')[1] || db_configs[i].name || 'localhost', folder_name, query_number: j + 1 });
                    } else {
                        console.log('Query results:', data);
                    }

                }

            }
            console.log(queries?.length === 0 ? "The are no Queries to Run" : "Done, Ran Queries on ALL DBs");
        } else {
            console.log("No DB Configs Found");
        }

    } catch (error) {
        console.log("error occurred while execution", error);
    }

}

//runAllQueries(queries);

module.exports = runAllQueries;

