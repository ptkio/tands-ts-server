import express from 'express'
import { getUser, getUsersList } from '../inc/users'

const router = express.Router()

// index list
router.get('/', function (req, res, next) {
    const users = getUsersList()
    res.json(users)
})

// return users by role
router.get('/:role(admin|user)', function (req, res, next) {
    const users = getUsersList(req.params.role)
    res.json(users)
})

// return user object
router.get('/:id(\\d+)', function (req, res, next) {
    const user = getUser(parseInt(req.params.id))
    if (user) {
        res.json(user)
    } else {
        res.status(404).json({
            error: { code: 404, message: 'User not found' },
        })
    }
})

export default router
