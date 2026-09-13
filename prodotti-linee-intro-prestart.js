const fs = require('fs');
const path = require('path');

try {
  const imageDir = path.join(__dirname, 'images');
  const imagePath = path.join(imageDir, 'intro-prodotti-coupon-api.jpg');
  const imageBase64 = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUF