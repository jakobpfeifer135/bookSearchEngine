// import user model
const { User } = require('../models');
// import sign token function from auth
const { signToken } = require('../utils/auth');
const {AuthenticationError} = require("apollo-server-express");


const resolvers = {
    Query: {
        me: async(parents,args,context) => {
            if(context.user) {
                const user = await User.findOne({_id: context.user._id}).select("-__v-password")
                return user
            }
            throw new AuthenticationError("user isn't currently logged in")

        },
    },
    Mutation: {
        addUser: async (parent, args) => {
            const userName = await User.create(args);
            const tokens = signToken(user);
      
            return { tokens, userName };
          },
          login: async (parent, { email, password }) => {
            const userName = await User.findOne({ email });
      
            if (!userName) {
              throw new AuthenticationError('Incorrect login information');
            }
      
            const correctPassword = await userName.isCorrectPassword(password);
      
            if (!correctPassword) {
              throw new AuthenticationError('Incorrect login information');
            }
      
            const tokens = signToken(userName);
            return { tokens, userName };
          },
          saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
              const updatedUser = await User.findByIdAndUpdate(
                { _id: context.user._id },
                { $push: { savedBooks: bookData } },
                { new: true }
              );
      
              return updatedUser;
            }
      
            throw new AuthenticationError('Please Login!');
          },
          removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
              const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId } } },
                { new: true }
              );
      
              return updatedUser;
            }
      
            throw new AuthenticationError('Please Login!');
          },
    }
}
