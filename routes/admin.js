var express = require('express');
var router = express.Router();

var authController = require('../controller/authcontroller');
var userController = require('../controller/userController');
const authorize = require("../middlewares/authjwt");
global.myAccount = null;

// function isLogin(req, res, next) {
//     if (myAccount !== null) {
//         next();
//     } else {
//         res.redirect('/admin/signin');
//     }
// }

// get the login page
// router.get('/signin', authController.sign);
// login
router.post('/login', authController.login);
// register
router.post('/register', authController.register);
// logout
// router.get('/signin/logout', authController.logout);

// get the users page
router.get('/', authorize, userController.getUser);
// get the online users page
router.get('/onlineuser', authorize, userController.getOnlineUser);
// get the block users page
router.get('/blockuser', authorize, userController.getBlockUser);
// get the block users page
router.get('/lockuser', authorize, userController.getLockUser);
// delete the user
router.post('/lock-user', authorize, userController.lockUser);
// block the user
router.post('/block-user', authorize, userController.blockUser);
//get dispute
router.get('/dispute', authorize, userController.dispute);
//delete dispute
router.post('/delete-dispute', authorize, userController.deleteDispute);
//get all posts
router.get('/all-posts', authorize, userController.getAllPosts);

router.get('/getAllPrivates', authorize, userController.getAllPrivates);

router.get('/user', authorize, authController.getProfile);

router.post('/admin_photo', authorize, authController.updateUserImage);
module.exports = router;