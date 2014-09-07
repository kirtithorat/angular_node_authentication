var mongoose = require('mongoose');

var bcrypt = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({
    local: {
        email: {
            type: String,
            index: {
                unique: true
            }
        },
        password: {
            type: String
        }
    },
    google: {
        id: String,
        token: String,
        email: String
    }
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

var User = mongoose.model('User', userSchema);

module.exports = {
    User: User
};