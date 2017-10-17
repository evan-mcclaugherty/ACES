const game = require('../models/game');
require('dotenv').config();
let tinify = require('tinify');
tinify.key = process.env.TINIFY;
const fs = require('fs');
const path = require('path');

const {
  body,
  validationResult
} = require('express-validator/check');
const {
  sanitizeBody,
  matchedData,
} = require('express-validator/filter')

exports.get = (req, res, next) => {
  game.getAll((err, results) => {
    results = results.map(result => {
      return result.n.properties;
    })
    res.render('games', {
      games: results
    });
  });
}

exports.getaddGame = (req, res, next) => {
  res.render('addGame');
}

exports.postAddGame = (req, res, next) => {
  let fileName = req.file.originalname;
  let gameInfo = {
    title: req.body.game.title,
    src: fileName
  }
  let publicPhotoPath = path.normalize(__dirname + '/../public/images/games/' + fileName);
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
    game.lookup(gameInfo.title, (err, result) => {
      if (result.length === 0) {
        game.create(gameInfo, (err, result) => {
          optimize.then(() => res.redirect('/games'));
        })
      } else {
        res.locals.error("Game title already exists.")
        res.redirect('back');
      }
    });
  } else {
    let errs = errors.mapped();
    for (let key in errs) {
      let values = errs[key];
      res.locals.error(values.msg);
    }
    res.redirect('back');
  }
}

exports.validate = [
  body('game[title]').exists().escape().trim().matches(/[\w ]/g).withMessage("Only letters and spaces please."),
];