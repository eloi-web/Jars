import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import User from '../models/User';

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
        },
        async (_accessToken, _refreshToken, profile: Profile, done) => {
            try {
                // Find existing user or create a new one — handles both login & register
                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    user = await User.create({
                        googleId: profile.id,
                        email: profile.emails?.[0]?.value ?? '',
                        name: profile.displayName,
                        avatar: profile.photos?.[0]?.value ?? '',
                    });
                }

                return done(null, user);
            } catch (err) {
                return done(err as Error);
            }
        }
    )
);

// Not using session-based auth (JWT only), but passport requires these
passport.serializeUser((user: any, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).select('-__v');
        done(null, user);
    } catch (err) {
        done(err);
    }
});

export default passport;
