const mysql = require('mysql2/promise');
const db_configs = require('./db_configs');


let queries = [
    "UPDATE users set first_name = 'AFZAL' where id = 6;",
    "select * from tasks;"
];


async function connectToDatabase(db_config) {
    try {
        const connection = await mysql.createConnection({
            host: db_config.host,
            user: db_config.user,
            password: db_config.password,
            database: db_config.database,
        });

        console.log(`--------------------------------------------------`)
        console.log(`Connected to ${db_config.database} database!`);
        return connection;
    } catch (error) {
        console.log('Err to connect with MySQL database!', error);
    }
}

async function executeQuery(db_config, query) {
    let connection;
    // let sql = "DELETE FROM users where id = 8"
    try {
        connection = await connectToDatabase(db_config);

        const [rows, fields] = await connection.execute(query);
        console.log('Query results:', rows);

        connection.end();
    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) {
            connection.end();
            console.log(`Database ${db_config.database} connection closed.`);
            console.log(`--------------------------------------------------\n`)
        }
    }
}

async function runAll() {

    for (let i = 0; i < db_configs.length; i++) {

        await executeQuery(db_configs[i], queries[i]);
    }
    console.log("Done Run ALL");
}

runAll();

