import express from "express"
import { admin } from "../controllers/admin.js"
import { products } from "../controllers/products.js"
import { verify } from "../controllers/verify.js"

const router = express.Router()

router.post('/create', admin.create)
router.post('/login', admin.login)
router.get('/logout', verify.verifyTokenAdmin, admin.logout)
router.get('/products', products.productsData)
router.post('/products/create', products.createProduct)

export default router