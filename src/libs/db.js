const mongoose = require('mongoose')
const { logEvents } = require('../middleware/logEvents')

const connectDB = async () => {
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

module.exports = { connectDB }
