import mysql from "mysql2/promise"
import { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } from "./config.js"

export const connection = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    decimalNumbers: true
})