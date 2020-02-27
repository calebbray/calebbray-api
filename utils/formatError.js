/**
 * formatError: Returns a properly formatted error when given an object with a message
 * or a jsonschema.validator error
 * @param {object} error - A jsonschema.validator error, OR an object with a `message` property OR an already-formatted error
 * @param {string} type - Valid types include 'db', 'badRequest', 'notFound', or 'validation'
 * @returns A formatted error response
 */
module.exports.formatError = (error, type) => {
  // If there was already a properly formatted error given, return it.
  if (error.statusCode && error.headers && error.body && JSON.parse(error.body).errors) {
    return error;
  }

  let statusCode, title, message;
  switch (type) {
    case 'db':
      statusCode = 500;
      title = 'Database Error';
      detail = `A database error occured: ${error.message}`;
      break;
    case 'badRequest':
      statusCode = 400;
      title = 'Bad Request';
      detail = `Your request was malformed: ${error.message}`;
      break;
    case 'notFound':
      statusCode = 404;
      title = 'Resource Not Found';
      detail = `Unable to find the resource: ${error.message}`;
      break;
    case 'validation':
      statusCode = 400;
      break;
    default:
      statusCode = 500;
      title = 'Internal Server Error';
      detail = `An internal server error occured: ${error.message}`;
  }
  console.log(error);
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/vnd.api+json; charset=utf-8'
    },
    body: JSON.stringify({
      errors: error.map(err => {
        console.log('Error:', err);
        if (err.keyword === 'required') {
          detail = `${err.params.missingProperty} is a required attribute`;
          title = 'Missing Attribute';
        }
        if (err.keyword === 'additionalProperties') {
          detail = `${err.params.additionalProperty} is an invalid attribute`;
          title = 'Invalid Attribute';
        }
        return {
          status: statusCode,
          title,
          detail
        };
      })
    })
  };
};
