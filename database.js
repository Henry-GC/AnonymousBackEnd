const mysql = require("promise-mysql")

const connection = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "Whosyourdaddy1.",
    database: "anonymouspc",
})

const getConection = async ()=> await connection

module.exports = {getConection}