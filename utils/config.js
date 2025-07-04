import dotenv from "dotenv"
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

export const SECRET_KEY = process.env.SECRET_KEY
export const SECRET_REFRESH_KEY = process.env.SECRET_REFRESH_KEY

export const DB_HOST = process.env.POSTGRES_HOST
export const DB_USER = process.env.POSTGRES_USER
export const DB_PASS = process.env.POSTGRES_PASSWORD
export const DB_NAME = process.env.POSTGRES_DATABASE