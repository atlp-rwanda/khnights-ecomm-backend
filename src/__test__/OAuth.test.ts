import { Strategy } from 'passport-google-oauth20';

// Define custom mocked functions for findOne and save
const mockFindOne = jest.fn();
const mockSave = jest.fn();

// Mock getRepository function to return a mock repository
jest.mock('typeorm', () => ({
}));

describe('Passport Authentication Strategy', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Reset mocks before each test
    });

    it('should authenticate user via Passport Google OAuth', async () => {
        // Simulate strategy callback with user profile
        const strategyCallback = jest.fn();
        const strategyInstance = new Strategy(
            {
                clientID: 'test_client_id',
                clientSecret: 'test_client_secret',
                callbackURL: 'http://localhost:6890/user/auth/google/callback/',
                scope: ['email', 'profile'],
            },
            strategyCallback
        );

        // Mock user profile data
        const userMockProfile = {
            _json: {
                family_name: 'Doe',
                name: 'John Doe',
                picture: 'https://example.com/picture.jpg',
                email: 'johndoe@example.com',
                email_verified: true,
            },
            name: { familyName: 'Doe', givenName: 'John' },
        };

        // Invoke the strategy callback with mock data
        await strategyCallback(null, null, userMockProfile, jest.fn());

        // Assertions
        expect(mockFindOne).toHaveBeenCalledTimes(1); // Check that findOne was called exactly once
        expect(mockFindOne).toHaveBeenCalledWith(expect.objectContaining({ where: { email: 'johndoe@example.com' } }));

        // Verify that save was called with the expected user object
        expect(mockSave).toHaveBeenCalledWith(
            expect.objectContaining({
                firstName: 'John',
                lastName: 'Doe',
                email: 'johndoe@example.com',
                userType: 'Buyer',
                photoUrl: 'https://example.com/picture.jpg',
                gender: 'Not specified',
                phoneNumber: 'Not specified',
                password: expect.any(String), // You can use expect.any to match any string value
                verified: true,
            })
        );

        // Optionally, test passport.serializeUser and passport.deserializeUser if needed
    });
});
