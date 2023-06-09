const mysql = require('mysql2/promise');
const db_configs = require('./db_configs');
const convertJsonToExcel = require("./excel");
const fs = require('fs');
const MYSQL_DDL_KEYWORDS = ['RENAME', 'TRUNCATE', 'DROP', 'ALTER', 'CREATE', 'DELETE', 'UPDATE', 'INSERT'];


async function getConnection(db_config) {
    try {
        const connection = await mysql.createConnection({
            host: db_config.host,
            user: db_config.user,
            password: db_config.password,
            database: db_config.database,
        });

        return connection;
    } catch (error) {
        console.log('Err to connect with MySQL database!', error);
    }
}

async function executeQuery(connection, query) {

    try {
        const [rows, fields] = await connection.execute(query);
        // console.log('Query results:', rows);

        return rows;
    } catch (error) {
        console.error('Error:', error);
    }
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


async function runAllQueries(queries = [], params = {}) {
    let { should_export = true } = params;
    let data = [], data_count_for_each_query = {};

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
            let connection = await getConnection(db_config);

            console.log(`--------------------------------------------------`)
            console.log(`Connected to ${db_config.name} database!\n`);


            for (let j = 0; j < queries.length; j++) {
                const query = queries[j];

                console.log(`DB # ${i + 1} ( ${db_config.name} ) => Query # ${j + 1}`);
                data = await executeQuery(connection, queries[j]);

                // if query is "SELECT" then export that data, otherwise just print the data
                if (should_export && !MYSQL_DDL_KEYWORDS.some(keyword => query.toUpperCase().includes(keyword))) {
                    convertJsonToExcel(data, { rds_instance: db_config.name.split('_')[1] || db_config.name || 'localhost', folder_name: `query-${j + 1}`, query_number: j + 1 });

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
            writeCountOfDataInFile(data_count_for_each_query);


    } catch (error) {
        console.log("error occurred while execution", error);
    }

}

//runAllQueries(queries);

module.exports = runAllQueries;

