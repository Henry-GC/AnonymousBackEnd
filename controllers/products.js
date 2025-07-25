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
          const {rows} = await pool.query(`
            SELECT 
                b.id,
                b.name,
                b.description,
                b.price,
                b.img_url,
                b.relevant,
                bc.product_id,
                bc.quantity,
                p.name as product_name
            FROM builds b
            LEFT JOIN builds_comp bc ON b.id = bc.build_id
            LEFT JOIN products p ON bc.product_id = p.id
            ORDER BY b.id, bc.product_id
          `);

          // Agrupar los componentes por build
          const buildsMap = new Map();
          
          rows.forEach(row => {
            const buildId = row.id;
            
            if (!buildsMap.has(buildId)) {
              buildsMap.set(buildId, {
                id: row.id,
                name: row.name,
                description: row.description,
                price: row.price,
                img_url: row.img_url,
                relevant: row.relevant,
                components: []
              });
            }
            
            // Si hay componentes, agregarlos al array
            if (row.product_id) {
              buildsMap.get(buildId).components.push({
                product_id: row.product_id,
                quantity: row.quantity,
                product_name: row.product_name
              });
            }
          });

          // Convertir el Map a array
          const builds = Array.from(buildsMap.values());
          res.status(200).json(builds);
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

    static async createBuild (req, res) {
        const { name, description, price, img_url, relevant, components } = req.body;

        try {
            const query = "INSERT INTO builds (name, description, price, img_url, relevant) VALUES ($1, $2, $3, $4, $5) RETURNING id";
            const {rows} = await pool.query(query, [name, description, price, img_url, relevant]);
            const buildId = rows[0].id;
            const componentValues = components.map((component) => [
                buildId,
                component.product_id,
                component.quantity
            ]);
            const componentQuery = "INSERT INTO builds_comp (build_id, product_id, quantity) VALUES ($1, $2, $3)";
            for (const values of componentValues) {
                await pool.query(componentQuery, values);
            }
            res.status(201).json({ message: "Build creada exitosamente" });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }

    static async updateBuild (req, res) {
        const { id } = req.params;
        const { name, description, price, img_url, relevant, components } = req.body;

        try {
            const query = "UPDATE builds SET name = $1, description = $2, price = $3, img_url = $4, relevant = $5 WHERE id = $6";
            await pool.query(query, [name, description, price, img_url, relevant, id]);

            // Eliminar componentes existentes
            await pool.query("DELETE FROM builds_comp WHERE build_id = $1", [id]);

            // Insertar nuevos componentes
            const componentValues = components.map((component) => [
                id,
                component.product_id,
                component.quantity
            ]);
            const componentQuery = "INSERT INTO builds_comp (build_id, product_id, quantity) VALUES ($1, $2, $3)";
            for (const values of componentValues) {
                await pool.query(componentQuery, values);
            }

            res.status(200).json({ message: "Build actualizada exitosamente" });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }

    static async deleteBuild (req, res) {
        const { id } = req.params;

        try {
            // Eliminar componentes asociados
            await pool.query("DELETE FROM builds_comp WHERE build_id = $1", [id]);
            // Eliminar la build
            await pool.query("DELETE FROM builds WHERE id = $1", [id]);
            res.status(200).json({ message: "Build eliminada exitosamente" });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }
}