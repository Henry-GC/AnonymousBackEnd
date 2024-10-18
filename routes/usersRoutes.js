import express from "express"
import { verify } from "../controllers/verify.js"
import { users } from "../controllers/users.js"
import { shop } from "../controllers/shop.js"

const router = express.Router()

router.post('/register', users.register)
router.post('/login', users.login)
router.get('/logout', users.logout)
router.get('/user', verify.verifyToken, users.userData)
router.post('/user/profile/data', verify.verifyToken, users.mofifyData )
router.post('/user/createorder',shop.createOrder)
router.post('/user/cancel-orders', verify.verifyToken, users.cancelOrder)
router.post('/user/add-favorite', verify.verifyToken, users.addFavorite)
router.post('/user/delete-favorite', verify.verifyToken, users.deleteFavorite)
router.post('/user/address', verify.verifyToken, users.addAdresses)

export default router