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

  const response = await User.verifyPassword(password);
  if (response) { // password ok
    return done(null, user); // user
  }
  return done(null, false); // password ko
}));

async function register(username, email, password) {
  const existingUser = await User.findOne({email});
  if (existingUser) {
    return console.log(`This email(${email}) is already by another account.`);
  }

  const user = new User({
    username,
    email
  });

  await user.hashPassword(password);
  await user.save();

  const token = user.generateJWT();
  return token;
}

function login(email, password) {
  // NOTE
  // passport.authenticate does not support promisify
  // you have to pass req, res to this method
  passport.authenticate('local',
    {successRedirect: '/', failureRedirect: '/login'}, (error, user) => {
    if (error) {
      console.log(error)
    }

    if (!user) {
      console.log(`utilisateur (${username}) non trouvé / mauvais mot de passe.`);
    }

    const token = generateJWT(user);
    return token;
  })(req, res);
}

async function unregister(email, password) {
  const user = await User.findOne({email});
  const validated = await user.verifyPassword(password);
  if (validated) { // password ok
    await user.remove(); // remove user
    return 'user deleted succefully';
  }
  console.log(`wrong password`);
}

module.exports = {
  register,
  login,
  unregister
};
