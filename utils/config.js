import dotenv from "dotenv"
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const CORS_URL = process.env.CORS

export const SECRET_KEY = process.env.SECRET_KEY

export const DB_HOST = process.env.POSTGRES_HOST
export const DB_PORT = process.env.POSTGRES_PORT
export const DB_USER = process.env.POSTGRES_USER
export const DB_PASS = process.env.POSTGRES_PASSWORD
export const DB_NAME = process.env.POSTGRES_DATABASE