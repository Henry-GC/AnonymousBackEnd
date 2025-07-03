import { pool } from '../utils/database.js';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gamerBuilds = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../utils/gamerBuilds.json'), 'utf-8')
);


export class products {
    static async buildsData (req, res) {
        try {
          // const [result] = await pool.query("SELECT * FROM products");
          res.status(200).json(gamerBuilds);
        } catch (error) {
          res.status(500).json({ error: error });
        }
    };

    static async productsData (req, res) {
        try {
            const {rows} = await pool.query("SELECT * FROM products");
            res.status(200).json(rows);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }

    static async createProduct (req, res) {
        const { name, price, description, img_url, category_id } = req.body;
        try {
            const query = "INSERT INTO products (name, price, description, img_url, category_id) VALUES ($1, $2, $3, $4, $5)";
            await pool.query(query, [name, price, description, img_url, category_id]);
            res.status(201).json({ message: "Producto creado exitosamente" });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }
}