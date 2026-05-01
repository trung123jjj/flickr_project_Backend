import mongoose from 'mongoose'
import { logEvents } from '../middleware/logEvents.js'

export const connectDB = async () => {
  try {
    console.log('Connecting to Database...')

    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to Database')
    logEvents(`Successfully connected to Database`)
  } catch (error) {
    console.error('Database connection error:', error)
    logEvents(error.message, 'errorLog.txt')
    process.exit(1)
  }
}
