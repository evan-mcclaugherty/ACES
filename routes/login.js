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
  res.render('login', {
    title: "Log In"
  });
}

exports.validate = [];

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
            if (result.length > 0) {
                res.locals.error("username already exists!");
                res.redirect('back');
            } else {
                user.create(userInfo, (err, result) => {
                    console.log(result);
                });
                req.session.uid = userInfo.username;
                res.redirect('/');
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