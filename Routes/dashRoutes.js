const passport = require("passport");
const DashboardController = require("../Controllers/Dashboard");
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const router = require("express-promise-router")();
const path = require("path");
const Event = require("../Models/Event");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
// const Token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJ1c2VybmFtZSI6ImFpdHNhbSIsImVtYWlsIjoiYWl0c2FtQGlkZXZlbG9wc3R1ZGlvLmNvbSJ9LCJpYXQiOjE1ODMwNjg4MTJ9.YIr_GadGJEy-RrEYo956oTvxp5RUZf-d8YC4aUX79qw'

//ROUTES

// Login Handling Route
router.post("/login", (req, res, next) => {
  passport.authenticate("organizer-login", {
    successRedirect: "/dashboard/events",
    failureRedirect: "/dashboard/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/login", forwardAuthenticated, async (req, res) => {
  try {
    // const dashboard = new Dashboard();

    res.render("./login");
  } catch (err) {
    console.log(err);
  }
});

router
  .route("/events")
  .get(ensureAuthenticated, DashboardController.getOrganizerEventsPage);

// Logout Handler
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("error", "You are logged out");
  res.redirect("/dashboard/login");
});

const MongoURI = "mongodb://localhost/whatson";

const conn = mongoose.createConnection(MongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Initiate variable for GridStream
let gfs;
conn
  .once("open", () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("uploads");
  })
  .then((result) => console.log("Connected!"))
  .catch((err) => console.log(err));

// Create Storage Engine
const storage = new GridFsStorage({
  url: MongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({ storage });

router
  .route("/events/add")
  .get(ensureAuthenticated, DashboardController.addEvent)
  .post(DashboardController.postEvent);
// .post(upload.array('eventImagesUpload'), TestController.postEvent);

router
  .route("/events/:eventid/edit")
  .get(ensureAuthenticated, DashboardController.getEditEventPage)
  .post(DashboardController.updateEvent);

router
  .route("/events/add/:eventid/add-dates")
  .get(ensureAuthenticated, DashboardController.addDate)
  .post(DashboardController.postAddDate);

router
  .route("/events/add/:eventid/:typeId")
  .get(ensureAuthenticated, DashboardController.deleteEventDay);

router
  .route("/events/add/:eventid/add-image")
  .post(upload.single("myFileName"), DashboardController.postEventImage);
// .post(DashboardController.postEventImage);

router
  .route("/events/:eventid/bookings")
  .get(DashboardController.getEventsBookings);

router
  .route("/events/:eventid/bookings/:bookingid")
  .get(DashboardController.deleteEventBooking);

router.route("/image/:filename").get((req, res) => {
  const fileId = new mongoose.mongo.ObjectId(req.params.filename);
  gfs.files.findOne({ _id: fileId }, (err, file) => {
    // Check if file exists
    if (!file || file.length === 0) {
      return res.status(404).json({ err: "No such file exists" });
    }

    // Check if image

    if (
      file.contentType === "image/jpeg" ||
      file.contentType === "image/png" ||
      file.contentType === "image/jpg"
    ) {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      res.set("Content-Type", file.contentType);
      readstream.pipe(res);
    } else {
      res.status(404).json({ err: "Not an image" });
    }
  });
});

// @route DELETE /files/:id
// @desc Delete File
router.route("/files/:eventid/:id").delete(async (req, res) => {
  const { eventid, id } = req.params;
  const currentEvent = await Event.findById(eventid);
  let ImagesTofilter = currentEvent.images;
  let indexOfArray = currentEvent.images.indexOf(id);
  let newImageArray = ImagesTofilter.splice(indexOfArray, 1);
  const result = await Event.find({ _id: eventid }).updateOne(
    { _id: eventid },
    { $set: { images: ImagesTofilter } }
  );

  gfs.remove({ _id: id, root: "uploads" }, (err, gridStore) => {
    if (err) return res.status(404).json({ err: err });
    res.redirect(`/dashboard/events/add/${eventid}/add-dates`);
  });
});

module.exports = router;
