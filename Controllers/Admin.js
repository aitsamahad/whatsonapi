const Organizer = require("../Models/Organizer");
const bcrypt = require("bcryptjs");
const Event = require("../Models/Event");
const Booking = require("../Models/Booking");
const Interest = require("../Models/Interest");
const EventDate = require("../Models/EventDate");
const moment = require("moment");
const mongo = require("mongodb");
const mongoose = require("mongoose");

module.exports = {
  getAdminLoginPage: async (req, res) => {
    res.render("./admin-login");
  },

  getRegisterPage: async (req, res) => {
    res.render("./register");
  },

  postRegisterPage: async (req, res) => {
    console.log(req.body);
    const { name, email, password, password2, gender, phone } = req.body;

    let errors = [];

    //Check required fields
    if (!name || !email || !password || !password2 || !gender || !phone) {
      errors.push({ msg: "Please fill in all of the fields." });
    }

    //Check password match
    if (password !== password2) {
      errors.push({ msg: "Password do not match!" });
    }

    //Check password length
    if (password.length < 6) {
      errors.push({ msg: "Password Should at least be 6 characters long!" });
    }

    if (errors.length > 0) {
      res.render("./register", {
        errors,
        name,
        email,
        phone,
      });
    } else {
      //Validation Passed
      const organizerExist = await Organizer.find({ email: email });
      if (organizerExist.length > 0) {
        // Organizer Already exists
        errors.push({
          msg: "Organizer email already exists, please log into that.",
        });
        res.render("./register", {
          errors,
          name,
          email,
          phone,
        });
      } else {
        const newOrganizer = new Organizer({
          name,
          email,
          password,
          gender,
          phone,
        });
        //Hash Password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newOrganizer.password, salt, (err, hash) => {
            if (err) throw err;

            // Set password to hasd
            newOrganizer.password = hash;
            // Save user
            const saveOrganizer = newOrganizer
              .save()
              .then((result) => {
                errors.push({ msg: `You are now registered!` });
                res.render("./register", { errors });
              })
              .catch((err) => console.log(err));
          })
        );
      }
    }
  },
  // const result = await User.find({uid: uid}).updateOne({"uid": uid}, {$set: {"interests": interestIds}});
  getOrganizersList: async (req, res) => {
    const organizers = await Organizer.find({});
    res.render("./organizers", {
      organizers: organizers,
    });
  },

  banOrganizer: async (req, res) => {
    const { o_id } = req.params;
    const organizer = await Organizer.find({ _id: o_id }).updateOne(
      { _id: o_id },
      { $set: { isActive: false } }
    );

    req.flash("error", "User is now suspended!");
    res.redirect("/admin/organizers");
  },

  unBanOrganizer: async (req, res) => {
    const { o_id } = req.params;
    const organizer = await Organizer.find({ _id: o_id }).updateOne(
      { _id: o_id },
      { $set: { isActive: true } }
    );

    req.flash("error", "User is now active!");
    res.redirect("/admin/organizers");
  },

  getOrganizerEvents: async (req, res) => {
    const { o_id } = req.params;
    const events = await Event.find({ organizer: o_id })
      .populate(`days`, `day typesOfTicket`)
      .populate(`organizer`, `name`)
      .populate(`interest`, `title`)
      .select(
        `images days currentBookings attendees title description address lat long happyHour food music offer generalInfo ticketDetails interest`
      );

    res.render("./organizer-events", {
      events: events,
    });
  },

  getOrganizerEventBookings: async (req, res) => {
    const { eventid } = req.params;
    const eventBookings = await Booking.find({ event: eventid })
      .populate(`user`)
      .populate(`event`);

    res.render("./bookings", {
      eventid: eventid,
      bookings: eventBookings,
      moment: moment,
    });
  },

  deleteEventBooking: async (req, res) => {
    const { eventid, bookingid } = req.params;
    const deleteBooking = await Booking.findByIdAndDelete(bookingid);

    req.flash("error", "Booking deleted successfully.");
    res.redirect(`/admin/organizers/${eventid}/bookings`);
  },

  deleteOrganizerEvent: async (req, res) => {
    const { o_id, eventid } = req.params;
    const deleteOrganizerEvent = await Event.findByIdAndDelete(eventid);

    req.flash("error", "Event deleted successfully");
    res.redirect(`/admin/organizers/${o_id}/events`);
  },
};
