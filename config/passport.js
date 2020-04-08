const LocalStrategy = require('passport-local').Strategy;
const Organizer = require('../Models/Organizer');
const bcrypt = require('bcryptjs');



module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            // Match User
            Organizer.findOne({ email: email })
            .then(user => {
                if(!user) {
                    return done(null, false, { message: 'You are not an Registered as an Organizer!' });
                }

            // // Match Password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if(err) throw err;
                if(isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Password incorrect!'});
                }
            });

            }).catch(err => console.log(err))
        })
    );

    // Session Serialization and Deserialization for Login through PassportJS
    passport.serializeUser((user, done) => done(null, user.id));

    passport.deserializeUser((id, done) => {
        Organizer.findById(id, (err, done) => {
            done(err, user)
        })
    });
};