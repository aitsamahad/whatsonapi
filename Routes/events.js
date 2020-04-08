const router = require('express-promise-router')(); // Global Try Catch Error Handling
const EventController = require('../Controllers/Event');

const { validateParams, validateBody, schemas } = require('../Helpers/routeHelper');


router.route('/')
.get(EventController.getEvents);

router.route('/interests')
.get(EventController.getInterests);

router.route('/search/:search')
.get(EventController.searchEvent);

router.route('/interests/:interest')
.get(EventController.getInterestEvents);


module.exports = router;