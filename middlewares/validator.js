function validateLogin(req, res, next) {
  req.checkBody('username', "Le nom d'utilisateur est vide.").notEmpty();
  req.checkBody('password', 'Le mot de passe est vide.').notEmpty()

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json({error: errors.map(err => err.msg)});
  }
  next();
}

function validateSync(req, res, next) {
  req.checkBody('serial', 'Le serial est manquant.').notEmpty();
  req.checkBody('user_secret', 'Le user_secret est manquant.').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json({error: errors.map(err => err.msg)});
  }
  next();
}

function validateAddConsumption(req, res, next) {
  req.checkBody('ocr_secret', "L'ocr_secret est manquant.").notEmpty();
  req.checkBody('serial', 'Le serial est manquant.').notEmpty();
  req.checkBody('value', 'La valeur de consommation est manquante.').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    return res.status(400).json({error: errors.map(err => err.msg)});
  }
  next();
}

module.exports = {
  validateLogin,
  validateSync,
  validateAddConsumption
}
