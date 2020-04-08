const router = require('express-promise-router')(); // Global Try Catch Error Handling
const TestController = require('../Controllers/Test');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');



const MongoURI = 'mongodb+srv://aitsamahad:pakistan123@cluster0-6u3ef.mongodb.net/test?retryWrites=true&w=majority';

const conn = mongoose.createConnection(MongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Initiate variable for GridStream
let gfs;
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
}).then(result => console.log('Connected!')).catch(err => console.log(err));

// Create Storage Engine
const storage = new GridFsStorage({
    url: MongoURI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            })
        })
    }
});

const upload = multer({ storage });


// router.route('/')
// .get(TestController.getIndex)
// .post(TestController.saveImage);

router.route('/events/add')
.get(TestController.addEvent)
.post(upload.array('eventImagesUpload'), TestController.postEvent);

router.route('/events/add/:eventid/add-dates')
.get(TestController.addDate)
.post(TestController.postAddDate);


router.route('/image/:filename')
.get((req, res) => {
    //Setting Up GridFS-Stream
    
//   const db          = mongoose.connection.db;
//   const MongoDriver = mongoose.mongo;
//   const gfs         = new Grid(db , MongoDriver);

//   const readstream = gfs.createReadStream(files.filename);
//   console.log(gfs.files)

//    //Reading to Response
//    readstream.pipe(res);
    gfs.files.findOne({filename: req.params.filename}, (err, file) => {
        console.log(file);
        // Check if file exists
        if (!file || file.length === 0) {
            return res.status(404).json({err: 'No such file exists'});
        }
        
        // Check if image

        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png' || file.contentType === 'image/jpg') {
            // Read output to browser
            const readstream = gfs.createReadStream(file.filename);
            res.set('Content-Type', file.contentType);
            readstream.pipe(res)
        } else {
            res.status(404).json({err: 'Not an image'});
        }
    });

})

module.exports = router;


