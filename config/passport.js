const LocalStrategy = require('passport-local').Strategy;
const Organizer = require('../Models/Organizer');
const Admin = require('../Models/Admin');
const bcrypt = require('bcryptjs');

function SessionConstructor(userId, userGroup, details) {
    this.userId = userId;
    this.userGroup = userGroup;
    this.details = details;
  };


module.exports = function(passport) {

    // Session Serialization and Deserialization for Login through PassportJS
    // passport.serializeUser((user, done) => done(null, user.id));
    passport.serializeUser((user, done) => {
        let userGroup = 'organizers';
        let userPrototype = Object.getPrototypeOf(user);
        if (userPrototype === Organizer.prototype) {
            userGroup = 'organizers';
        } else if (userPrototype === Admin.prototype) {
            userGroup = 'admins';
        }
        let sessionConstructor = new SessionConstructor(user.id, userGroup, '');
        done(null, sessionConstructor);

    });

    // passport.deserializeUser((id, done) => {
    //     Organizer.findById(id, (err, user) => {
    //         done(err, user)
    //     })
    // });
    passport.deserializeUser((sessionConstructor, done) => {
        if (sessionConstructor.userGroup == 'organizers') {
            Organizer.findOne({ _id: sessionConstructor.userId }, (err, user) => {
                done(err, user);
            });
        } else if (sessionConstructor.userGroup == 'admins') {
            Admin.findOne({ _id: sessionConstructor.userId }, (err, user) => {
                done(err, user);
            })
        }
    });

    passport.use('organizer-login', 
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            // Match User
            Organizer.findOne({ email: email, isActive: true })
            .then(user => {
                if(!user) {
                    return done(null, false, { message: 'You are not an Registered as an Organizer or You are suspended for further usage, contact support.' });
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

    passport.use('admin-login', 
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            // Match User
            Admin.findOne({ email: email })
            .then(user => {
                if(!user) {
                    return done(null, false, { message: 'You are not an Admin!' });
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

};