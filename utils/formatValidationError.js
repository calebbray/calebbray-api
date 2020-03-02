/**
 * 400 Validation Error, Error Handler. Can be given an already-formatted error,
 * or a jsonschema.validator error object to be formatted correctly for our
 * response.
 * @param {object}  error A jsonschema.validator error, OR an already-formatted error
 * @returns A formatted error response
 */
module.exports.formatValidationError = error => {
  if (error.statusCode && error.headers && error.body && JSON.parse(error.body).errors) {
    return error;
  }
  console.error('Validation Error: ', error);
  return {
    statusCode: 400,
    headers: {
      'Content-Type': 'application/vnd.api+json; charset=utf-8'
    },
    body: JSON.stringify({
      errors: error.map(err => {
        let detail = `${err.dataPath.replace(/\./g, '->')} ${err.message}.`;
        if (err.keyword === 'additionalProperties') {
          detail = `'${err.params.additionalProperty}' is an invalid attribute.`;
        }
        return {
          status: 400,
          title: 'Invalid Attribute',
          detail
        };
      })
    })
  };
};
