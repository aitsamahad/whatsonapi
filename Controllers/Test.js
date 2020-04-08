const Event = require('../Models/Event');
const Interest = require('../Models/Interest');
const Organizer = require('../Models/Organizer');
const EventDate = require('../Models/EventDate');
const User = require('../Models/User');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];




// // @route GET /
// // @desc Loads form
// app.get('/', (req, res) => {

//     gfs.files.find().toArray((err, files) => {

//         //  res.json({files: files});
//         // Check if files exists
//         if (!files || files.length === 0) {
//             res.render('index', {
//                 files: false
//             });
//         } else {
//             files.map(file => {
//                 if (file.contentType === 'image/jpeg' || file.contentType === 'image/png' || file.contentType === 'image/jpg') {
//                     file.isImage = true;
//                 } else {
//                     file.isImage = false;
//                 }
//             });
//             res.render('index', {
//                 files: files
//             });
//         }
//     })
// })

module.exports = {
    
    getEvents: async (req, res) => {
        const events = await Event.find({}).populate('organizer');
        const manualOBJ = [];
        for (let i = 0; i < events.length; i++) {
            manualOBJ[i] = { ...events[i]._doc, organizerName: events[i].organizer.name };
        }
        // console.log(req.headers);
        // console.log(events[0].organizer.name);
        res
        .status(200)
        .json(manualOBJ);
    },

    getIndex: async (req, res) => {
        res.render('./index2');
    },

    addEvent: async (req, res) => {
        const interests = await Interest.find({}).select('title');
        console.log(interests);
        res.render('./event_add', {interests: interests});
    },
    postEvent: async (req, res) => {
        // console.log(req.body);
        // console.log("files", req.files);
        const userId = '5e6df45538ad82045867fbea';
        const { 
            eventTitle,
            eventDescription,
            eventAddress,
            eventLat,
            eventLong,
            interest,
            eventHappyHour,
            eventFood,
            eventMusic,
            eventOffer,
            eventInfo,
            ticketDetailsInformation
         } = req.body;
        //  console.log(interest);
        const imagesArray = [];
        for (let i = 0; i<req.files.length; i++) {
            imagesArray.push(`test/image/${req.files[i].filename}`);
        }
         

         const newEvent = {
             title : eventTitle,
            description : eventDescription,
            address : eventAddress,
            lat : eventLat,
            long : eventLong,
            images: imagesArray,
            happyHour : eventHappyHour,
            food : eventFood,
            music : eventMusic,
            offer : eventOffer,
            generalInfo : eventInfo,
            ticketDetails : ticketDetailsInformation,
            interest : interest
        }

        console.log("New Event Object", newEvent)

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
        
        res.redirect(`/test/events/add/${newEventPost._id}/add-dates`);
        //  res.json(newEventPost);
    },

    addDate: async (req, res) => {
        const { eventid } = req.params;
        res.render('./set-date', {eventid: eventid});
        console.log(eventid);
    },

    postAddDate: async (req, res) => {
        const { eventid } = req.params;

        const {
            ticketPrice,
            eventDate,
            ticketDetails,
            noTickets
        } = req.body;

        let typesOfTicketArray = []
        for (let i = 0; i < ticketPrice.length; i++) {
            const typesOfTicket = {
                ticket: ticketDetails[i],
                noTickets: noTickets[i],
                price: ticketPrice[i],
                ticketsLeft: noTickets[i]
            }
            typesOfTicketArray.push(typesOfTicket);
        }

        const epochTime = Math.floor(new Date(eventDate) / 1000);
        const daysOBJ = {day: epochTime, typesOfTicket: typesOfTicketArray};
        console.log(req.body);
        const currentDate = new EventDate(daysOBJ);
        const currentEvent = await Event.findById(eventid);
        currentDate.event = currentEvent;
        await currentDate.save();

        currentEvent.days.push(currentDate);
        await currentEvent.save();
        res.redirect(`/test/events/add/${eventid}/add-dates`);

    }
    
    // savingImage: (event, encodedImage) => {
    //     if (encodedImage == null) return
    //     const unEncodedImage = JSON.parse(encodedImage)
    //     if (unEncodedImage != null && imageMimeTypes.includes(unEncodedImage.type)) {
    //         Event.images = new Buffer.from(unEncodedImage.data, 'base64')
    //         Event.imageType = unEncodedImage.type
    //     }
    // }


};