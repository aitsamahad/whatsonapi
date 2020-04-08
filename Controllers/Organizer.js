const Event = require('../Models/Event');
const Organizer = require('../Models/Organizer');
const Joi = require('joi');

module.exports = {
    // Validation: Done
    index: async (req, res, next) => {
//fbid: '123abc1221321ewaddsad'
            const organizers = await Organizer.find({});
            res.status(200).json(organizers);
    },
    // Validation: Done
    // newUser: async (req, res, next) => {

    //         const newUser = new User(req.value.body);
    //         const user = await newUser.save();
    //         res.status(201).json(user);

    // },

    newOrganizer: async (req, res, next) => {

        const newOrganizer = new Organizer(req.body);
        const organizer = await newOrganizer.save();
        res.status(201).json(organizer);

    },

    // Validation: Done
    // getUser: async (req, res, next) => {
    //     const { userId } = req.value.params;
    //     // const { userId }  = req.params;
    //     const user = await User.findById(userId);
    //     res.status(200).json(user);

    // getUser: async (req, res, next) => {
    //     const { userId } = req.query;
    //     console.log(userId);
    //     const user = await User.findById(userId);
    //     res.status(200).json(user);
    // },

    // Validation: Done
    // replaceUser: async (req, res, next) => {
    //     const { userId } = req.value.params;
    //     const newUser = req.value.body;     
    //     const result = await User.findByIdAndUpdate(userId, newUser);
    //     res.status(200).json({success: true});
    // },
    // Validation: Done
    // updateUser: async (req, res, next) => {
    //     const { userId } = req.value.params;
    //     const newUser = req.value.body;       
    //     const result = await User.findByIdAndUpdate(userId, newUser);
    //     res.status(200).json({success: true});
    // },

    // newUserCar: async (req, res, next) => {
    //     const { userId } = req.value.params;
    //     // Creating a new car
    //     const newCar = new Car(req.value.body);
    //     // Getting user to append the car to
    //     const user = await User.findById(userId);
    //     // Assign user as a car seller/owner
    //     newCar.owner = user;
    //     // Save the car
    //     await newCar.save();
    //     // Add car to the user's Model's selling array 'cars'
    //     user.cars.push(newCar);
    //     // Save the User
    //     await user.save();

    //     res.status(201).json(newCar);
    // },

    newOrganizerEvent: async (req, res, next) => {
        // const { userId } = req.params;
        // // Creating a new car
        // const newEvent = new Event(req.body);
        // // Getting user to append the car to
        // const organizer = await Organizer.findById(userId);
        // // Assign user as a car seller/owner
        // newEvent.organizer = organizer;
        // // Save the car
        // await newEvent.save();
        // // Add car to the user's Model's selling array 'cars'
        // organizer.events.push(newEvent);
        // // Save the User
        // await organizer.save();

        // res.status(201).json(newEvent);
        const { userId } = req.params;
        const { 
            title,
            description,
            address,
            lat,
            long,
            imageArray,
            type,
            price,
            happyHour,
            food,
            music,
            offer,
            generalInfo,
            ticketDetails,
            day,
            ticket,
            noTickets,
            currentBookings,
            ticketsLeft
         } = req.body;

         const typesOfTicketArray = [{
            ticket,
            noTickets,
            price,
            ticketsLeft 
        }, {
            "ticket" : "Children 50",
            "noTickets" : 50,
            "price" : 10,
            "ticketsLeft" : 40
        }];
         const images = [imageArray];

         const newEvent = {title,
            description,
            address,
            lat,
            long,
            images,
            happyHour,
            food,
            music,
            offer,
            generalInfo,
            ticketDetails,
            currentBookings,
            type, 
            days: [{
                day,
                typesOfTicket: typesOfTicketArray
            }]
        }

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

        res.status(201).json(newEventPost);
    },

    newEvent: async (req, res) => {
        const newEvent = new Event(req.body);
        const event = await newEvent.save();
        res.status(201).json(event);
    },

    organizerEvent: async (req, res, next) => {
        const { userId } = req.params;
        const organizer = await Organizer.findById(userId).populate('events');
        console.log(organizer);
        res.status(200).json(organizer.events);
    }

}

/**
 * We can interact with mongoose in 3 different ways
 * Callbacks
 * Promises
 * Async/Await (Promises)
 */