exports.form = (req, res) => {
    res.render('register', {
        title: "Register"
    });
}

exports.submit = (req, res, next) => {
    console.log(req.body.user)
    const data = req.body.user;
    res.json(data);

}


    // User.getByName(data.name, (err, user) => {
    //     if (err) {
    //         return next(err);
    //     } else if(user.id) {
    //         res.error('Username already taken');
    //         res.redirect('back');
    //     } else {
    //         user = new User({
    //             name: data.name,
    //             pass: data.pass
    //         });
    //         user.save((err) => {
    //             if (err) {
    //                 return next(err)
    //             } else {
    //                 req.session.uid = user.id;
    //                 res.redirect('/');
    //             }
    //         })
    //     }
    // });