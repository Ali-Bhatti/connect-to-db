const mysql = require('mysql2/promise');
const db_configs = require('./db_configs');
const convertJsonToExcel = require("./excel");
const fs = require('fs');
const MYSQL_DDL_KEYWORDS = ['RENAME', 'TRUNCATE', 'DROP', 'ALTER', 'CREATE', 'DELETE', 'UPDATE', 'INSERT'];


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
            console.log(`--------------------------------------------------`)
        }
    }
}

function writeCountOfDataInFile(data, folder_name) {

    if (typeof data !== 'string') data = JSON.stringify(data, null, 4);

    const folderName = `INC-${folder_name}`;
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
    const fileName = `./${folderName}/count.txt`;

    fs.writeFile(fileName, data, (err) => {
        if (err) {
            console.error('Error appending to file:', err);
        } else {
            console.log(`Data Written to file ${fileName}`);
        }
    });

}


async function runAllQueries(queries = [], params = {}) {
    let { folder_name, should_export = true } = params;
    let data = [], data_count_for_each_query = {};

    try {

        if (db_configs?.length > 0) {
            for (let i = 0; i < db_configs.length; i++) {
                const db_config = db_configs[i];

                for (let j = 0; j < queries.length; j++) {
                    const query = queries[j];

                    console.log(`DB # ${i + 1} ( ${db_config.name} ) => Query # ${j + 1}`);
                    data = await executeQuery(db_config, queries[j]);

                    // if query is "SELECT" then export that data, otherwise just print the data
                    if (should_export && !MYSQL_DDL_KEYWORDS.some((element) => query.split(' ').map((element) => element.toLowerCase()).includes(element.toLowerCase()))) {
                        convertJsonToExcel(data, { rds_instance: db_config.name.split('_')[1] || db_config.name || 'localhost', folder_name, query_number: j + 1 });

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

                //console.log(data_count_for_each_query);
            }
            if (queries?.length === 0) {
                console.log("The are no Queries to Run");
            } else {
                console.log("\nDone, Ran Queries on ALL DBs");
                if (data?.length > 0)
                    writeCountOfDataInFile(data_count_for_each_query, folder_name);
            }

        } else {
            console.log("No DB Configs Found");
        }

    } catch (error) {
        console.log("error occurred while execution", error);
    }

}

//runAllQueries(queries);

module.exports = runAllQueries;

