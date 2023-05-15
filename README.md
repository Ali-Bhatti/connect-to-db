## Purpose
- to run same query/queries on multiple DB instances
- to get export of data fetched as a result of that query from different DB instances

## Steps to Run it
- Install node js from [here](https://nodejs.org/en/download), if not installed (node vesion should be greater than 14)
- Clone or download the repo
- open terminal and run `npm install`
- Set the DB configurations in **db_configs.js** file. A sample is given in **db_config.js** file
- Add Queries in the `queries` array in **app.js** file. 
- run `node app.js`

## NOTE:
This will run queries only in **MySQL DB instances**.
