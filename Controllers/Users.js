const User = require('../Models/User');
const Booking = require('../Models/Booking');
const Event = require('../Models/Event');
const Interest = require('../Models/Interest')
const Organizer = require('../Models/Organizer');
const Joi = require('joi');
const mongo = require('mongodb');

const idSchema = Joi.object().keys({
    userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});

module.exports = {
    // Validation: Done
    index: async (req, res, next) => {
//fbid: '123abc1221321ewaddsad'
            const users = await User.find({});
            res.status(200).json(users);
    },
    // Validation: Done
    // newUser: async (req, res, next) => {

    //         const newUser = new User(req.value.body);
    //         const user = await newUser.save();
    //         res.status(201).json(user);

    // },

    newUser: async (req, res, next) => {
        const { uid } = req.body;
        const user = await User.find({uid : uid});
        if (user.length > 0) {
            res.status(200).json({
                "message" : "User already exists."
            })
        } else {
            const newUser = new User(req.body);
            const user = await newUser.save();
            res.status(201).json({
                'error': false,
                'message': 'User Created.'
            });
        }

    },
    getUserInterestEventList: async (req, res) => {
        const { uid } = req.params;
        let perPage = 50;
        // let perPage = 50 , page = req.param('page') > 0 ? req.param('page') : 0;

        const user = await User.findOne({uid: uid});
        let InterestOBJ = [];
        for (let i = 0; i < user.interests.length; i++) {
            const singleInterestArrayOfEvents = await Interest.findOne({_id : user.interests[i]}).populate('events');
            const events = await Event.find({'interest': user.interests[i]}).populate(`days`)
            .limit(perPage);
            // .skip(perPage * page);

            // console.log(events);

            const singleInterestObjList = {
                "interest" : singleInterestArrayOfEvents.title,
                "events" : events
            };
            InterestOBJ.push(singleInterestObjList);
        }
        res.status(200).json(InterestOBJ);
    },

    updateUser: async (req, res, next) => {
        const { userId } = req.params;
        const newUser = req.body;    
        // const result = await User.findByIdAndUpdate(userId, newUser);
        const result = await User.find({uid : userId}).updateOne(newUser);

        if (result.nModified > 0) {
            res.status(200).json({message: "User Updated!"})  
        } else {
            res.status(501).json({message: 'Updation Failed!'});
        }
    },
    updateInterest: async (req, res) => {
        const { uid } = req.params;
        const interestArray = req.body.interests;
        console.log('DATA: ',interestArray)
        let interestIds = [];

        for(let i = 0; i < interestArray.length; i++) {
            if (interestArray[i] === '111111'){
                // Do nothing!
            } else {
                interestIds.push(new mongo.ObjectId(`${interestArray[i]}`));
            }
        }

        const result = await User.find({uid: uid}).updateOne({"uid": uid}, {$set: {"interests": interestIds}});
    
        if (result.nModified > 0) {
            res.status(200).json({message: "User Updated!"})  
        } else {
            res.status(501).json({message: 'Updation Failed!'});
        }
    },

    // Validation: Done
    // getUser: async (req, res, next) => {
    //     const { userId } = req.value.params;
    //     // const { userId }  = req.params;
    //     const user = await User.findById(userId);
    //     res.status(200).json(user);

    getUser: async (req, res, next) => {
        const { userId } = req.params;
        const interests = await Interest.find({}).select('title');
        const user = await User.find({uid : userId});
        let customUserOBJ = [];
        for (let i = 0; i < interests.length; i++) {
            if(user[0].interests.includes(interests[i]._id)) {
                customUserOBJ.push({...interests[i]._doc, "selected" : true})
            } else {
                customUserOBJ.push({...interests[i]._doc, "selected" : false})
            }
        }

        const mySelectedUser = {...user[0]._doc, "userSelectedInterests": customUserOBJ};
        
        res.status(200).json(mySelectedUser);
    },

    // Validation: Done
    replaceUser: async (req, res, next) => {
        const { userId } = req.value.params;
        const newUser = req.value.body;     
        const result = await User.findByIdAndUpdate(userId, newUser);
        res.status(200).json({success: true});
    },
    userInterest: async (req, res) => {
        const { uid } = req.params;

        const userInterest = await User.findOne({uid: uid}).populate('interests', 'title').select('uid name interests');
        res.status(200).json(userInterest);
    },
    postUserInterest: async (req, res) => {
        const { uid } = req.params;
        const interestIds = req.body;

        let interestObj = [];
        for (let i = 0; i < interestIds.length; i++) {
            interestObj.push({_id: interestIds[i]});
        }
        const user = await User.findOne({uid: uid});
        user.interests = interestObj;
        await user.save();

        res.status(201).json(interestObj);
    },
    testInterest: async (req, res) => {
        console.log(req.body);
    }
    ,
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
        const { userId } = req.value.params;
        // Creating a new car
        const newEvent = new Event(req.value.body);
        // Getting user to append the car to
        const organizer = await Organizer.findById(userId);
        // Assign user as a car seller/owner
        newEvent.organizer = organizer;
        // Save the car
        await newEvent.save();
        // Add car to the user's Model's selling array 'cars'
        organizer.events.push(newEvent);
        // Save the User
        await organizer.save();

        res.status(201).json(newEvent);
    },

    // getUserCars: async (req, res, next) => {
    //     const { userId } = req.value.params;
    //     const user = await User.findById(userId).populate('cars');
    //     res.status(200).json({cars: user.cars});
    // }

}

/**
 * We can interact with mongoose in 3 different ways
 * Callbacks
 * Promises
 * Async/Await (Promises)
 */