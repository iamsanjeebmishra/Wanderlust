const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wanderlust_DEV', // Specify the folder in Cloudinary where images will be stored
    allowedFormats: ['jpg', 'jpeg', 'png'], // Specify allowed image formats
  },
});
module.exports = {
  cloudinary,
  storage
};