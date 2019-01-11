
'use strict';

// import dependencies
const { connectToDatabase } = require('../services/connection.service');
const { res } = require('../handler/res.handler');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { getAllPosts } = require('../services/post.service');

module.exports.list = async (event, context) => {

  context.callbackWaitsForEmptyEventLoop = false;
  const token = event.headers.Authorization;

  try {

    // connect to database
    const db = await connectToDatabase();

    // get user from access token
    const user = jwt.verify(token, process.env.JWT_WORD);

    const query = await getAllPosts();
    const posts = await db.collection('posts').aggregate(query).toArray();

    return res(200, { posts })

  } catch (error) {
    return res(500, { error })
  }

}

module.exports.create = async (event, context) => {

  context.callbackWaitsForEmptyEventLoop = false;
  const request = JSON.parse(event.body);
  const { title, text } = request;
  const token = event.headers.Authorization;

  if (!title || !text) return res(400, { 'error': 'INVALID BODY DATA' })

  try {

    // connect to database
    const db = await connectToDatabase();

    // get user from access token
    const user = jwt.verify(token, process.env.JWT_WORD);

    const post = {
      title,
      text,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: ObjectId(user._id)
    }

    const resultCreatePost = await db.collection('posts').insert(post);

    return res(200, { resultCreatePost })

  } catch (error) {
    return res(500, { error })
  }

}