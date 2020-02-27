const { formatError } = require('./formatError');
module.exports.parseBody = body => {
  try {
    return JSON.parse(body);
  } catch (err) {
    throw formatError(
      { message: 'Recieved malformed JSON. Check your post body and try again' },
      'badRequest'
    );
  }
};
