import ratingController from "../controllers/ratingController"; 
import express from 'express'

const router = express.Router()

router
    .post('/add', ratingController.addRating)
    .get('/get', ratingController.getRating)
    .delete('/delete', ratingController.deleteRating)
    .put('/update', ratingController.updateRating)

export default router