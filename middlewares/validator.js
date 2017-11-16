function requireFields(...fields) {
  function wrapped(req, res, next) {
    for (let field of fields) {
      req.checkBody(field, field + " is missing.").notEmpty();
    }
    const errors = req.validationErrors();
    if (errors) {
      return res.status(400).json({error: errors.map(err => err.msg)});
    }
    next();
  }
  return wrapped;
}

function requireQuery(...queries) {
  function wrapped(req, res, next) {
    for (const query of queries) {
      req.checkQuery(query, `${query} is missing.`).notEmpty();
    }
    const errors = req.validationErrors();
    if (errors) {
      return res.status(400).json({error: errors.map(err => err.msg)});
    }
    next();
  }
  return wrapped;
}

module.exports = {
  requireFields,
  requireQuery
}
