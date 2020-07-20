const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authorize = require("../middlewares/authjwt");

var Admin = require('../models/admin');


exports.register = async (req, res, next) => {
    try {
        const checkAdmin = await Admin.findOne({ email: req.body.email });
        if (!checkAdmin) {
            const adminData = new Admin({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                photoUrl: ''
            });
            let admin = await adminData.save();
            const token = await adminData.generateAuthToken(); // here it is calling the method that we created in the model
            res.status(201).json({ admin, token });
        } else {
            return res
                .status(200)
                .json({ message: "This email has already existed" });
        }
    } catch (err) {
        res.status(400).json({ err: err });
    }
};
exports.login = async (req, res, next) => {
    try {
        const admin = await Admin.findOne({ email: req.body.email });
        const admins = await Admin.find({});
        if (admin) {
            const val = await bcrypt.compare(req.body.password, admin.password);
            if (val) {
                const token = await admin.generateAuthToken();
                return res.status(201).json({ admin, token });
            } else {
                return res.status(400).json({ error: "Password is not matched" });
            }
        } else {
            return res.status(400).json({ error: "Email is not matched" });
        }
    } catch (error) {
        return res.status(400).json({ error: error });
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const data = req.header('Authorization');
        token = data.replace('Bearer ', '');
        console.log(token);

        const admin = await Admin.findOne({ token: token });
        console.log(admin);
        // const token = req.header;
        // console.log(token);
        return res.status(200).json(admin);
    } catch (error) {
        console.log(error);
        return res.status(304).json({ error: error });
    }
};

exports.updateUserImage = (req, res, next) => {
    console.log(req.body, req.header('Authorization'));
    const data = req.header('Authorization');
    token = data.replace('Bearer ', '');
    const filename = req.body.filename;
    Admin.findOneAndUpdate({ token: token }, { $set: { photoUrl: filename } })
        .then((user) => {
            return res.status(200).json({ success: true });
        }).catch((error) => {
            console.log(error);
            return res.status(400).json({ error: error });
        })
}
