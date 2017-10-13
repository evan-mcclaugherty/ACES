const user = require('../models/user');
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

    body('user[name]').exists().escape().trim().custom(value => value.match(/\w+\s\w+/)).withMessage("First and Last separated by a space."),

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

    body('user[photo]').exists().withMessage('Please upload a photo!')
];

exports.submit = (req, res, next) => {
    const errors = validationResult(req).formatWith((error) => {
        return {
            param: error.param,
            msg: error.msg
        }
    });
    if (errors.isEmpty()) {
        let userInfo = req.body.user;
        user.verify(userInfo.username, (err, result) => {
            if (result.length > 0) {
                res.locals.error("username already exists!");
                res.redirect('back');
            } else {
                user.create(userInfo, (err, result) => {
                    req.session.username = userInfo.username;
                    userInfo = {};
                    res.redirect('/');
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