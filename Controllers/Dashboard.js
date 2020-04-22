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
  getOrganizerEventsPage: async (req, res) => {
    const OrganizersEventsList = await Event.find({
      organizer: req.session.passport.user.userId,
    })
      .populate(`days`, `day typesOfTicket`)
      .populate(`organizer`, `name`)
      .populate(`interest`, `title`)
      .select(
        `images days currentBookings attendees title description address lat long happyHour food music offer generalInfo ticketDetails interest`
      );
    const OrganizerName = await Organizer.findOne({
      _id: req.session.passport.user.userId,
    }).select(`name`);
    // console.log(OrganizersEventsList);
    res.render("./events", {
      organizername: OrganizerName,
      user: req.session.passport.user.userId,
      events: OrganizersEventsList,
    });
  },

  getEventsBookings: async (req, res) => {
    const { eventid } = req.params;
    const OrganizerName = await Organizer.findOne({
      _id: req.session.passport.user.userId,
    }).select(`name`);
    const eventBookings = await Booking.find({ event: eventid })
      .populate(`user`)
      .populate(`event`);

    res.render("./event-bookings", {
      eventid: eventid,
      bookings: eventBookings,
      organizername: OrganizerName,
      moment: moment,
    });
  },

  deleteEventBooking: async (req, res) => {
    const { eventid, bookingid } = req.params;
    const deleteBooking = await Booking.findByIdAndDelete(bookingid);

    req.flash("error", "Booking deleted successfully.");
    res.redirect(`/dashboard/events/${eventid}/bookings`);
  },

  getEvents: async (req, res) => {
    const events = await Event.find({}).populate("organizer");
    const manualOBJ = [];
    for (let i = 0; i < events.length; i++) {
      manualOBJ[i] = {
        ...events[i]._doc,
        organizerName: events[i].organizer.name,
      };
    }
    // console.log(req.headers);
    // console.log(events[0].organizer.name);
    res.status(200).json(manualOBJ);
  },

  getIndex: async (req, res) => {
    res.render("./index2");
  },

  addEvent: async (req, res) => {
    const OrganizerName = await Organizer.findOne({
      _id: req.session.passport.user.userId,
    }).select(`name`);
    const interests = await Interest.find({}).select("title");
    res.render("./event_add", {
      interests: interests,
      organizername: OrganizerName,
    });
  },
  postEvent: async (req, res) => {
    const userId = req.session.passport.user;
    const {
      eventTitle,
      eventDescription,
      eventSummary,
      eventAddress,
      eventLat,
      eventLong,
      interest,
      eventHappyHour,
      eventFood,
      eventMusic,
      eventOffer,
      eventInfo,
      ticketDetailsInformation,
    } = req.body;
    //   console.log(req.body);

    const newEvent = {
      title: eventTitle,
      summary: eventSummary,
      description: eventDescription,
      address: eventAddress,
      lat: eventLat,
      long: eventLong,
      happyHour: eventHappyHour,
      food: eventFood,
      music: eventMusic,
      offer: eventOffer,
      generalInfo: eventInfo,
      ticketDetails: ticketDetailsInformation,
      interest: interest,
    };

    const newEventPost = new Event(newEvent);
    // Getting user to append the car to
    const organizer = await Organizer.findById(userId);
    // Assign user as a car seller/owner
    newEventPost.organizer = organizer;
    // Save the car
    await newEventPost.save();
    // Add car to the user's Model's selling array 'cars'
    organizer.events.push(newEventPost);
    // Save the User
    await organizer.save();

    res.redirect(`/dashboard/events/add/${newEventPost._id}/add-dates`);
    //  res.json(newEventPost);
  },

  updateEvent: async (req, res) => {
    const userId = req.session.passport.user;
    const { eventid } = req.params;
    const {
      eventTitle,
      eventDescription,
      eventSummary,
      eventAddress,
      eventLat,
      eventLong,
      interest,
      eventHappyHour,
      eventFood,
      eventMusic,
      eventOffer,
      eventInfo,
      ticketDetailsInformation,
    } = req.body;
    //   console.log(req.body);

    const newEvent = {
      title: eventTitle,
      summary: eventSummary,
      description: eventDescription,
      address: eventAddress,
      lat: eventLat,
      long: eventLong,
      happyHour: eventHappyHour,
      food: eventFood,
      music: eventMusic,
      offer: eventOffer,
      generalInfo: eventInfo,
      ticketDetails: ticketDetailsInformation,
      interest: interest,
    };

    const updateEvent = await Event.find({
      _id: eventid,
    }).updateOne(
      { _id: eventid },
      {
        $set: {
          title: eventTitle,
          summary: eventSummary,
          description: eventDescription,
          address: eventAddress,
          lat: eventLat,
          long: eventLong,
          happyHour: eventHappyHour,
          food: eventFood,
          music: eventMusic,
          offer: eventOffer,
          generalInfo: eventInfo,
          ticketDetails: ticketDetailsInformation,
          interest: interest,
        },
      }
    );

    res.redirect(`/dashboard/events/add/${eventid}/add-dates`);
    //  res.json(newEventPost);
  },

  addDate: async (req, res) => {
    const { eventid } = req.params;
    const eventDate = await EventDate.find({ event: eventid });
    const OrganizerName = await Organizer.findOne({
      _id: req.session.passport.user.userId,
    }).select(`name`);
    const currentEvent = await Event.findById(eventid);
    res.render("./set-date", {
      eventid: eventid,
      eventDate: eventDate,
      eventImages: currentEvent.images,
      organizername: OrganizerName,
      moment: moment,
    });
  },

  postAddDate: async (req, res) => {
    const { eventid } = req.params;

    const { ticketPrice, eventDate, ticketDetails, noTickets } = req.body;
    console.log(req.body);
    let typesOfTicketArray = [];
    if (Array.isArray(ticketPrice)) {
      for (let i = 0; i < ticketPrice.length; i++) {
        const typesOfTicket = {
          ticket: ticketDetails[i],
          noTickets: noTickets[i],
          price: ticketPrice[i],
          ticketsLeft: noTickets[i],
        };
        typesOfTicketArray.push(typesOfTicket);
      }
    } else {
      const typesOfTicketOBJ = {
        ticket: ticketDetails,
        noTickets: noTickets,
        price: ticketPrice,
        ticketsLeft: noTickets,
      };
      typesOfTicketArray.push(typesOfTicketOBJ);
    }

    const epochTime = Math.floor(new Date(eventDate) / 1000);
    const daysOBJ = { day: epochTime, typesOfTicket: typesOfTicketArray };
    const currentDate = new EventDate(daysOBJ);
    const currentEvent = await Event.findById(eventid);
    currentDate.event = currentEvent;
    await currentDate.save();

    currentEvent.days.push(currentDate);
    await currentEvent.save();
    req.flash("error", "Your Event day has been added successfully!");
    res.redirect(`/dashboard/events/add/${eventid}/add-dates`);
  },

  postEventImage: async (req, res) => {
    const { eventid } = req.params;
    const imageID = req.file.id;
    const currentEvent = await Event.findById(eventid);
    currentEvent.images.push(imageID);
    await currentEvent.save();
    req.flash("error", "Your Image has been uploaded successfully!");

    res.redirect(`/dashboard/events/add/${eventid}/add-dates`);
  },

  deleteEventDay: async (req, res) => {
    const { eventid, typeId } = req.params;

    const eventToCheck = await EventDate.find({ event: eventid });
    eventToCheck.forEach(async (element) => {
      if (element.typesOfTicket.length < 1) {
        const deleteDay = await EventDate.findByIdAndDelete(element._id);
      }
    });

    const currentDay = await EventDate.update(
      { event: eventid },
      {
        $pull: {
          typesOfTicket: {
            _id: typeId,
          },
        },
      }
    );

    req.flash("error", "Event Day successfully deleted.");
    res.redirect(`/dashboard/events/add/${eventid}/add-dates`);
  },

  getEditEventPage: async (req, res) => {
    const { eventid } = req.params;
    const event = await Event.findById(eventid).populate("interest");
    const OrganizerName = await Organizer.findOne({
      _id: req.session.passport.user.userId,
    }).select(`name`);
    const interests = await Interest.find({}).select("title");
    res.render("./event_edit", {
      eventid: eventid,
      interests: interests,
      organizername: OrganizerName,
      event: event,
    });
  },
};
