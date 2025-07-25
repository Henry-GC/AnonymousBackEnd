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
                b.code,
                bc.product_id,
                bc.quantity,
                p.name as product_name,
                p.category_id
            FROM builds b
            LEFT JOIN builds_comp bc ON b.id = bc.build_id
            LEFT JOIN products p ON bc.product_id = p.id
            ORDER BY b.id, p.category_id, bc.product_id
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
                code: row.code,
                components: []
              });
            }
            
            // Si hay componentes, agregarlos al array
            if (row.product_id) {
              buildsMap.get(buildId).components.push({
                product_id: row.product_id,
                quantity: row.quantity,
                product_name: row.product_name,
                category_id: row.category_id
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

        try {
            await pool.query('BEGIN');
            
            let productosCreados = 0;
            
            // Procesar cada producto individualmente para generar su código
            for (const product of productos) {
                const { name, description, price, img_url, relevant, stock, category_id } = product;
                
                // Obtener información de la categoría
                const categoryQuery = "SELECT name FROM category WHERE id = $1";
                const { rows: categoryRows } = await pool.query(categoryQuery, [category_id]);
                
                if (categoryRows.length === 0) {
                    await pool.query('ROLLBACK');
                    return res.status(400).json({ error: `Categoría con ID ${category_id} no encontrada` });
                }
                
                const categoryName = categoryRows[0].name;
                
                // Obtener el último código usado para esta categoría
                const lastCodeQuery = `
                    SELECT code 
                    FROM products 
                    WHERE category_id = $1 AND code IS NOT NULL AND code != ''
                    ORDER BY code DESC 
                    LIMIT 1
                `;
                const { rows: lastCodeResult } = await pool.query(lastCodeQuery, [category_id]);
                
                // Determinar el siguiente número
                let nextNumber = 1;
                if (lastCodeResult.length > 0) {
                    const lastCode = lastCodeResult[0].code;
                    const categoryPrefix = categoryName.toUpperCase();
                    const numberPart = lastCode.replace(categoryPrefix, '');
                    nextNumber = parseInt(numberPart) + 1;
                }
                
                // Generar el código automático
                const code = `${categoryName.toUpperCase()}${nextNumber.toString().padStart(3, '0')}`;
                
                // Insertar el producto con el código generado
                const insertQuery = `
                    INSERT INTO products (name, description, price, img_url, relevant, stock, category_id, code) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `;
                await pool.query(insertQuery, [name, description, price, img_url, relevant, stock, category_id, code]);
                
                productosCreados++;
            }
            
            await pool.query('COMMIT');
            res.status(201).json({ 
                message: `Se crearon ${productosCreados} producto(s) exitosamente con códigos automáticos` 
            });
            
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error('Error al crear productos:', error);
            res.status(500).json({ error: "Error al crear productos" });
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
            await pool.query('BEGIN');
            
            // Obtener el último código usado para builds
            const lastCodeQuery = `
                SELECT code 
                FROM builds 
                WHERE code IS NOT NULL AND code != ''
                ORDER BY code DESC 
                LIMIT 1
            `;
            const { rows: lastCodeResult } = await pool.query(lastCodeQuery);
            
            // Determinar el siguiente número
            let nextNumber = 1;
            if (lastCodeResult.length > 0) {
                const lastCode = lastCodeResult[0].code;
                const numberPart = lastCode.replace('BUILD', '');
                nextNumber = parseInt(numberPart) + 1;
            }
            
            // Generar el código automático
            const code = `BUILD${nextNumber.toString().padStart(3, '0')}`;
            
            // Insertar el build con el código generado
            const query = "INSERT INTO builds (name, description, price, img_url, relevant, code) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id";
            const {rows} = await pool.query(query, [name, description, price, img_url, relevant, code]);
            const buildId = rows[0].id;
            
            // Insertar componentes
            const componentQuery = "INSERT INTO builds_comp (build_id, product_id, quantity) VALUES ($1, $2, $3)";
            for (const component of components) {
                await pool.query(componentQuery, [buildId, component.product_id, component.quantity]);
            }
            
            await pool.query('COMMIT');
            res.status(201).json({ 
                message: "Build creada exitosamente con código automático",
                buildId: buildId,
                code: code
            });
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error('Error al crear build:', error);
            res.status(500).json({ error: "Error al crear build" });
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