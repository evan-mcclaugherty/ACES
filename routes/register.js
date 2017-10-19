const user = require('../models/userModel');
const path = require('path');
const fs = require('fs');
let tinify = require('tinify');
tinify.key = process.env.TINIFY;
const mime = require('mime-types');
const util = require('util');

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
    let profilePath = path.normalize(__dirname + '/../profile/' + photoName);
    let optimize = new Promise((resolve, reject) => {
        let source = tinify.fromFile(req.file.path);
        let resized = source.resize({
            method: "scale",
            width: 200
        })
        resolve(resized.toFile(profilePath));
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
        user.verify(userInfo.username, (err, result) => {
            if (result.length === 1) {
                res.locals.error("username already exists!");
                res.redirect('back');
            } else if (userInfo.secret !== process.env.SECRET) {
                res.locals.error("Hmmm looks like you don't belong here pal!")
                res.redirect('back');
            } else {
                optimize.then(() => {
                    let type = mime.lookup(profilePath);
                    fs.readFile(profilePath, (err, data) => {
                        let photo = new Buffer(data).toString('base64');
                        photo = util.format("data:%s;base64,%s", type, photo);
                        userInfo.src = photo;
                        user.create(userInfo, (err, result) => {
                            req.session.username = userInfo.username;
                            userInfo = {};
                            res.redirect('/');
                        });
                        fs.unlink(profilePath, (err) => {
                            if (err) {
                                next(err);
                            }
                        });
                    });

                });
            }
        })
    } else {
        let errs = errors.mapped();
        for (let key in errs) {
            let values = errs[key];
            res.locals.error(values.msg);
        }
        res.redirect('back');
    }
}