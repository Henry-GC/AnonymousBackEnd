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
        // Espera un array de productos en req.body
        const productos = Array.isArray(req.body) ? req.body : [req.body];
        if (!productos.length) {
            return res.status(400).json({ error: "No se recibieron productos para crear" });
        }
        // Construir los valores y placeholders para la consulta
        const values = [];
        const placeholders = productos.map((product, idx) => {
            const baseIdx = idx * 7;
            values.push(
                product.name,
                product.description,
                product.price,
                product.img_url,
                product.relevant,
                product.stock,
                product.category_id
            );
            return `($${baseIdx + 1}, $${baseIdx + 2}, $${baseIdx + 3}, $${baseIdx + 4}, $${baseIdx + 5}, $${baseIdx + 6}, $${baseIdx + 7})`;
        }).join(", ");
        const query = `INSERT INTO products (name, description, price, img_url, relevant, stock, category_id) VALUES ${placeholders}`;
        try {
            await pool.query(query, values);
            res.status(201).json({ message: `Se crearon ${productos.length} producto(s) exitosamente` });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }

    static async updateProduct (req, res) {
        const { id } = req.params;
        const { name, price, description, img_url, relevant, stock, category_id } = req.body;
        console.log(req.body)

        try {
            const query = "UPDATE products SET name = $1, description = $2, price = $3, img_url = $4, relevant = $5, stock = $6, category_id = $7 WHERE id = $8";
            await pool.query(query, [name, description, price, img_url, relevant, stock, category_id, id]);
            res.status(200).json({ message: "Producto actualizado exitosamente" });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }

    static async deleteProduct (req, res) {
        const { id } = req.params;

        try {
            const query = "DELETE FROM products WHERE id = $1";
            await pool.query(query, [id]);
            res.status(200).json({ message: "Producto eliminado exitosamente" });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }
}