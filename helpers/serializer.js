const JSONAPISerializer = require('json-api-serializer');
const Serializer = new JSONAPISerializer();

const base = {
  blacklist: ['__v'],
  jsonapiObject: false
};

Serializer.register('blogPost', base);
Serializer.register('Skill', base);

module.exports.Serializer = Serializer;
