import pg from "pg"
import { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } from "./config.js"


export const pool = new pg.Pool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    ssl: {
        rejectUnauthorized: false
    }
})