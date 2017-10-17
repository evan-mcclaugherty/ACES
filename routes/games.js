const game = require('../models/game');
require('dotenv').config();
let tinify = require('tinify');
tinify.key = process.env.TINIFY;
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const util = require('util');

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
      return result._fields[0].properties;
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
    title: req.body.game.title
  }
  let publicPhotoPath = path.normalize(__dirname + '/../profile/' + fileName);
  let optimize = new Promise((resolve, reject) => {
    let source = tinify.fromFile(req.file.path);
    let resized = source.resize({
      method: "scale",
      width: 200
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
        optimize.then(() => {
          let type = mime.lookup(publicPhotoPath);
          fs.readFile(publicPhotoPath, (err, data) => {
            let photo = new Buffer(data).toString('base64');
            photo = util.format("data:%s;base64,%s", type, photo);
            gameInfo.src = photo;
            game.create(gameInfo, (err, result) => {
              res.redirect('/games')
            });
          });
          fs.unlink(publicPhotoPath, (err) => {
            if (err) {
              next(err);
            }
          });
        });
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