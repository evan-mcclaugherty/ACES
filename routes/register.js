const user = require('../models/user');

exports.form = (req, res) => {
    res.render('register', {
        title: "Register"
    });
}

exports.submit = (req, res, next) => {
    const userInfo = req.body.user;
    user.create(userInfo, (err, result) => {
        console.log(result);
    });
    res.json(userInfo);

}