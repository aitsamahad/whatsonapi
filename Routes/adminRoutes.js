const passport = require("passport");
const FIREBASE = require("firebase-admin");
const AdminController = require("../Controllers/Admin");
const {
  ensureAuthenticated,
  forwardAuthenticated,
} = require("../config/adminAuth");
const router = require("express-promise-router")();
const path = require("path");
const Event = require("../Models/Event");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");

// Registering Routes
router
  .route("/register")
  .get(ensureAuthenticated, AdminController.getRegisterPage)
  .post(AdminController.postRegisterPage);

// Admin Login
router
  .route("/login")
  .get(forwardAuthenticated, AdminController.getAdminLoginPage);

// Login Handling Route
router.post("/login", (req, res, next) => {
  passport.authenticate("admin-login", {
    successRedirect: "/admin/organizers",
    failureRedirect: "/admin/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout Handler
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("error", "You are logged out");
  res.redirect("/admin/login");
});

router
  .route("/organizers")
  .get(ensureAuthenticated, AdminController.getOrganizersList);

router
  .route("/organizers/ban/:o_id")
  .get(ensureAuthenticated, AdminController.banOrganizer);

router
  .route("/organizers/activate/:o_id")
  .get(ensureAuthenticated, AdminController.unBanOrganizer);

router
  .route("/event/:o_id/:eventid/delete")
  .get(ensureAuthenticated, AdminController.deleteOrganizerEvent);

router
  .route("/organizers/:o_id/events")
  .get(ensureAuthenticated, AdminController.getOrganizerEvents);

router
  .route("/organizers/:eventid/bookings")
  .get(ensureAuthenticated, AdminController.getOrganizerEventBookings);

router
  .route("/organizers/:eventid/bookings/:bookingid")
  .get(AdminController.deleteEventBooking);

module.exports = router;
