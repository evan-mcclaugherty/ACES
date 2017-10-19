const game = require('../models/gameModel');
const schema = require('../models/db').schema;
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

exports.winner = (req, res, next) => {
  let won = schema.relationship.Won;
  let lost = schema.relationship.Lost;
  let winner = req.body.winner;
  let losers = req.body.losers;
  losers = losers.split(',');
  let title = req.body.title;

  let promiseArr = losers.map(loser => {
    return new Promise((resolve, reject) => {
      game.addRelationship({
        username: loser,
        title,
        relationship: lost
      }).then(result => {
        let data = result.records[0]._fields;
        resolve({
          username: data[0],
          type: data[1].type,
          times: data[2].low
        })
      });
    });
  });
  promiseArr.push(
    new Promise((resolve, reject) => {
      game.addRelationship({
        username: winner,
        title,
        relationship: won
      }).then(result => {
        let data = result.records[0]._fields;
        resolve({
          username: data[0],
          type: data[1].type,
          times: data[2].low
        });
      });
    })
  )
  Promise.all(promiseArr)
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
}

exports.get = (req, res, next) => {
  game.getAllGames()
    .then(results => {
      results = results.map(result => {
        return result._fields[0].properties;
      });
      res.render('games', {
        games: results
      });
    })
    .catch(err => next(err));
}

exports.singleGame = (req, res, next) => {
  let promiseArr = [];
  promiseArr.push(
    new Promise((resolve, reject) => {
      game.singleGame(req.params.title)
        .then(records => {
          records = records.map(ea => {
            return ea.get('game').properties
          });
          resolve(records[0]);
        });
    })
  );
  promiseArr.push(
    new Promise((resolve, reject) => {
      game.singleGameWins(req.params.title)
        .then(records => {
          records = records.map(ea => {
            return {
              username: ea.get('username'),
              wins: ea.get('wins').low
            }
          });
          console.log(records);
          resolve(records);
        });
    })
  );
  Promise.all(promiseArr)
    .then(results => {
      res.render('singleGame', {
        game: results[0],
        winners: results[1]
      });
    })
    .catch(err => {
      next(err);
    })
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

exports.addLike = function (req, res, next) {
  let obj = {
    username: req.session.username,
    title: req.params.title,
    relationship: schema.relationship.Likes
  }
  game.addRelationship(obj)
    .then(result => {
      res.redirect('back');
    })
    .catch(error => {
      next(error);
    });
}

exports.removeLike = function (req, res, next) {
  let obj = {
    username: req.session.username,
    title: req.params.title,
    relationship: schema.relationship.Likes
  }
  game.deleteRelationship(obj)
    .then(result => {
      res.redirect('back');
    })
    .catch(error => {
      next(error);
    });
}
exports.validate = [
  body('game[title]').exists().escape().trim().matches(/[\w ]/g).withMessage("Only letters and spaces please."),
];