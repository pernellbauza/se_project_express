const { HTTP_INTERNAL_SERVER_ERROR } = require("../utils/error");

module.exports = (error, req, res) => {
  res.status(error.statusCode || HTTP_INTERNAL_SERVER_ERROR).json({
    message: error.message,
  });
};