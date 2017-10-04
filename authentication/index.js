const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: false,
  session: false
}, async (email, password, done) => {
  const user = await User.find({email});
  if (!user) return done(null, false); // no user

  const isValid = await User.verifyPassword(password);
  if (isValid) { // password ok
    return done(null, user); // user
  }
  return done(null, false); // password ko
}));

async function register({body: {username, email, password}}, res) {
  const existingUser = await User.findOne({email});
  if (existingUser) {
    return res.send(`This email(${email}) is already used by another account.`);
  }

  const user = new User({
    username,
    email
  });

  await user.hashPassword(password);
  await user.save();

  const token = user.generateJWT();
  res.json({token});
}

function login({body: {email, password}}, res) {
  // NOTE
  // passport.authenticate does not support promisify
  // you have to pass req, res to this method
  passport.authenticate('local',
    {successRedirect: '/', failureRedirect: '/login'}, (error, user) => {
    if (error) {
      res.send(error.toString())
    }

    if (!user) {
      res.send(`utilisateur (${username}) non trouvé / mauvais mot de passe.`);
    }

    const token = generateJWT(user);
    res.json({token});
  })(req, res);
}

async function unregister({body: {email, password}}, res) {
  const user = await User.findOne({email});
  const validated = await user.verifyPassword(password);
  if (validated) { // password ok
    await user.remove(); // remove user
    res.send('user deleted successfully');
  }
  res.send('wrong password');
}

module.exports = {
  register,
  login,
  unregister
};
