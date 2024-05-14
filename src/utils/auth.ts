/* eslint-disable camelcase */
import passport from 'passport';
import { Strategy } from "passport-google-oauth20";
import { User } from '../entities/User';
import { getRepository } from 'typeorm';
import bcrypt from 'bcrypt';

passport.use(
    new Strategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            callbackURL: 'http://localhost:6890/user/auth/google/callback/',
            scope: ['email', 'profile'],
        },
        async (accessToken: any, refreshToken: any, profile: any, cb: any) => {
            console.log("---------------------------");
            console.log(profile);
            console.log("---------------------------");
            const userRepository = getRepository(User);
            const { family_name,
                name,
                picture,
                email,
                email_verified

            } = profile._json;
            const { familyName, givenName } = profile.name;

            if (email || givenName || family_name || picture) {
                try {
                    // Check for existing user
                    const existingUser = await userRepository.findOneBy({ email });

                    if (existingUser) {
                        return await cb(null, existingUser);
                    }
                    const saltRounds = 10;
                    const hashedPassword = await bcrypt.hash("password", saltRounds);
                    const newUser = new User();
                    newUser.firstName = givenName;
                    newUser.lastName = family_name ?? familyName ?? "undefined";
                    newUser.email = email;
                    newUser.userType = 'Buyer';
                    newUser.photoUrl = picture;
                    newUser.gender = "Not specified";
                    newUser.phoneNumber = "Not specified";
                    newUser.password = hashedPassword;
                    newUser.verified = email_verified;

                    await userRepository.save(newUser);
                    return await cb(null, newUser);
                } catch (error) {
                    console.error(error);
                    return await cb(error, null);
                }
            }
            return await cb(null, profile, { message: 'Missing required profile information' });
        }
    )
);

passport.serializeUser((user: any, cb) => {
    cb(null, user.id);
});

passport.deserializeUser(async (id: any, cb) => {
    const userRepository = getRepository(User);
    try {
        const user = await userRepository.findOneBy({id});
        cb(null, user);
    } catch (error) {
        cb(error);
    }
});
