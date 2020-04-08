const router = require('express-promise-router')(); // Global Try Catch Error Handling
const UsersController = require('../Controllers/Users');

const { validateParams, validateBody, schemas } = require('../Helpers/routeHelper');

// router.route('/')
//     .get(UsersController.index)
//     .post(validateBody(schemas.userSchema),UsersController.newUser);

// /users/:id
// router.route('/:userId')
// .get(validateParams(schemas.idSchema, 'userId'), UsersController.getUser)
// .put(validateParams(schemas.idSchema, 'userId'), validateBody(schemas.userSchema), UsersController.replaceUser)
// .patch([validateParams(schemas.idSchema, 'userId'), validateBody(schemas.userSchemaOptional)], UsersController.updateUser);

// router.route('/:userId/cars')
// .get(validateParams(schemas.idSchema, 'userId'), UsersController.getUserCars)
// .post([validateParams(schemas.idSchema, 'userId'), validateBody(schemas.carSchema)], UsersController.newUserCar);

router.route('/')
.get(UsersController.index)
.post(UsersController.newUser);

router.route('/:userId')
.get(UsersController.getUser)
.patch(UsersController.updateUser);

router.route('/:uid/interests')
.patch(UsersController.updateInterest);

router.route('/:uid/interests/list')
.get(UsersController.getUserInterestEventList);

// router.route('/getuser:userId?')
// .get(UsersController.getUser);




module.exports = router;