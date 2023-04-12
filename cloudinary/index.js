const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// associating our Cloudinary account with this cloudinary instance we are creating
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

// create a new instance of Cloudinary Storage
const storage = new CloudinaryStorage({
    // passing in the cloudinary object we configured above
    cloudinary,
    params: {
        //specifiy the folder in Cloudinary where things should be stored
        folder: 'YelpCamp',
        // specify the allowed formats
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

//export this
module.exports = {
    //our cloudinary config
    cloudinary,
    storage
}