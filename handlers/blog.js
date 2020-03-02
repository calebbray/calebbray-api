const {
  Types: { ObjectId }
} = require('mongoose');
const Ajv = require('ajv');
const postSchema = require('../schemas/postSchema.json');
const postPatchSchema = require('../schemas/postPatchSchema');
const {
  formatBadRequestError,
  formatDatabaseError,
  formatInternalError,
  formatNotFoundError,
  formatValidationError,
  connectToDatabase,
  parseBody,
  parseMarkdown
} = require('../utils');
const { Serializer } = require('../helpers/serializer');
const { Post } = require('../models/BlogPost');

const ajv = new Ajv({ allErrors: true });
module.exports.postDoc = async event => {
  const parsedPost = parseMarkdown(event.body);

  await connectToDatabase();

  const newPost = Post(parsedPost);

  let doc = await newPost.save();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Post Created'
    })
  };
};

module.exports.post = async event => {
  try {
    if (!event.body) {
      throw formatBadRequestError({ message: 'A body is required for this request' });
    }
    const parsedBody = parseBody(event.body);
    const valid = ajv.validate(postSchema, parsedBody);
    if (!valid) {
      throw formatValidationError(ajv.errors);
    }
    const deserializedPost = await Serializer.deserialize('blogPost', parsedBody);
    await connectToDatabase();
    let newPost;
    try {
      const { _doc } = await Post(deserializedPost).save();
      newPost = Serializer.serialize('blogPost', _doc);
    } catch (err) {
      throw formatDatabaseError(err);
    }

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(newPost)
    };
  } catch (error) {
    return formatInternalError(error);
  }
};

module.exports.getPosts = async event => {
  try {
    await connectToDatabase();
    let posts = await Post.find().lean();
    posts = Serializer.serialize('blogPost', posts);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(posts)
    };
  } catch (error) {
    return formatInternalError(error);
  }
};

module.exports.getPost = async event => {
  try {
    const { id } = event.pathParameters;
    await connectToDatabase();
    let post;
    post = await Post.findOne({ _id: id }).lean();
    if (!post) {
      throw formatNotFoundError({ message: `No Post with ID: ${id}` });
    }
    post = Serializer.serialize('blogPost', post);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(post)
    };
  } catch (error) {
    console.log('The Error: ', error);
    return formatInternalError(error);
  }
};

module.exports.updatePost = async event => {
  try {
    const { id } = event.pathParameters;

    try {
      ObjectId(id);
    } catch (err) {
      throw formatBadRequestError({ message: 'Id must be a 24 digit hexadecimal number' });
    }
    if (!event.body) {
      throw formatError({ message: 'A body is required for this request' }, 'badRequest');
    }

    const parsedBody = parseBody(event.body);
    const valid = ajv.validate(postPatchSchema, parsedBody);
    if (!valid) {
      throw formatValidationError(ajv.errors);
    }
    const deserializedPost = Serializer.deserialize('blogPost', parsedBody);
    await connectToDatabase();
    try {
      const postExists = await Post.findOne({ _id: id });
      if (!postExists) {
        return formatNotFoundError({ message: `No post with given id: ${id}` });
      }
    } catch (err) {
      formatDatabaseError(err);
    }

    const postToUpdate = await Post.findOneAndUpdate({ _id: id }, deserializedPost, {
      new: true
    }).lean();

    const serializedPost = Serializer.serialize('blogPost', postToUpdate);
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(serializedPost)
    };
  } catch (error) {
    console.error(error);
    return formatInternalError(error);
  }
};
