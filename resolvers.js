const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const createToken = (user, secret, expiresIn) => {
  const { username, email } = user
  return jwt.sign({ username, email }, secret, { expiresIn })
}

module.exports = {
  Query: {
    getCurrentUser: async (_, args, { User, currentUser }) => {
      if (!currentUser) return null
      const user = User.findOne({ username: currentUser.username }).populate({
        path: 'favorites',
        model: 'Post'
      })
      return user
    },
    getPosts: async (_, args, { Post }) => {
      const posts = await Post.find({})
        .sort({ createdDate: 'desc' })
        .populate({
          path: 'createdBy',
          model: 'User'
        })
      return posts
    },
    getUserPosts: async (_, { userId }, { Post }) => {
      const posts = await Post.find({
        createdBy: userId
      })
      return posts
    },
    getPost: async (_, { postId }, { Post }) => {
      const post = await Post.findOne({ _id: postId }).populate({
        path: 'messages.messageUser',
        model: 'User'
      })
      return post
    },
    infiniteScrollPosts: async (_, { pageNum, pageSize }, { Post }) => {
      let posts
      if (pageNum === 1) {
        posts = await Post.find({})
          .sort({ createdDate: 'desc' })
          .populate({
            path: 'createdBy',
            model: 'User'
          })
          .limit(pageSize)
      } else {
        // if page numbers is greater than one, figure out how many documents to skip
        const skips = pageSize * (pageNum - 1)
        posts = await Post.find({})
          .sort({ createdDate: 'desc' })
          .populate({
            path: 'createdBy',
            model: 'User'
          })
          .skip(skips)
          .limit(pageSize)
      }
      const totalDocs = await Post.countDocuments()
      const hasMore = totalDocs > pageNum * pageSize
      return { posts, hasMore }
    },
    searchPosts: async (_, { searchTerm }, { Post }) => {
      const searchResults = await Post.find(
        // perform text search for search value 'searchTerm'
        { $text: { $search: searchTerm } },
        // asign 'searchTerm' a text score to provide best match
        { score: { $meta: 'textScore' } }
        // sort results according to textScore (as well as by likes in descending order)
      )
        .sort({
          score: { $meta: 'textScore' },
          likes: 'desc'
        })
        .limit(5)
      return searchResults
    }
  },
  Mutation: {
    addPost: async (
      _,
      { title, imageUrl, categories, description, creatorId },
      { Post }
    ) => {
      const newPost = await new Post({
        title,
        imageUrl,
        categories,
        description,
        createdBy: creatorId
      }).save()
      return newPost
    },
    updateUserPost: async (
      _,
      { postId, userId, title, imageUrl, categories, description },
      { Post }
    ) => {
      const post = await Post.findOneAndUpdate(
        { _id: postId, createdBy: userId },
        { $set: { title, imageUrl, categories, description } },
        { new: true }
      )
      return post
    },
    deleteUserPost: async (_, { postId }, { Post }) => {
      const post = await Post.findOneAndRemove({ _id: postId })
      return post
    },
    addPostMessage: async (_, { messageBody, userId, postId }, { Post }) => {
      const newMessage = {
        messageBody,
        messageUser: userId
      }
      const post = await Post.findOneAndUpdate(
        // find post by id
        { _id: postId },
        // push new message to the beginning of messages array
        { $push: { messages: { $each: [newMessage], $position: 0 } } },
        // return refreshed document after update
        { new: true }
      ).populate({
        path: 'messages.messageUser',
        model: 'User'
      })
      return post.messages[0]
    },
    likePost: async (_, { postId, username }, { Post, User }) => {
      // Find Post, add 1 to its 'likes' value
      const post = await Post.findOneAndUpdate(
        { _id: postId },
        { $inc: { likes: 1 } },
        { new: true }
      )
      // Find User, add id of post to its favorites array (which will be populated as Posts)
      const user = await User.findOneAndUpdate(
        { username },
        { $addToSet: { favorites: postId } },
        { new: true }
      ).populate({
        path: 'favorites',
        model: 'Post'
      })
      // Retuen only likes from 'post' and favorites from 'user'
      return { likes: post.likes, favorites: user.favorites }
    },
    unlikePost: async (_, { postId, username }, { Post, User }) => {
      // Find Post, add -1 to its 'likes' value
      const post = await Post.findOneAndUpdate(
        { _id: postId },
        { $inc: { likes: -1 } },
        { new: true }
      )
      // Find User, remove id of post from its favorites array (which will be populated as Posts)
      const user = await User.findOneAndUpdate(
        { username },
        { $pull: { favorites: postId } },
        { new: true }
      ).populate({
        path: 'favorites',
        model: 'Post'
      })
      // Retuen only likes from 'post' and favorites from 'user'
      return { likes: post.likes, favorites: user.favorites }
    },
    signinUser: async (_, { username, password }, { User }) => {
      const user = await User.findOne({ username })
      if (!user) throw new Error('User not found')
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) throw new Error('Invalid password')
      return { token: createToken(user, process.env.SECRET, '1hr') }
    },
    signupUser: async (_, { username, email, password }, { User }) => {
      const user = await User.findOne({ username })
      if (user) {
        throw new Error('User already exists')
      }
      const newUser = await new User({
        username,
        email,
        password
      }).save()
      return { token: createToken(newUser, process.env.SECRET, '1hr') }
    }
  }
}
