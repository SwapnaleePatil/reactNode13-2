module.exports = function(app, passport) {

    // route for home page
    app.get('/', function(req, res) {
        res.send({msg:"success"}) // load the index.ejs file
    });
    // route for login form
    // route for processing the login form
    // route for signup form
    // route for processing the signup form
    // route for showing the profile page
    app.get('/profile', function(req, res) {
        res.send({msg:"user"});
    });
    // route for logging out
    // app.get('/logout', function(req, res) {
    //     req.logout();
    //     res.redirect('/');
    // });

    // facebook routes
    // twitter routes

    // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails

    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect : 'http://localhost:3000/disp',
            failureRedirect : '/'
        }));

};