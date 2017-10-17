const user = require('../models/user');
const debug = require('debug')('path');
const {
    body,
    validationResult
} = require('express-validator/check');
const {
    sanitizeBody,
    matchedData,
} = require('express-validator/filter')

exports.form = (req, res) => {
    res.render('login', {
        title: "Log In"
    });
}

exports.validate = [
    body('user[username]').exists().escape().trim().withMessage("username required"),
    body('user[password').exists().escape().withMessage('password required')
];

exports.submit = (req, res, next) => {
    const errors = validationResult(req).formatWith((error) => {
        return {
            param: error.param,
            msg: error.msg
        }
    });
    if (errors.isEmpty()) {
        const userInfo = req.body.user;
        user.verify(userInfo.username, (err, result) => {
            if (result.length === 1) {
                result = result[0]._fields[0].properties;
                user.authenticate(result.password, userInfo.password, result.salt, (err, isAuth) => {
                    if (isAuth) {
                        req.session.username = userInfo.username;
                        res.redirect('/');
                    } else {
                        res.locals.error("Password is incorrect");
                        res.redirect('back');
                    }
                })
            } else {
                res.locals.error("Either username doesn't exist or password is wrong!");
                res.redirect('back');
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
};

exports.logout = (req, res, next) => {
    req.session.username = null;
    res.redirect('/');
}