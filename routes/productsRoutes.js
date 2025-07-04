import express from "express"
import { products } from "../controllers/products.js"

const router = express.Router()

router.get('/gamerBuilds', products.buildsData)
router.get('/products', products.productsData)

export default router