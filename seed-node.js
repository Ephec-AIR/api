const seed = require('./seed');

seed()
  .then(_ => process.exit(0))
  .catch(err => console.error(err));
