const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

const connection = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USERNAME,
    password: process.env.PASSSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT,
    multipleStatements: true,
    connectionLimit: 10
});

connection.getConnection(function (err) {
    if (err) {
        console.error('error connecting: ' + err.message);
        return;
    }
    console.log('connected');
});


// Making the connection constant global to the project 
global.connection = connection;