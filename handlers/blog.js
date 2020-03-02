const {
  Types: { ObjectId }
} = require('mongoose');
const Ajv = require('ajv');
const postSchema = require('../schemas/postSchema.json');
const {
  formatError,
  parseMarkdown,
  parseBody,
  connectToDatabase,
  formatResponse
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
      throw formatError({ message: 'A body is required for this request' }, 'badRequest');
    }
    const parsedBody = parseBody(event.body);
    const valid = ajv.validate(postSchema, parsedBody);
    if (!valid) {
      throw formatError(ajv.errors, 'validation');
    }
    const deserializedPost = await Serializer.deserialize('blogPost', parsedBody);
    await connectToDatabase();
    let newPost;
    try {
      const { _doc } = await Post(deserializedPost).save();
      newPost = Serializer.serialize('blogPost', _doc);
    } catch (err) {
      throw formatError(err, 'db');
    }

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(newPost)
    };
  } catch (error) {
    return formatError(error);
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
    return formatError(error);
  }
};

module.exports.getPost = async event => {
  try {
    const { id } = event.pathParameters;
    await connectToDatabase();
    let post;
    post = await Post.find({ _id: id }).lean();
    if (!post) {
      throw formatError({ message: `No Post with ID: ${id}` }, 'notFound');
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
    return formatError(error);
  }
};
