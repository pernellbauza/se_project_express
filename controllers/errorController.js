const { HTTP_INTERNAL_SERVER_ERROR } = require("../utils/error");

module.exports = (error, req, res, next) => {
  console.log("MIDDLEWARE");
  console.error(error);
  error.statusCode = error.statusCode || HTTP_INTERNAL_SERVER_ERROR;
  error.status = error.status || "error";
  res.status(error.statusCode).json({
    // status: error.statusCode,
    message: error.message,
  });
};