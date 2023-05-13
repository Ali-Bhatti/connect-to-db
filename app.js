console.log("THIS IS A PROJECT");

let mysql = require('mysql');

// const express = require('express');
// const app = express();

// app.get('/', (req, res) => {
//   res.send('Hello, World! How are u? I am fine');
// });

// app.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });


/* Connect with My-SQL code */
// let connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'root123',
//     database: 'my-drive'
// });

let queries = [
    "INSERT INTO users (first_name, last_name, email, password) VALUES ('Usman', 'Ali', 'Usman@gmail.com', 'Usman123');",
    "INSERT INTO tasks (name, is_done)  Values ('connect-to-db', '1');"
];
let DBs = ['my-drive', 'todo'];

async function runQueries(){

    for (let i = 0; i < 2; i++) {
        console.log("IN Iteration", i+1);
        let connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root123',
            database: DBs[i]
        });
        try {
            await connection.connect(function (err) {
                if (err) {
                    return console.error('error: ' + err.message);
                }
                console.log('Connected to the MySQL server.');
            
            });

            await connection.query(queries[i], (error, results) => {
                if (error) throw error;

                // Process the results
                console.log('Query results:', results);

            });
            
        } catch (error) {
            console.log('Error in exe', error);
        } finally{
            console.log('Ending Connection of DB', DBs[i]);
            connection.end();
        }
        
    }
}

runQueries();


// connection.connect(function (err) {
//     if (err) {
//         return console.error('error: ' + err.message);
//     }
//     console.log('Connected to the MySQL server.');

// });

// try {
//     // Execute the select query
//     connection.query(`INSERT INTO users (first_name, last_name, email, password)
//     VALUES ('Usman', 'Ali', 'Usman@gmail.com', 'Usman123');`, (error, results) => {
//         if (error) throw error;

//         // Process the results
//         console.log('Query results:', results);

//     });
    
// } catch (error) {
//     console.log('Error in exe', error);
// } finally {
//     connection.end();
// }

