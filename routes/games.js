const game = require('../models/game');

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
  const errors = validationResult(req).formatWith((error) => {
    return {
      param: error.param,
      msg: error.msg
    }
  });
  if (errors.isEmpty()) {
    let gameInfo = req.body.game;
    game.lookup(gameInfo.title, (err, result) => {
      if (result.length === 0) {
        game.create(gameInfo, (err, result) => {
          res.redirect('/games');
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