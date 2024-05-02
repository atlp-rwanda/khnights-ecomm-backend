import { Request, Response } from 'express';
import { initiateGoogleLogin } from '../controllers/google.auth';

describe('initiateGoogleLogin', () => {
  const req = {} as Request;
  const res = {
    redirect: jest.fn(),
  } as unknown as Response;
  const next = jest.fn();

  it('should redirect to Google OAuth with appropriate scope', () => {
    initiateGoogleLogin(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith(
      expect.stringContaining('google')
    );
    expect(res.redirect).toHaveBeenCalledWith(
      expect.stringContaining('profile')
    );
    expect(res.redirect).toHaveBeenCalledWith(
      expect.stringContaining('email')
    );
  });
});
