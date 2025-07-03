import express from "express"
import { products } from "../controllers/products.js"

const router = express.Router()

router.get('/gamerBuilds', products.buildsData)
router.get('/productos', products.productsData)
router.post('/productos/create', products.createProduct)

export default router