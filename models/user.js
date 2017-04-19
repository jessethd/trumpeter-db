var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var ObjectId 	 = mongoose.schema.types.ObjectId;
var crypto  	 = require('crypto');
var jwt          = require('jsonwebtoken');

/**
 * Defines the User schema and model for Mongoose, and implements methods that aid in
 * the process of user creation and authentication. Note that email_addr and username 
 * are both unique fields, allowing for easy prevention and handling of duplicate
 * users in the API (routes.js).  
 **/

var userSchema = new Schema({
    email_addr: {type: String, unique: true, required: true},
    username: {type: String, unique: true, required: true},
    profile_picture: Buffer,
    hash: String,
    salt: String
});

// Generates salt and hash based on given password
userSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

// Validates given password by calculating new hash with password and salt and comparing
// to stored, valid hash
userSchema.methods.validPassword = function(password){
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    return this.hash = hash;
};

userSchema.methods.generateJwt = function() {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return jwt.sign({
        _id: this._id,
        email_addr: this.email_addr,
        username: this.username,
        exp: parseInt(expiry.getTime() / 1000),
    }, "MY_SECRET"); 
};

module.exports = mongoose.model('User', userSchema);