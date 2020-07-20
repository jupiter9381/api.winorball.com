// routes/auth.routes.js
const fs = require("fs");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const router = express.Router();
const userSchema = require("../models/User");
const chatroomSchema = require("../models/ChatRooms");
const authorize = require("../middlewares/authjwt");
const { check, validationResult } = require('express-validator');
const randomize = require('randomatic');
// const sesClient = require('../config/ses-client');
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
var nodemailer = require('nodemailer');
let multer = require('multer');
const path = require('path');

const DIR = './public/images';
const ADMINDIR = './public/images/admin'
let fileuploadname;
const Blockuser = require("../models/blockuser");

// Setting up the storage element
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        fileuploadname = file.fieldname + '-' + Date.now() + '.' + path.extname(file.originalname);
        cb(null, fileuploadname);
    }
});
let upload = multer({ storage: storage });

var transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    secure: true,
    port: 465,
    auth: {
        user: 'apikey',
        pass: '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'
    }
});

// Route for refresh message
router.get('/refresh/:id', (req, res) => {
    userSchema.findByIdAndUpdate(req.params.id, {
        $set: { refresh: Date.now() }
    }, (error, data) => {
        if (error) {
            console.log(error);
            res.status(500).json({
                success: false
            })
        } else {
            console.log(" image update...")
            // chatroomSchema.findOneAndUpdate({ userId: req.params.id }, { $set: { photoUrl: req.params.imageName } });
            // chatroomSchema.updateMany({ userId: req.params.id }, { $set: { photoUrl: req.params.imageName } });
            res.status(200).json({
                success: true,
            })
            console.log('User successfully updated!')
        }
    })
})

// Route for account confirm
router.get('/confirm/:id', (req, res) => {
    userSchema.findOneAndUpdate({ _id: req.params.id }, { $set: { state: 1 } }, (err, user) => {
        if (err) {
            console.log(err);
        }
        return res.status(200).json({ message: 'successfully confirmation' });
    })

})

// Route for file upload
router.post('/upload', upload.single('photo'), function (req, res) {
    if (!req.file) {
        console.log("No file received");
        return res.send({
            success: false
        });

    } else {
        console.log('file received');
        return res.send({
            success: true,
            fileName: fileuploadname
        })
    }
});

// Route for the get the uploaded image
router.get('/image/:id', (req, res) => {

});
// Route for the update the image path in db
router.get('/photo/:id/:imageName', (req, res) => {
    userSchema.findByIdAndUpdate(req.params.id, {
        $set: { photoUrl: req.params.imageName }
    }, (error, data) => {
        if (error) {
            console.log(error);
            res.status(500).json({
                success: false
            })
        } else {
            console.log(" image update...")
            // chatroomSchema.findOneAndUpdate({ userId: req.params.id }, { $set: { photoUrl: req.params.imageName } });
            // chatroomSchema.updateMany({ userId: req.params.id }, { $set: { photoUrl: req.params.imageName } });
            res.status(200).json({
                success: true,
            })
            console.log('User successfully updated!')
        }
    })
})

// Sign-up
router.post("/register-user", [
    check('name')
        .not()
        .isEmpty()
        .isLength({ min: 1 })
        .withMessage('Name must be atleast 3 characters long'),
    check('email', 'Email is required')
        .not()
        .isEmpty(),
    check('password', 'Password should be between 3 to 10 characters long')
        .not()
        .isEmpty()
        .isLength({ min: 3, max: 40 })
],
    (req, res, next) => {
        const errors = validationResult(req);
        console.log('*******sign up req.body********', req.body);

        if (!errors.isEmpty()) {
            console.log(errors);
            // return res.status(422).jsonp(errors.array());
            res.status(201).json({
                error: error
            });
        } else {
            bcrypt.hash(req.body.password, 10).then((hash) => {
                const user = new userSchema({
                    name: req.body.name,
                    email: req.body.email,
                    pseduo: req.body.pseduo,
                    firstname: req.body.firstname,
                    age: req.body.age,
                    password: hash,
                    days_15: "",
                    days_30: "",
                    pay_count: "",
                    pay_cost: "",
                    res_day: "",
                    state: 0,
                    refresh: "0",
                    register_time: Date.now(),
                    img_state: 1
                });
                console.log('registered user', user);
                let emailString = '<tbody><tr style="vertical-align: top;"><td style="word-break: break-word; vertical-align: top;"><div style="background-color:transparent; padding-top: 50px;"><div style="Margin: 0 auto; min-width: 320px; max-width: 520px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div style="min-width: 320px; max-width: 520px; display: table-cell; vertical-align: top; width: 520px; background-color: white; padding-top: 40px;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div class="img-container left fixedwidth" style="padding-right: 35px;padding-left: 35px;"><img alt="Image" border="0" src="https://i.ibb.co/jyNHLxx/Winorball-LOGO-OFF.png" style="text-decoration: none; -ms-interpolation-mode: bicubic; border: 0; height: auto; width: 100%; max-width: 182px; display: block;" title="Image"/></div></div></div></div></div></div></div><div style="background-color:transparent;"><div style="Margin: 0 auto; min-width: 320px; max-width: 520px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div style="min-width: 320px; max-width: 520px; display: table-cell; vertical-align: top; width: 520px; background-color: white;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div style="color:#555555;font-family: Tahoma, Verdana, Segoe, sans-serif;line-height:1.2;padding-top:10px;padding-right:35px;padding-bottom:10px;padding-left:35px;"><div style="font-size: 14px; line-height: 1.2; font-family:  Tahoma, Verdana, Segoe, sans-serif; color: #555555;"><p style="font-size: 24px; line-height: 1.2; text-align: left; font-family: Roboto, Tahoma, Verdana, Segoe, sans-serif; word-break: break-word; margin: 0;"><span style="font-size: 24px;">Welcome to the WINORBALL</span></p></div></div><table style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse;  min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"><tbody><tr style="vertical-align: top;"><td style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 35px; padding-bottom: 10px; padding-left: 35px;"><table style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse;  border-top: 1px solid #BBBBBB; width: 100%;"><tbody><tr style="vertical-align: top;"><td style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"><span></span></td></tr></tbody></table></td></tr></tbody></table></div></div></div></div></div></div><div style="background-color:transparent;"><div style="Margin: 0 auto; min-width: 320px; max-width: 520px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div style="min-width: 320px; max-width: 520px; display: table-cell; vertical-align: top; width: 520px; background-color: white;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div style="color:#1fcc1f;font-family: Tahoma, Verdana, Segoe, sans-serif;line-height:1.2;padding-top:10px;padding-right:35px;padding-bottom:10px;padding-left:35px;"><div style="font-size: 14px; line-height: 1.2; font-family:  Tahoma, Verdana, Segoe, sans-serif; color: #1fcc1f; "><p style="font-size: 16px; line-height: 1.2; text-align: left; font-family: Roboto, Tahoma, Verdana, Segoe, sans-serif; word-break: break-word;  margin: 0;"><span style="font-size: 16px;">Hi ' + req.body.name + ', your registration is completed!</span></p></div></div></div></div></div></div></div></div><div style="background-color:transparent;"><div style="Margin: 0 auto; min-width: 320px; max-width: 520px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div style="min-width: 320px; max-width: 520px; display: table-cell; vertical-align: top; width: 520px; background-color: white;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div style="color:#555555;font-family: Tahoma, Verdana, Segoe, sans-serif;line-height:1.2;padding-top:10px;padding-right:35px;padding-bottom:10px;padding-left:35px;"><div style="font-size: 14px; line-height: 1.2; font-family:  Tahoma, Verdana, Segoe, sans-serif; color: #555555; "><p style="font-size: 14px; line-height: 1.2; text-align: left; font-family: Roboto, Tahoma, Verdana, Segoe, sans-serif; word-break: break-word;  margin: 0;"><span style="font-size: 14px;">Welcome to winorball and thank you for your registration. Please confirm your account to discuss football with all the community.</span></p></div></div><div style="padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;text-align: center;"><a href="https://winorball.com/confirm/' + user._id + '" style="-webkit-text-size-adjust: none; text-decoration: none; display: inline-block; color: #ffffff; background-color: #209020; border-radius: 8px; -webkit-border-radius: 8px; -moz-border-radius: 8px; width: auto; width: auto; border-top: 1px solid #209020; border-right: 1px solid #209020; border-bottom: 1px solid #209020; border-left: 1px solid #209020; padding-top: 10px; padding-bottom: 10px; font-family:  Tahoma, Verdana, Segoe, sans-serif; text-align: center;  word-break: keep-all;" target="_blank"><span style="padding-left:30px;padding-right:30px;font-size:16px;display:inline-block;"><span style="font-size: 16px; line-height: 2; font-family: Roboto, Tahoma, Verdana, Segoe, sans-serif; word-break: break-word; ">CONFIRM REGISTRATION</span></span></a></div></div></div></div></div></div></div><div style="background-color:transparent;"><div style="Margin: 0 auto; min-width: 320px; max-width: 520px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div style="min-width: 320px; max-width: 520px; display: table-cell; vertical-align: top; width: 520px; background-color: white;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div style="padding-right: 35px;padding-left: 35px; text-align: center;"><img align="center" alt="Image" src="https://i.ibb.co/NNb2kWB/6407360.png" style="text-decoration: none; -ms-interpolation-mode: bicubic; border: 0; height: auto; width: 70%; margin-left: 15%; max-width: 300px; display: block;" title="Image"/></div></div></div></div></div></div></div><div style="background-color:transparent; padding-bottom: 50px;"><div style="Margin: 0 auto; min-width: 320px; max-width: 520px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div style="min-width: 320px; max-width: 520px; display: table-cell; vertical-align: top; width: 520px; background-color: white; padding-bottom: 10px;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div style="color:#555555;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:0px;padding-left:10px;"><div style="font-size: 14px; line-height: 1.2; color: #555555; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; "><p style="text-align: center; line-height: 1.2; word-break: break-word;  margin: 0;">© 2020 Winorball, INC. ALL RIGHTS RESERVED</p></div></div></div></div></div></div></div></div></td></tr></tbody></table>';
                user.save().then((response) => {
                    console.log('user saved: ', response);

                    var mailOptions = {
                        from: 'admin@winorball.com', // sender address
                        to: req.body.email, // list of receivers
                        subject: 'Welcome, winorball!', // Subject line
                        // text: 'Hello world ?', // plaintext body
                        html: emailString // html body
                    };


                    transporter.sendMail(mailOptions, function (error, info) {
                        console.log('test email sent:', info)
                        if (error) {
                            return console.log(error);
                        }
                        console.log('Message sent: ' + info.response);
                    });



                    // sesClient.sendEmail(req.body.email, 'Welcome, winorball!', emailString);

                    res.status(201).json({
                        message: "User successfully created!",
                        result: response
                    });
                }).catch(error => {
                    res.status(201).json({
                        error: error
                    });
                });
            });
        }
    });

//forget
router.post('/forget', async (req, res, next) => {
    try {
        let user = await userSchema.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ message: "Authentication failed" });
        } else {
            user.val_code = randomize('0', 6);
            await user.save();
            console.log('forget', user);
            let emailString = '<body style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #FFFFFF;"><tbody><tr style="vertical-align: top;"><td style="word-break: break-word; vertical-align: top;"><div style="background-color:transparent; padding-top: 50px;"><div style="Margin: 0 auto; min-width: 320px; max-width: 520px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div style="min-width: 320px; max-width: 520px; display: table-cell; vertical-align: top; width: 520px; background-color: white; padding-top: 40px;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div class="img-container left fixedwidth" style="padding-right: 35px;padding-left: 35px;"><img alt="Image" border="0" src="https://i.ibb.co/jyNHLxx/Winorball-LOGO-OFF.png" style="text-decoration: none; -ms-interpolation-mode: bicubic; border: 0; height: auto; width: 100%; max-width: 182px; display: block;" title="Image"/></div></div></div></div></div></div></div><div style="background-color:transparent;"><div style="Margin: 0 auto; min-width: 320px; max-width: 520px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div style="min-width: 320px; max-width: 520px; display: table-cell; vertical-align: top; width: 520px; background-color: white;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div style="color:#555555;font-family: Tahoma, Verdana, Segoe, sans-serif;line-height:1.2;padding-top:10px;padding-right:35px;padding-bottom:10px;padding-left:35px;"><div style="font-size: 14px; line-height: 1.2; font-family:  Tahoma, Verdana, Segoe, sans-serif; color: #555555;"><p style="font-size: 24px; line-height: 1.2; text-align: left; font-family: Roboto, Tahoma, Verdana, Segoe, sans-serif; word-break: break-word; margin: 0;"><span style="font-size: 24px;">Reset your password</span></p></div></div><table style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse;  min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"><tbody><tr style="vertical-align: top;"><td style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 35px; padding-bottom: 10px; padding-left: 35px;"><table style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse;  border-top: 1px solid #BBBBBB; width: 100%;"><tbody><tr style="vertical-align: top;"><td style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"><span></span></td></tr></tbody></table></td></tr></tbody></table></div></div></div></div></div></div><div style="background-color:transparent;"><div style="Margin: 0 auto; min-width: 320px; max-width: 520px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div style="min-width: 320px; max-width: 520px; display: table-cell; vertical-align: top; width: 520px; background-color: white;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div style="color:#555555;font-family: Tahoma, Verdana, Segoe, sans-serif;line-height:1.2;padding-top:10px;padding-right:35px;padding-bottom:10px;padding-left:35px;"><div style="font-size: 14px; line-height: 1.2; font-family:  Tahoma, Verdana, Segoe, sans-serif; color: #555555; "><p style="font-size: 14px; line-height: 1.2; text-align: left; font-family: Roboto, Tahoma, Verdana, Segoe, sans-serif; word-break: break-word;  margin: 0;"><span style="font-size: 14px;">Please confirm your password renewal request<br>Renewal validation code: "' + user.val_code + '"<br>Please do not reply to this message.</span></p></div></div><div style="padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;text-align: center;"></div></div></div></div></div></div></div><div style="background-color:transparent;"><div style="Margin: 0 auto; min-width: 320px; max-width: 520px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div style="min-width: 320px; max-width: 520px; display: table-cell; vertical-align: top; width: 520px; background-color: white;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div style="padding-right: 35px;padding-left: 35px; text-align: center;"><img align="center" alt="Image" src="https://i.ibb.co/NNb2kWB/6407360.png" style="text-decoration: none; -ms-interpolation-mode: bicubic; border: 0; height: auto; width: 70%; margin-left: 15%; max-width: 300px; display: block;" title="Image"/></div></div></div></div></div></div></div><div style="background-color:transparent; padding-bottom: 50px;"><div style="Margin: 0 auto; min-width: 320px; max-width: 520px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div style="min-width: 320px; max-width: 520px; display: table-cell; vertical-align: top; width: 520px; background-color: white; padding-bottom: 10px;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div style="color:#555555;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:0px;padding-left:10px;"><div style="font-size: 14px; line-height: 1.2; color: #555555; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; "><p style="text-align: center; line-height: 1.2; word-break: break-word;  margin: 0;">© 2020 Winorball, INC. ALL RIGHTS RESERVED</p></div></div></div></div></div></div></div></div></td></tr></tbody></table></body>';
            var mailOptions = {
                from: 'admin@winorball.com', // sender address
                to: req.body.email, // list of receivers
                subject: 'Welcome, winorball!', // Subject line
                // text: 'Hello world ?', // plaintext body
                html: emailString // html body
            };


            transporter.sendMail(mailOptions, function (error, info) {
                console.log('test email sent:', info)
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: ' + info.response);
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error });
    }
});
// Sign-in
router.post("/signin", (req, res, next) => {
    console.log('*******sign in req.body********', req.body);
    let getUser;
    if (req.params.verify) {
        console.log("to verify");
        console.log(req.params.verify);
    }
    userSchema.findOne({
        email: req.body.email,
        state: 1
    }).then(user => {
        if (!user) {
            return res.status(200).json({
                error: "Authentication failed"
            });
        }
        getUser = user;
        return bcrypt.compare(req.body.password, user.password);
    }).then(response => {
        if (!response) {
            return res.status(200).json({
                error: "Authentication failed"
            });
        }
        let jwtToken = jwt.sign({
            email: getUser.email,
            userId: getUser._id
        }, "longer-secret-is-better", {
            expiresIn: "1h"
        });
        const io = req.app.get('io');
        io.emit('user name added', 'sss');
        res.status(200).json({
            token: jwtToken,
            expiresIn: 3600,
            _id: getUser._id
        });
    }).catch(err => {
        return res.status(200).json({
            error: "Authentication failed"
        });
    });
});

// Get Users
router.route('/').get((req, res) => {
    userSchema.find((error, response) => {
        if (error) {
            return next(error)
        } else {
            res.status(200).json(response)
        }
    })
})

// Get Single User
router.route('/user-profile/:id').get(authorize, (req, res, next) => {
    userSchema.findById(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                msg: data
            })
        }
    })
})
router.route('/userProfile/:id').get((req, res, next) => {
    userSchema.findById(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                msg: data
            })
        }
    })
})
// Update User
router.route('/update-user/:id').put((req, res, next) => {
    console.log("this is the update user");
    console.log(req);
    bcrypt.hash(req.body.password, 10).then((hash) => {
        console.log("-----this is the update passsword--------" + hash);
        userSchema.findByIdAndUpdate(req.params.id, {
            password: hash
        }, (err, data) => {
            if (err) {
                return next(err);
                console.log(err);
            } else {
                res.json(data)
                console.log('User successfully updated!')
            }
        })
    })
})

router.route('/verify_val_code').post((req, res, next) => {
    console.log(req.body);
    let user = userSchema.findOne({ email: req.body.email, val_code: req.body.val_code }).then((user) => {
        if (user) {
            return res.status(200).json({ success: true });
        }
    });
})

router.route('/updatePassword').post((req, res, next) => {
    console.log("this is the update user");
    console.log(req.body);
    bcrypt.hash(req.body.updatePassword, 10).then((hash) => {
        console.log("-----this is the update passsword--------" + hash);
        userSchema.findOneAndUpdate({ email: req.body.email }, {
            password: hash
        }, (err, data) => {
            if (err) {
                return next(err);
                console.log(err);
            } else {
                return res.status(200).json({ success: true });
                console.log('User successfully updated!')
            }
        })
    })
})
// Delete User
router.route('/delete-user/:id').delete((req, res, next) => {
    userSchema.findByIdAndRemove(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                msg: data
            })
        }
    })
})
// update user subscription15
router.route('/subscription15/:id').get((req, res, next) => {
    let currentTime = Date.now();
    console.log("...this is the current time...");
    console.log(currentTime);
    userSchema.findById(req.params.id).then((doc) => {
        if (doc.res_day != '' && currentTime < doc.res_day) {
            currentTime = (parseInt(doc.res_day) + 15 * 86400 * 1000);
        } else {
            currentTime = currentTime + 15 * 86400 * 1000;
        }
        console.log("...this is the expired time...");
        console.log(currentTime);
        let days15 = '1';
        let cost = '999';
        let count = '';
        if (doc.pay_count == null || doc.pay_count == '') {
            days15 = '1';
            cost = '999';
            count = '1';
        } else {
            if (doc.days_15 == null || doc.days_15 == '') {
                days15 = '1';
                if (doc.days_30 == null || doc.days_30 == '') {
                    cost = '999';
                } else {
                    cost = (parseInt(doc.pay_cost) + 999).toString();
                }
                count = (parseInt(doc.pay_count) + 1).toString();
            } else {
                days15 = (parseInt(doc.days_15) + 1).toString();
                cost = (parseInt(doc.pay_cost) + 999).toString();
                count = (parseInt(doc.pay_count) + 1).toString();
            }
        }
        userSchema.findByIdAndUpdate(doc._id, { days_15: days15, pay_cost: cost, pay_count: count, res_day: currentTime }, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(501).send('failed');
            } else {
                userSchema.findById(doc._id).then((doc) => {
                    console.log(doc);
                    let emailString = '<body style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #FFFFFF;"><tbody><tr style="vertical-align: top;"><td style="word-break: break-word; vertical-align: top;"><div style="background-color:transparent; padding-top: 50px;"><div style="Margin: 0 auto; min-width: 320px; max-width: 520px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div style="min-width: 320px; max-width: 520px; display: table-cell; vertical-align: top; width: 520px; background-color: white; padding-top: 40px;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div class="img-container left fixedwidth" style="padding-right: 35px;padding-left: 35px;"><img alt="Image" border="0" src="https://i.ibb.co/jyNHLxx/Winorball-LOGO-OFF.png" style="text-decoration: none; -ms-interpolation-mode: bicubic; border: 0; height: auto; width: 100%; max-width: 182px; display: block;" title="Image"/></div></div></div></div></div></div></div><div style="background-color:transparent;"><div style="Margin: 0 auto; min-width: 320px; max-width: 520px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div style="min-width: 320px; max-width: 520px; display: table-cell; vertical-align: top; width: 520px; background-color: white;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div style="color:#555555;font-family: Tahoma, Verdana, Segoe, sans-serif;line-height:1.2;padding-top:15px;padding-right:35px;padding-bottom:5px;padding-left:35px;"><div style="font-size: 14px; line-height: 1.2; font-family:  Tahoma, Verdana, Segoe, sans-serif; color: #555555;"><p style="font-size: 20px; line-height: 1.2; text-align: left; font-family: Roboto, Tahoma, Verdana, Segoe, sans-serif; word-break: break-word; margin: 0;"><span style="font-size: 18px;">Confirmation of payment of the subscription Winorball:</span></p></p></div></div><table style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse;  min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"><tbody><tr style="vertical-align: top;"><td style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 35px; padding-bottom: 10px; padding-left: 35px;"><table style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse;  border-top: 1px solid #BBBBBB; width: 100%;"><tbody><tr style="vertical-align: top;"><td style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"><span></span></td></tr></tbody></table></td></tr></tbody></table></div></div></div></div></div></div><div style="background-color:transparent;"><div style="Margin: 0 auto; min-width: 320px; max-width: 520px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div style="min-width: 320px; max-width: 520px; display: table-cell; vertical-align: top; width: 520px; background-color: white;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div style="color:#555555;font-family: Tahoma, Verdana, Segoe, sans-serif;line-height:1.2;padding-top:10px;padding-right:35px;padding-bottom:10px;padding-left:35px;"><div style="font-size: 14px; line-height: 1.2; font-family:  Tahoma, Verdana, Segoe, sans-serif; color: #555555; "><p style="font-size: 14px; line-height: 1.2; text-align: left; font-family: Roboto, Tahoma, Verdana, Segoe, sans-serif; word-break: break-word;  margin: 0;"><span style="font-size: 14px;"><b>Your subscription will be effective within a short time </b><br><br> Congratulations! ' + doc.pseduo + 'You have just confirmed the payment of your subscription. <br><br>We strive to make your use of our website as smooth as possible. Discuss football and make the best decisions for your online betting. Login Now and start the discussion at our website.<br><br>The Wifball team thanks you for your confidence and hopes that you will benefit the most from your new advantages! </span></span></span></p></div></div><div style="padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;text-align: center;"><a href="https://winorball.com" style="-webkit-text-size-adjust: none; text-decoration: none; display: inline-block; color: #ffffff; background-color: #209020; border-radius: 8px; -webkit-border-radius: 8px; -moz-border-radius: 8px; width: auto; width: auto; border-top: 1px solid #209020; border-right: 1px solid #209020; border-bottom: 1px solid #209020; border-left: 1px solid #209020; padding-top: 10px; padding-bottom: 10px; font-family:  Tahoma, Verdana, Segoe, sans-serif; text-align: center;  word-break: keep-all;" target="_blank"><span style="padding-left:30px;padding-right:30px;font-size:16px;display:inline-block;"><span style="font-size: 16px; line-height: 2; font-family: Roboto, Tahoma, Verdana, Segoe, sans-serif; word-break: break-word; ">Click Here To Login</span></span></a></div></div></div></div></div></div></div><div style="background-color:transparent;"><div style="Margin: 0 auto; min-width: 320px; max-width: 520px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div style="min-width: 320px; max-width: 520px; display: table-cell; vertical-align: top; width: 520px; background-color: white;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div style="padding-right: 35px;padding-left: 35px; text-align: center;"><img align="center" alt="Image" src="https://i.imgur.com/DBc9j6n.png" style="text-decoration: none; -ms-interpolation-mode: bicubic; border: 0; height: auto; width: 70%; margin-left: 15%; max-width: 300px; display: block;" title="Image"/></div></div></div></div></div></div></div><div style="background-color:transparent; padding-bottom: 50px;"><div style="Margin: 0 auto; min-width: 320px; max-width: 520px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div style="min-width: 320px; max-width: 520px; display: table-cell; vertical-align: top; width: 520px; background-color: white; padding-bottom: 10px;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div style="color:#555555;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:0px;padding-left:10px;"><div style="font-size: 14px; line-height: 1.2; color: #555555; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; "><p style="text-align: center; line-height: 1.2; word-break: break-word;  margin: 0;">© 2020 Winorball, INC. ALL RIGHTS RESERVED</p></div></div></div></div></div></div></div></div><div style="background-color:transparent;"><div style="Margin: 0 auto; min-width: 320px; max-width: 520px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div style="max-width: 320px; min-width: 173px; display: table-cell; vertical-align: top; width: 173px; background-color: white;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 5px; padding-left: 5px;"><div style="color:#008000;font-family: Tahoma, Verdana, Segoe, sans-serif;line-height:1.2;padding-top:10px;padding-right:0px;padding-bottom:10px;padding-left:0px;"><div style="font-size: 14px; line-height: 1.2; font-family:  Tahoma, Verdana, Segoe, sans-serif; color: #008000; "><p style="font-size: 14px; line-height: 1.2; word-break: break-word; text-align: center; font-family: Roboto, Tahoma, Verdana, Segoe, sans-serif;  margin: 0;"><a href="https://winorball.com/condition" rel="noopener" style="text-decoration: none; color: #008000;" target="_blank" title="CGU/CGV"><span style="font-size: 16px;"><strong>CGU/CGV</strong></span></a></p></div></div></div></div></div><div style="max-width: 320px; min-width: 173px; display: table-cell; vertical-align: top; width: 173px; background-color: white;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div style="color:#008000;font-family: Tahoma, Verdana, Segoe, sans-serif;line-height:1.2;padding-top:10px;padding-right:0px;padding-bottom:10px;padding-left:0px;"><div style="font-size: 14px; line-height: 1.2; font-family:  Tahoma, Verdana, Segoe, sans-serif; color: #008000; "><p style="font-size: 14px; line-height: 1.2; word-break: break-word; text-align: center; font-family: Roboto, Tahoma, Verdana, Segoe, sans-serif;  margin: 0;"><strong><span style="font-size: 16px;"><a href="https://winorball.com/privacy" rel="noopener" style="text-decoration: none; color: #008000;" target="_blank">privacy policy</a></span></strong></p></div></div></div></div></div><div style="max-width: 320px; min-width: 173px; display: table-cell; vertical-align: top; width: 173px; background-color: white;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div style="color:#008000;font-family: Tahoma, Verdana, Segoe, sans-serif;line-height:1.2;padding-top:10px;padding-right:0px;padding-bottom:10px;padding-left:0px;"><div style="font-size: 14px; line-height: 1.2; font-family:  Tahoma, Verdana, Segoe, sans-serif; color: #008000; "><p style="font-size: 14px; line-height: 1.2; word-break: break-word; text-align: center; font-family: Roboto, Tahoma, Verdana, Segoe, sans-serif;  margin: 0;"><a href="https://winorball.com/legal" rel="noopener" style="text-decoration: none; color: #008000;" target="_blank"><strong><span style="font-size: 16px;">Legal Notice</span></strong></a></p></div></div></div></div></div></div></div></div></td></tr></tbody></table></body>'

                    var mailOptions = {
                        from: 'admin@winorball.com', // sender address
                        to: doc.email, // list of receivers
                        subject: 'Welcome, winorball!', // Subject line
                        // text: 'Hello world ?', // plaintext body
                        html: emailString // html body
                    };


                    transporter.sendMail(mailOptions, function (error, info) {
                        console.log('test email sent:', info)
                        if (error) {
                            return console.log(error);
                        }
                        console.log('Message sent: ' + info.response);
                    });

                    return res.status(200).send(doc);
                }).catch((e) => {
                    console.log(e);
                    return res.status(200).send(result);
                })

            }
        });

    })
})
// update user subscription30
router.route('/subscription30/:id').get((req, res, next) => {
    let currentTime = Date.now();
    console.log(currentTime);
    userSchema.findById(req.params.id).then((doc) => {
        if (doc.res_day && currentTime < doc.res_day) {
            currentTime = (parseInt(doc.res_day) + 30 * 86400 * 1000);
        } else {
            currentTime = currentTime + 30 * 86400 * 1000;
        }
        let days30 = '1';
        let cost = '1499';
        let count = '';
        if (doc.pay_count == null || doc.pay_count == '') {
            days30 = '1';
            cost = '1499';
            count = '1';
        } else {
            if (doc.days_30 == null || doc.days_30 == '') {
                days30 = '1';
                if (doc.days_15 == null || doc.days_30) {
                    cost = '1499';
                } else {
                    cost = (parseInt(doc.pay_cost) + 1499).toString();
                }
                count = (parseInt(doc.pay_count) + 1).toString();
            } else {
                days30 = (parseInt(doc.days_30) + 1).toString();
                cost = (parseInt(doc.pay_cost) + 1499).toString();
                count = (parseInt(doc.pay_count) + 1).toString();

            }
        }
        userSchema.findByIdAndUpdate(doc._id, { days_30: days30, pay_cost: cost, pay_count: count, res_day: currentTime }, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(501).send('failed');
            } else {
                userSchema.findById(doc._id).then((doc) => {
                    console.log(doc);
                    let emailString = '<body style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #FFFFFF;"><tbody><tr style="vertical-align: top;"><td style="word-break: break-word; vertical-align: top;"><div style="background-color:transparent; padding-top: 50px;"><div style="Margin: 0 auto; min-width: 320px; max-width: 520px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div style="min-width: 320px; max-width: 520px; display: table-cell; vertical-align: top; width: 520px; background-color: white; padding-top: 40px;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div class="img-container left fixedwidth" style="padding-right: 35px;padding-left: 35px;"><img alt="Image" border="0" src="https://i.ibb.co/jyNHLxx/Winorball-LOGO-OFF.png" style="text-decoration: none; -ms-interpolation-mode: bicubic; border: 0; height: auto; width: 100%; max-width: 182px; display: block;" title="Image"/></div></div></div></div></div></div></div><div style="background-color:transparent;"><div style="Margin: 0 auto; min-width: 320px; max-width: 520px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div style="min-width: 320px; max-width: 520px; display: table-cell; vertical-align: top; width: 520px; background-color: white;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div style="color:#555555;font-family: Tahoma, Verdana, Segoe, sans-serif;line-height:1.2;padding-top:15px;padding-right:35px;padding-bottom:5px;padding-left:35px;"><div style="font-size: 14px; line-height: 1.2; font-family:  Tahoma, Verdana, Segoe, sans-serif; color: #555555;"><p style="font-size: 20px; line-height: 1.2; text-align: left; font-family: Roboto, Tahoma, Verdana, Segoe, sans-serif; word-break: break-word; margin: 0;"><span style="font-size: 18px;">Confirmation of payment of the subscription Winorball:</span></p></p></div></div><table style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse;  min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"><tbody><tr style="vertical-align: top;"><td style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 35px; padding-bottom: 10px; padding-left: 35px;"><table style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse;  border-top: 1px solid #BBBBBB; width: 100%;"><tbody><tr style="vertical-align: top;"><td style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"><span></span></td></tr></tbody></table></td></tr></tbody></table></div></div></div></div></div></div><div style="background-color:transparent;"><div style="Margin: 0 auto; min-width: 320px; max-width: 520px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div style="min-width: 320px; max-width: 520px; display: table-cell; vertical-align: top; width: 520px; background-color: white;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div style="color:#555555;font-family: Tahoma, Verdana, Segoe, sans-serif;line-height:1.2;padding-top:10px;padding-right:35px;padding-bottom:10px;padding-left:35px;"><div style="font-size: 14px; line-height: 1.2; font-family:  Tahoma, Verdana, Segoe, sans-serif; color: #555555; "><p style="font-size: 14px; line-height: 1.2; text-align: left; font-family: Roboto, Tahoma, Verdana, Segoe, sans-serif; word-break: break-word;  margin: 0;"><span style="font-size: 14px;"><b>Your subscription will be effective within a short time </b><br><br> Congratulations! ' + doc.pseduo + 'You have just confirmed the payment of your subscription. <br><br>We strive to make your use of our website as smooth as possible. Discuss football and make the best decisions for your online betting. Login Now and start the discussion at our website.<br><br>The Wifball team thanks you for your confidence and hopes that you will benefit the most from your new advantages! </span></span></span></p></div></div><div style="padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;text-align: center;"><a href="https://winorball.com" style="-webkit-text-size-adjust: none; text-decoration: none; display: inline-block; color: #ffffff; background-color: #209020; border-radius: 8px; -webkit-border-radius: 8px; -moz-border-radius: 8px; width: auto; width: auto; border-top: 1px solid #209020; border-right: 1px solid #209020; border-bottom: 1px solid #209020; border-left: 1px solid #209020; padding-top: 10px; padding-bottom: 10px; font-family:  Tahoma, Verdana, Segoe, sans-serif; text-align: center;  word-break: keep-all;" target="_blank"><span style="padding-left:30px;padding-right:30px;font-size:16px;display:inline-block;"><span style="font-size: 16px; line-height: 2; font-family: Roboto, Tahoma, Verdana, Segoe, sans-serif; word-break: break-word; ">Click Here To Login</span></span></a></div></div></div></div></div></div></div><div style="background-color:transparent;"><div style="Margin: 0 auto; min-width: 320px; max-width: 520px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div style="min-width: 320px; max-width: 520px; display: table-cell; vertical-align: top; width: 520px; background-color: white;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div style="padding-right: 35px;padding-left: 35px; text-align: center;"><img align="center" alt="Image" src="https://i.imgur.com/DBc9j6n.png" style="text-decoration: none; -ms-interpolation-mode: bicubic; border: 0; height: auto; width: 70%; margin-left: 15%; max-width: 300px; display: block;" title="Image"/></div></div></div></div></div></div></div><div style="background-color:transparent; padding-bottom: 50px;"><div style="Margin: 0 auto; min-width: 320px; max-width: 520px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div style="min-width: 320px; max-width: 520px; display: table-cell; vertical-align: top; width: 520px; background-color: white; padding-bottom: 10px;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div style="color:#555555;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:0px;padding-left:10px;"><div style="font-size: 14px; line-height: 1.2; color: #555555; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; "><p style="text-align: center; line-height: 1.2; word-break: break-word;  margin: 0;">© 2020 Winorball, INC. ALL RIGHTS RESERVED</p></div></div></div></div></div></div></div></div><div style="background-color:transparent;"><div style="Margin: 0 auto; min-width: 320px; max-width: 520px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; background-color: transparent;"><div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;"><div style="max-width: 320px; min-width: 173px; display: table-cell; vertical-align: top; width: 173px; background-color: white;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 5px; padding-left: 5px;"><div style="color:#008000;font-family: Tahoma, Verdana, Segoe, sans-serif;line-height:1.2;padding-top:10px;padding-right:0px;padding-bottom:10px;padding-left:0px;"><div style="font-size: 14px; line-height: 1.2; font-family:  Tahoma, Verdana, Segoe, sans-serif; color: #008000; "><p style="font-size: 14px; line-height: 1.2; word-break: break-word; text-align: center; font-family: Roboto, Tahoma, Verdana, Segoe, sans-serif;  margin: 0;"><a href="https://winorball.com/condition" rel="noopener" style="text-decoration: none; color: #008000;" target="_blank" title="CGU/CGV"><span style="font-size: 16px;"><strong>CGU/CGV</strong></span></a></p></div></div></div></div></div><div style="max-width: 320px; min-width: 173px; display: table-cell; vertical-align: top; width: 173px; background-color: white;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div style="color:#008000;font-family: Tahoma, Verdana, Segoe, sans-serif;line-height:1.2;padding-top:10px;padding-right:0px;padding-bottom:10px;padding-left:0px;"><div style="font-size: 14px; line-height: 1.2; font-family:  Tahoma, Verdana, Segoe, sans-serif; color: #008000; "><p style="font-size: 14px; line-height: 1.2; word-break: break-word; text-align: center; font-family: Roboto, Tahoma, Verdana, Segoe, sans-serif;  margin: 0;"><strong><span style="font-size: 16px;"><a href="https://winorball.com/privacy" rel="noopener" style="text-decoration: none; color: #008000;" target="_blank">privacy policy</a></span></strong></p></div></div></div></div></div><div style="max-width: 320px; min-width: 173px; display: table-cell; vertical-align: top; width: 173px; background-color: white;"><div style="width:100% !important;"><div style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;"><div style="color:#008000;font-family: Tahoma, Verdana, Segoe, sans-serif;line-height:1.2;padding-top:10px;padding-right:0px;padding-bottom:10px;padding-left:0px;"><div style="font-size: 14px; line-height: 1.2; font-family:  Tahoma, Verdana, Segoe, sans-serif; color: #008000; "><p style="font-size: 14px; line-height: 1.2; word-break: break-word; text-align: center; font-family: Roboto, Tahoma, Verdana, Segoe, sans-serif;  margin: 0;"><a href="https://winorball.com/legal" rel="noopener" style="text-decoration: none; color: #008000;" target="_blank"><strong><span style="font-size: 16px;">Legal Notice</span></strong></a></p></div></div></div></div></div></div></div></div></td></tr></tbody></table></body>'


                    var mailOptions = {
                        from: 'admin@winorball.com', // sender address
                        to: doc.email, // list of receivers
                        subject: 'Welcome, winorball!', // Subject line
                        // text: 'Hello world ?', // plaintext body
                        html: emailString // html body
                    };


                    transporter.sendMail(mailOptions, function (error, info) {
                        console.log('test email sent:', info)
                        if (error) {
                            return console.log(error);
                        }
                        console.log('Message sent: ' + info.response);
                    });

                    return res.status(200).send(doc);
                }).catch((e) => {
                    console.log(e);
                    return res.status(200).send(result);
                })

            }
        });
    })
})

// get the block users
router.route('/blockusers/:id').get((req, res, next) => {
    Blockuser.findOne({ 'userId': req.params.id }).then((doc) => {
        console.log("..finding the block user is ok...");
        console.log(doc);
        return res.status(200).send(doc);
    }).catch((e) => {
        console.log("...the blockuser table connection is error...");
        console.log(e);
        return res.status(200).send(null);
    })

});



module.exports = router;