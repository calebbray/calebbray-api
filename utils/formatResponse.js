module.exports.formatResponse = (type, attributes) => {
  return JSON.stringify({
    data: {
      type,
      attributes
    }
  });
};
