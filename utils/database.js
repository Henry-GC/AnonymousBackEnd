import pg from "pg"
import { DB_HOST, DB_USER, DB_PASS, DB_NAME } from "./config.js"

console.log(DB_HOST);


export const pool = new pg.Pool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    ssl: {
        rejectUnauthorized: false,
        sslmode: 'require'
    }
})