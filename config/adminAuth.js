module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if(req.isAuthenticated() && req.session.passport.user.userGroup !== 'organizers') {
            return next()
        }
        req.flash('error', 'Restricted section, Please log in!');
        res.redirect('/admin/login');
    },
    forwardAuthenticated: function(req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      }
      res.redirect('/admin/organizers');      
    }
}