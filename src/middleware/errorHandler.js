const { logEvents } = require('./logEvents')

const errorHandler = (error, req, res, next) => {
  logEvents(`${error.name}: ${error.message}\nStack: ${error.stack}`, 'errorLog.txt')
  res.status(500).json({
    message: error.message || 'Internal server error',
    success: false
  })
}

module.exports = errorHandler