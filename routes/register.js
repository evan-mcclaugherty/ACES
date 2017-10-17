const user = require('../models/user');
const path = require('path');
const fs = require('fs');
let tinify = require('tinify');
tinify.key = process.env.TINIFY;

require('dotenv').config()
const {
    body,
    validationResult
} = require('express-validator/check');
const {
    sanitizeBody,
    matchedData,
} = require('express-validator/filter')

exports.form = (req, res) => {
    res.render('register', {
        title: "Register"
    });
}
exports.validate = [
    body('user[username]').exists().escape().trim(),

    body('user[name]').exists().escape().trim().matches(/\w+\s\w+/).withMessage("First and Last separated by a space."),

    body('user[password').exists().isLength({
        min: 5
    }).withMessage("Minimum of 5 characters").escape().custom((value, {
        req
    }) => value === req.body.user.password2).withMessage("Passwords must be more than 5 characters and match"),

    body('user[password2').exists().withMessage("Need to verify passwords").escape(),

    body('user[extension]').exists().isNumeric().withMessage("Must be a number").isLength({
        min: 4,
        max: 4
    }).escape().withMessage('Extension is your 4 digit office extension'),
];

exports.submit = (req, res, next) => {
    let fileName = req.file.originalname;
    let ext = fileName.match(/\.\w{3,3}/)[0];
    let photoName = req.body.user.username + ext;
    let publicPhotoPath = path.normalize(__dirname + '/../public/images/users/' + photoName);
    let optimize = new Promise((resolve, reject) => {
        let source = tinify.fromFile(req.file.path);
        let resized = source.resize({
            method: "scale",
            width: 300
        })
        resolve(resized.toFile(publicPhotoPath));
    });

    fs.unlink(req.file.path, (err) => {
        if (err) {
            next(err);
        }
    });

    const errors = validationResult(req).formatWith((error) => {
        return {
            param: error.param,
            msg: error.msg
        }
    });
    if (errors.isEmpty()) {
        let userInfo = req.body.user;
        userInfo.src = photoName;
        user.verify(userInfo.username, (err, result) => {
            if (result.length > 0) {
                res.locals.error("username already exists!");
                res.redirect('back');
            } else if (userInfo.secret !== process.env.SECRET) {
                res.locals.error("Hmmm looks like you don't belong here pal!")
                res.redirect('back');
            } else {
                user.create(userInfo, (err, result) => {
                    req.session.username = userInfo.username;
                    userInfo = {};
                    optimize.then(() => res.redirect('/'));
                });
            }
        })
    } else {
        console.log(req.body.user.name)
        let errs = errors.mapped();
        for (let key in errs) {
            let values = errs[key];
            res.locals.error(values.msg);
        }
        res.redirect('back');
    }
}