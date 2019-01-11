
'use strict'

const getAllPosts = async () => {
  const query = [
    {
      $sort: { _id: -1 }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        _id: 0,
        tag: 1,
        title: 1,
        text: 1,
        createdAt: 1,
        updatedAt: 1,
        user: '$user.username'
      }
    }
  ]
  return query;
}

module.exports = {
  getAllPosts
}