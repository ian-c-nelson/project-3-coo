import passport from "passport";
import LocalStrategy from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

import User from "../models/User";
import config from "../config";

// Setup options for Local Strategy
const localOptions = {
  usernameField: "email"
};

// Create Local Strategy
const localLogin = new LocalStrategy(localOptions, (email, password, done) => {
  // Verify email and password
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return done(null, false);
      }
      user.isValidPassword(password, (err, isMatch) => {
        if (err) {
          return done(err);
        }

        // Otherwise call with false
        if (!isMatch) {
          return done(null, false);
        }

        // Call done with correct email and password
        return done(null, user);
      });
    })
    .catch(err => done(err));
});

// Setup options for JWT Strategy
const jwtOptions = {
  // extract the jwt token we created from the header
  jwtFromRequest: ExtractJwt.fromHeader("authorization"),
  // pass in the jwt secret to decode the token
  secretOrKey: config.secret
};

// Create JWT Strategy
const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  // See if the user exist in the DB
  User.findById(payload.sub)
    .then((user) => {
      // If the user exists, call the done function with that user
      if (user) {
        done(null, user);
      } else {
        // If not call the done function without a user object
        done(null, false);
      }
    })
    // if there is an error call the done function with the err and no user
    .catch(err => done(err, false));
});

// Tell Passport to use this strategy
passport.use(jwtLogin);
passport.use(localLogin);
