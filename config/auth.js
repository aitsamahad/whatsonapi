module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if(req.isAuthenticated() && req.session.passport.user.userGroup !== 'admins') {
            return next()
        }
        req.flash('error', 'Restricted section, Please log in!');
        res.redirect('/dashboard/login');
    },
    forwardAuthenticated: function(req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      }
      res.redirect('/dashboard/events');      
    }
}