const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {  
    // ----- Find All --------
    //   users: async () => {
    //     return User.find();
    //   },

    // ---- Find One by Username -----------
      user: async (parent, { username }) => {
    //   user: async (parent, { _id, username }) => {
        return User.findOne({ username });
        // return User.findOne({ $or: [{ _id: _id }, { username: username }], });
      },
    
    // ---- Me Query ------------
      me: async (parent, args, context) => {
        if (context.user) {
          return User.findOne({ _id: context.user._id });
        }
        throw new AuthenticationError('You need to be logged in!');
      },
    },
  
    Mutation: {
      addUser: async (parent, { username, email, password }) => {
        const user = await User.create({ username, email, password });
        const token = signToken(user);
        return { token, user };
      },
      login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
        // const user = await User.findOne({ $or: [{ username: username }, { email: email }] });
  
        if (!user) {
          throw new AuthenticationError('No user found with this email address');
        }
  
        const correctPw = await user.isCorrectPassword(password);
  
        if (!correctPw) {
          throw new AuthenticationError('Incorrect credentials');
        }
  
        const token = signToken(user);
  
        return { token, user };
      },
      saveBook: async (parent, { authors, description, title, bookId, image, link }, context) => {
        if (context.user) {
          return User.findOneAndUpdate(
            { _id: context.user._id },
            {
              $addToSet: {
                savedBooks: { authors, description, title, bookId, image, link },
              },
            },
            {
              new: true,
              runValidators: true,
            }
          );
        }
        throw new AuthenticationError('You need to be logged in!');
      },
    //   removeThought: async (parent, { thoughtId }, context) => {
    //     if (context.user) {
    //       const thought = await Thought.findOneAndDelete({
    //         _id: thoughtId,
    //         thoughtAuthor: context.user.username,
    //       });
  
    //       await User.findOneAndUpdate(
    //         { _id: context.user._id },
    //         { $pull: { thoughts: thought._id } }
    //       );
  
    //       return thought;
    //     }
    //     throw new AuthenticationError('You need to be logged in!');
    //   },
    //   removeComment: async (parent, { thoughtId, commentId }, context) => {
    //     if (context.user) {
    //       return Thought.findOneAndUpdate(
    //         { _id: thoughtId },
    //         {
    //           $pull: {
    //             comments: {
    //               _id: commentId,
    //               commentAuthor: context.user.username,
    //             },
    //           },
    //         },
    //         { new: true }
    //       );
    //     }
    //     throw new AuthenticationError('You need to be logged in!');
    //   },
    },
  };

module.exports = resolvers;
