module.exports.errorHandler = (err, req, res, next) => {
  if (err.status) {
    return res
      .status(err.status)
      .send({ name: err.name, message: err.message });
  }
  return res.status(500).send({ name: err.name, message: err.message });
};
