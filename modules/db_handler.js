const mysql = require('mysql2/promise');


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
        console.log('Error Stack:', error.stack);
        delete error.stack;
        console.log('Error:', error);
    }
}

module.exports = {
    getConnection,
    executeQuery
}