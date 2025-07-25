import express from "express"
import { admin } from "../controllers/admin.js"
import { products } from "../controllers/products.js"
import { verify } from "../controllers/verify.js"

const router = express.Router()

router.post('/admLogin', admin.login)
router.get('/admLogout', verify.verifyTokenAdmin, admin.logout)

router.post('/create', verify.verifyTokenAdmin, admin.create)

router.get('/products', products.productsData)
router.post('/products/create', verify.verifyTokenAdmin, products.createProduct)
router.put('/products/update/:id', verify.verifyTokenAdmin, products.updateProduct)
router.delete('/products/delete/:id', verify.verifyTokenAdmin, products.deleteProduct)

router.get('/builds', products.buildsData)
router.post('/builds/createBuild', verify.verifyTokenAdmin, products.createBuild)
router.put('/builds/update/:id', verify.verifyTokenAdmin, products.updateBuild)
router.delete('/builds/delete/:id', verify.verifyTokenAdmin, products.deleteBuild)

router.get('/users', verify.verifyTokenAdmin, admin.getUsers)
router.get('/users/:id', verify.verifyTokenAdmin, admin.getUserById)

router.get('/orders', verify.verifyTokenAdmin, admin.getOrders)
router.get('/orders/:id', verify.verifyTokenAdmin, admin.getOrderById)
router.put('/orders/update/:id', verify.verifyTokenAdmin, admin.updateOrderStatus)
router.delete('/orders/delete/:id', verify.verifyTokenAdmin, admin.deleteOrder)

export default router