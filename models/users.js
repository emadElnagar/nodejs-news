const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  gender: { type: String },
  isAdmin: {type: Boolean, required: true, default:false}
}, {
  timestamps: true,
});

userSchema.methods.hashPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

module.exports = mongoose.model('User', userSchema);
