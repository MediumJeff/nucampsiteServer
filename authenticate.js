const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const config = require('./config');

const local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const getToken = user => {
    return jwt.sign(user, config.secretKey, { expiresIn: 3600 })
};

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

const jwtPassport = passport.use(
    new JwtStrategy(
        opts,
        (jwt_payload, done) => {
            console.log('JWT Payload: ', jwt_payload);
            User.findOne({ _id: jwt_payload._id }, (err, user) => {
                if (err) {
                    return done(err, false);
                } else if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            });
        }
    )
);

const verifyUser = passport.authenticate('jwt', { session: false });

const verifyAdmin = (req, res, next) => {
    console.log("Admin status: ", req.user.admin);
    if(req.user.admin) {
        return next();
    } else {
        const err = new Error("You are not authorized to perform this function!");
        err.status = 403;
        return next(err);
    }
};


module.exports = {
    local,
    getToken,
    opts,
    jwtPassport,
    verifyUser,
    verifyAdmin
}