const {
  Types: { ObjectId }
} = require('mongoose');
const Ajv = require('ajv');
const skillSchema = require('../schemas/skillSchema.json');
const skillPatchSchema = require('../schemas/skillPatchSchema.json');
// const { formatError, parseBody, connectToDatabase } = require('../utils-old');
const {
  formatBadRequestError,
  formatDatabaseError,
  formatInternalError,
  formatNotFoundError,
  formatValidationError,
  parseBody,
  connectToDatabase
} = require('../utils');
const { Serializer } = require('../helpers/serializer');
const { Skill } = require('../models/Skill');

const ajv = new Ajv({ allErrors: true });

module.exports.createSkill = async event => {
  try {
    if (!event.body) {
      throw formatBadRequestError({ message: 'A body is required for this request' });
    }

    const parsedBody = parseBody(event.body);
    const valid = ajv.validate(skillSchema, parsedBody);
    if (!valid) {
      throw formatValidationError(ajv.errors);
    }
    const deserializedSkill = Serializer.deserialize('Skill', parsedBody);
    const newSkill = Skill(deserializedSkill);
    await connectToDatabase();
    const { _doc } = await newSkill.save();
    const serializedSkill = Serializer.serialize('Skill', _doc);
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(serializedSkill)
    };
  } catch (error) {
    console.error(error);
    return formatInternalError(error);
  }
};

module.exports.getSkills = async event => {
  try {
    await connectToDatabase();
    let skills = await Skill.find().lean();
    skills = Serializer.serialize('Skill', skills);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(skills)
    };
  } catch (error) {
    console.error(error);
    return formatInternalError(error);
  }
};

module.exports.getSkill = async event => {
  try {
    const { id } = event.pathParameters;
    await connectToDatabase();
    let skill = await Skill.findOne({ _id: id }).lean();
    skill = Serializer.serialize('Skill', skill);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(skill)
    };
  } catch (error) {
    console.error(error);
    return formatInternalError(error);
  }
};

module.exports.updateSkill = async event => {
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
    const valid = ajv.validate(skillPatchSchema, parsedBody);
    if (!valid) {
      throw formatValidationError(ajv.errors);
    }
    const deserializedSkill = Serializer.deserialize('Skill', parsedBody);
    await connectToDatabase();
    try {
      const skillExists = await Skill.findOne({ _id: id });
      if (!skillExists) {
        return formatNotFoundError({ message: `No skill with given id: ${id}` });
      }
    } catch (err) {
      formatDatabaseError(err);
    }

    const skillToUpdate = await Skill.findOneAndUpdate({ _id: id }, deserializedSkill, {
      new: true
    }).lean();

    const serializedSkill = Serializer.serialize('Skill', skillToUpdate);
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(serializedSkill)
    };
  } catch (error) {
    console.error(error);
    return formatInternalError(error);
  }
};
