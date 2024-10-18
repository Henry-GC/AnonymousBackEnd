import gamerBuilds from '../utils/gamerBuilds.json' assert { type: 'json'}
import { pool } from '../utils/database.js';

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
}