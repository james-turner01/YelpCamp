const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

// defining our user schema
// we DO NOT specify username or password here because of the plugin we use below
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// plugin passport-local-mongoose to UserSchema
// this will add on to our schema a username and password
// it also adds a hash and salt field to store the hashed password and the salt value
// it will also give us some additional methods that we can use
UserSchema.plugin(passportLocalMongoose);

//compile and export the model
module.exports = mongoose.model('User', UserSchema);