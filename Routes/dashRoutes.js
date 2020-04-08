const express = require("express");
const Organizer = require("../Models/Organizer");
const passport = require('passport');
const FIREBASE = require("firebase-admin");
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const Token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJ1c2VybmFtZSI6ImFpdHNhbSIsImVtYWlsIjoiYWl0c2FtQGlkZXZlbG9wc3R1ZGlvLmNvbSJ9LCJpYXQiOjE1ODMwNjg4MTJ9.YIr_GadGJEy-RrEYo956oTvxp5RUZf-d8YC4aUX79qw'

const router = express.Router();

//ROUTES

// Login Handling Route
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/royapi/dashboard/users',
    failureRedirect: '/royapi/dashboard/login',
    failureFlash: true
  })(req, res, next);
});

router.get("/login", forwardAuthenticated, async (req, res) => {
  try {
    // const dashboard = new Dashboard();

  res.render('./login-layout/login/login');
  } catch (err) {
    console.log(err);
  }
});

// Logout Handler
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('error', 'You are logged out');
  res.redirect('/royapi/dashboard/login');
});

// router.post("/login", async (req, res) => {
//   try {
//     const dashboard = new Dashboard();
//     const users = await dashboard.getUsers();
//     console.log(req.body);
//     const {email, password} = req.body;
//     let errors = [];
//     if(!email || !password) {
//       errors.push({
//         msg: 'Please fill in all fields.'
//       });
//     }

//     if(errors.length > 0) {
//       res.render('./login-layout/login/login', {
//         errors,
//         email
//       });
//     } else {
//       //validation passed
//     }

//     res.render('./login-layout/login/login');
//   } catch (err) {
//     console.log(err);
//   }
// });

router.get('/users', ensureAuthenticated, async (req, res) => {
  try {
    const dashboard = new Dashboard();
    const users = await dashboard.getUsers();
    res.render('./main-layouts/dashboard/users', {data: {users: users}});
  } catch (err) {
    console.log(err);
  }
});

router.get('/announcement', ensureAuthenticated, async (req, res) => {
  try {
    const dashboard = new Dashboard();
    const users = await dashboard.getUsers();
    res.render('./main-layouts/dashboard/announcement', {data: {success: false}});
  } catch (err) {
    console.log(err);
  }
});

router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const dashboard = new Dashboard();
    const users = await dashboard.getUsers();
    res.render('./main-layouts/dashboard/users', {data: {users: users}});
  } catch (err) {
    console.log(err);
  }
});

router.get('/reports', ensureAuthenticated, async (req, res) => {
  try {
    const dashboard = new Dashboard();
    const reports = await dashboard.getQuestionReports();
    const answerReports = await dashboard.getAnswerReports();
    res.render('./main-layouts/dashboard/reports', {data: {reports: reports, answerReports: answerReports}});
  } catch (err) {
    console.log(err);
  }
});

router.post('/reports/:u_id', async (req, res) => {
  try {
    const u_id = req.params.u_id;
    const dashboard = new Dashboard();
    const userDelete = await dashboard.banUser(u_id);
    const disableUser = await FIREBASE.auth().updateUser(u_id, {disabled: true});
    res.redirect('/royapi/dashboard/reports');
  } catch (err) {
    console.log(err);
  }
});

router.post('/reports/:u_id/enable', async (req, res) => {
  try {
    const u_id = req.params.u_id;
    const dashboard = new Dashboard();
    const users = await dashboard.enableUser(u_id);
    const disableUser = await FIREBASE.auth().updateUser(u_id, {disabled: false});
    res.redirect('/royapi/dashboard/reports');
  } catch (err) {
    console.log(err);
  }
});

// Send announcements
router.post('/push-announcements', async (req, res) => {
  try{
    const announcement = req.body.announcement;
    const subjectAnnouncement = req.body.subjectAnnouncement;
    let registrationTokens = [];
    const dashboard = new Dashboard();
    const fcmTokensCollection = await dashboard.getFCMToken();

    fcmTokensCollection.forEach(collection => {
      registrationTokens.push(collection.fcm_token);
    })

    let message = {
      data: {
        title: subjectAnnouncement,
        body: announcement,
        type: "notification"
      },
      tokens: registrationTokens
    };

    FIREBASE.messaging()
    .sendMulticast(message)
    // .send(message)
    .then(response => {
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(registrationTokens[idx]);
          }
        });
        console.log(
          "List of tokens that caused failures: " + failedTokens
        );
      }
      // Response is a message ID string.
      console.log("Successfully sent message:", response);
    })
    .catch(error => {
      console.log("Error sending message:", error);
    });
    req.flash('error', 'Your Announcements have been sent to all registered and active users.');
    res.redirect('/royapi/dashboard/announcement');

  } catch (err) {
    console.log(err);
  }
});

router.post('/users/:u_id', async (req, res) => {
  try {
    const u_id = req.params.u_id;
    const dashboard = new Dashboard();
    const users = await dashboard.banUser(u_id);
    const disableUser = await FIREBASE.auth().updateUser(u_id, {disabled: true});
    res.redirect('/royapi/dashboard/users');
  } catch (err) {
    console.log(err);
  }
});

router.post('/users/:u_id/enable', async (req, res) => {
  try {
    const u_id = req.params.u_id;
    const dashboard = new Dashboard();
    const users = await dashboard.enableUser(u_id);
    const disableUser = await FIREBASE.auth().updateUser(u_id, {disabled: false});
    res.redirect('/royapi/dashboard/users');
  } catch (err) {
    console.log(err);
  }
});

router.post('/questions/:post_id', async (req, res) => {
  try {
    const post_id = req.params.post_id;
    const dashboard = new Dashboard();
    const deleteQuestion = await dashboard.deleteQuestion(post_id);
    const deleteQuestionReports = await dashboard.deleteQuestionReport(post_id);
    res.redirect('/royapi/dashboard/reports');
  } catch (err) {
    console.log(err);
  }
});

router.post('/answers/:post_id', async (req, res) => {
  try {
    const post_id = req.params.post_id;
    const dashboard = new Dashboard();
    const deleteAnswer = await dashboard.deleteAnswer(post_id);
    const deleteAnswerReport = await dashboard.deleteAnswerReport(post_id);
    res.redirect('/royapi/dashboard/reports');
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;