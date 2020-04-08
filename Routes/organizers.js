const router = require('express-promise-router')(); // Global Try Catch Error Handling
const OrganizerController = require('../Controllers/Organizer');

const { validateParams, validateBody, schemas } = require('../Helpers/routeHelper');


router.route('/')
.get(OrganizerController.index)
.post(OrganizerController.newOrganizer);

router.route('/:userId/events')
.get(OrganizerController.organizerEvent)
.post(OrganizerController.newOrganizerEvent);




module.exports = router;