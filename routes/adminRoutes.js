import express from "express"
import { admin } from "../controllers/admin.js"
import { products } from "../controllers/products.js"
import { verify } from "../controllers/verify.js"

const router = express.Router()

router.post('/create', admin.create)
router.post('/login', admin.login)
router.post('/logout', verify.verifyTokenAdmin, admin.logout)
router.post('/productos/create', products.createProduct)

export default router