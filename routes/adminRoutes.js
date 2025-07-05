import express from "express"
import { admin } from "../controllers/admin.js"
import { products } from "../controllers/products.js"
import { verify } from "../controllers/verify.js"

const router = express.Router()

router.post('/create', verify.verifyTokenAdmin, admin.create)
router.post('/admLogin', admin.login)
router.get('/admLogout', verify.verifyTokenAdmin, admin.logout)
router.get('/products', products.productsData)
router.post('/products/create', verify.verifyTokenAdmin, products.createProduct)
router.put('/products/update/:id', verify.verifyTokenAdmin, products.updateProduct)
router.delete('/products/delete/:id', verify.verifyTokenAdmin, products.deleteProduct)

export default router