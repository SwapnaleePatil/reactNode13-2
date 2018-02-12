var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var emp =require("./../modal/emp");
var configAuth=require("./auth");
//const passport=require("passport");
module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(emp, done) {
        done(null, emp.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        emp.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // code for login (use('local-login', new LocalStategy))
    // code for signup (use('local-signup', new LocalStategy))
    // code for facebook (use('facebook', new FacebookStrategy))
    // code for twitter (use('twitter', new TwitterStrategy))

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

            clientID        : configAuth.googleAuth.clientID,
            clientSecret    : configAuth.googleAuth.clientSecret,
            callbackURL     : configAuth.googleAuth.callbackURL,

        },
        function(token, refreshToken, profile, done) {

            // make the code asynchronous
            // User.findOne won't fire until we have all our data back from Google
            process.nextTick(function() {

                // try to find the user based on their google id
                User.findOne({ 'google.id' : profile.id }, function(err, emp) {
                    if (err)
                        return done(err);

                    if (emp) {

                        // if a user is found, log them in
                        return done(null, emp);
                    } else {
                        // if the user isnt in our database, create a new user
                        var newUser= new emp();

                        // set all of the relevant information
                        newUser.google.id    = profile.id;
                        newUser.google.token = token;
                        newUser.google.ename  = profile.displayName;
                        newUser.google.email = profile.emails[0].value; // pull the first email

                        // save the user
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            });

        }));

};