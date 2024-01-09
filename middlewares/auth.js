const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../utils/config");

const { HTTP_UNAUTHORIZED } = require("../utils/error");

const handleAuthError = (res) => {
  return res.status(HTTP_UNAUTHORIZED).send({ message: "Authorization Error" });
};

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return handleAuthError(res);
  }

  const token = authorization.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
  } catch {
    return handleAuthError(res, "Invalid token");
  }
  next();
};