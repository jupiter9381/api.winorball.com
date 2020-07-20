var User = require('../models/User');
var UserInfo = require('../models/Userinfo');
var moment = require('moment');
var Dispute = require('../models/dispute');
var ChatRoom = require('../models/ChatRooms');
var Answer = require('../models/answer');
exports.getUser = async function (req, res, next) {
    allUsers = [];
    await User.find({}).then((doc) => {
        // console.log(doc);
        if (doc) {
            doc.forEach(docc => {
                docc.res_day = moment(parseInt(docc.res_day)).format('MM-DD-YYYY');
            });
        }
        allUsers = doc;
    })
    return res.status(200).json(allUsers);
}

// delete the user
exports.lockUser = async function (req, res, next) {
    let userId = req.body.id;
    try {
        let user = await User.findOne({ _id: userId });
        if (user.state == 2) {
            user.state = 1;
            user.save();
        } else if (user.state == 1) {
            user.state = 2;
            user.save();
        }
        res.status(200).json({ message: 'Success updated!' });
    } catch (error) {
        res.status(400).json({ message: error });
        console.log(e);
    }
}

// exports.blockUser = function(req, res, next) {
//     let userId = req.body.id;
//     User.findOneAndDelete({ _id: userId}).then((user) => {
//         return res.status(200).json({message: 'successfully deleted!'});
//     }).catch(error => {
//         return status(400).json({message : error});
//     });
// }

// get online uses
exports.getOnlineUser = async function (req, res, next) {
    console.log('hello');
    let onlineUsers = await UserInfo.find({ currentState: 1 }).populate('userId');
    console.log('*********************', onlineUsers);
    let resOnline = [];
    let temp = [];
    if (onlineUsers) {
        onlineUsers.map(function (onlineUser) {
            temp.push({
                id: onlineUser.userId._id,
                name: onlineUser.userId.name,
                pseduo: onlineUser.userId.pseduo,
                email: onlineUser.userId.email,
                state: onlineUser.userId.state,
                img_state: onlineUser.userId.img_state
            })
        })
        resOnline = temp;
        console.log(resOnline);
        return res.status(200).json(resOnline);
    } else {
        return res.status(200).json({ message: 'Empty!' });
    }
}

// get block users
exports.getBlockUser = async function (req, res, next) {
    let resBlock = [];
    let temp = [];
    let blockUsers = await User.find({ img_state: 0 });
    blockUsers.map(function (blockUser) {
        temp.push({
            id: blockUser._id,
            name: blockUser.name,
            pseduo: blockUser.pseduo,
            email: blockUser.email,
            state: blockUser.state,
            img_state: blockUser.img_state
        })
    })
    resBlock = temp;
    console.log(resBlock);
    return res.status(200).json(resBlock);
}

// get block users
exports.getLockUser = async function (req, res, next) {
    let resLock = [];
    let temp = [];
    let lockUsers = await User.find({ state: 2 });
    console.log(lockUsers);
    lockUsers.map(function (lockUser) {
        temp.push({
            id: lockUser._id,
            name: lockUser.name,
            pseduo: lockUser.pseduo,
            email: lockUser.email,
            state: lockUser.state,
            img_state: lockUser.img_state
        })
    })
    resLock = temp;
    console.log(resLock);
    return res.status(200).json(resLock);
}

// blocking the user
exports.blockUser = async function (req, res, next) {
    let userId = req.body.id;
    try {
        let user = await User.findOne({ _id: userId });
        if (user.img_state == 1) {
            user.img_state = 0;
            user.save();
        } else if (user.img_state == 0) {
            user.img_state = 1;
            user.save();
        }
        res.status(200).json({ message: 'Success updated!' });
    } catch (error) {
        res.status(400).json({ message: error });
    }
}

exports.dispute = async function (req, res, next) {
    try {
        let disputes = await Dispute.find({ count: { $gte: 6 } }).populate('user');
        console.log('********dispute*********', disputes);
        let tempRes = [];
        disputes.map(function (dispute) {
            let response = {
                id: dispute._id,
                userId: dispute.user._id,
                username: dispute.user.pseduo,
                useremail: dispute.user.email,
                img_state: dispute.user.img_state,
                state: dispute.user.state,
                message: dispute.message,
                count: dispute.count,
            }
            tempRes.push(response);
        })
        let responses = tempRes;
        console.log('*****responses*****', responses);
        return res.status(200).json(responses);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error });
    }
}

exports.deleteDispute = (req, res, next) => {
    const id = req.body.id;
    console.log(id);
    Dispute.findOneAndDelete({ _id: id }).then(
        (dispute) => {
            if (dispute) {
                res.status(200).json({ message: 'success' });
            }
        }
    ).catch((error) => {
        res.status(400).json({ error: error })
    })
}

exports.getAllPosts = (req, res, next) => {
    ChatRoom.find({}).then((posts) => {
        if (posts) {
            return res.status(200).json(posts);
        } else {
            return res.status(200).json({ message: 'empty' });
        }
    }).catch((error) => {
        return res.status(400).json({ error: error });
    })
}

exports.getAllPrivates = (req, res, next) => {
    Answer.find({}).populate('owner').populate('client').then((answers) => {
        if (answers) {
            console.log('***********answers', answers);
            return res.status(200).json(answers);
        } else {
            return res.status.json({ message: 'empty' });
        }
    }).catch((error) => {
        return res.status(400).json({ error: error });
    })
}