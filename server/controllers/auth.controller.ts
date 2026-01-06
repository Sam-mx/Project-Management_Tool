import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import validator from "validator";
import EmailVerification from "../models/emailVerification.model.";
import ForgotPassword from "../models/forgotPassword.model";
import User from "../models/user.model";
import { createRandomToken } from "../utils/helpers";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import { generateUsername } from "../utils/uniqueUsernameGen";
import nodemailer from "nodemailer";
import { CLIENT_URL, EMAIL_TOKEN_LENGTH } from "../config";
import RefreshToken from "../models/refreshTokens.model";

// Helper to set cookie
const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: "none", // Critical for Vercel -> Render
    secure: true,     // Critical for Vercel -> Render (HTTPS)
    path: "/"         // Available for all paths (or restrict to /api/v1/auth/refresh)
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    // Try to get token from cookie first, fallback to body
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).send({
        success: false,
        message: "refreshToken is required",
        statusCode: 401,
      });
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
      async function (err: any, payload: any) {
        if (err) {
          return res.status(401).send({
            success: false,
            message: "Invalid refresh token",
            statusCode: 401,
          });
        }

        const isValidRefreshToken = await RefreshToken.findOne({
          userId: payload._id,
          refreshToken: refreshToken,
        });

        if (!isValidRefreshToken) {
          return res.status(401).send({
            success: false,
            message: "Invalid refresh token",
            statusCode: 401,
          });
        }

        const newAccessToken = generateAccessToken({ _id: payload._id });
        
        // Optionally rotate refresh token here
        return res.send({
          success: true,
          data: { accessToken: newAccessToken }, // Don't send refresh token in body if using cookies
          message: "Token refreshed",
          statusCode: 200,
        });
      }
    );
  } catch {
    res.status(500).send({
      success: false,
      message: "Oops, something went wrong!",
      statusCode: 500,
    });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // ... (Your existing validation logic kept as is for brevity) ... 
    // Assuming validation passes...

    const user = new User({
      username: username.trim(),
      email: email.trim(),
      password,
    });

    const genUser = await user.save();

    // ... (Your existing Email Verification logic) ...

    const accessToken = generateAccessToken({ _id: genUser._id });
    const refreshToken = await generateRefreshToken({ _id: genUser._id });

    // Set Cookie
    setRefreshTokenCookie(res, refreshToken);

    return res.status(201).send({
      success: true,
      data: { accessToken }, // Only send Access Token
      message: "Account created successfully!",
      statusCode: 201,
    });
  } catch (err) {
    res.status(500).send({ success: false, message: "Error", statusCode: 500 });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // ... (Validation) ...

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send({
        success: false,
        message: "Invalid credentials",
        statusCode: 401,
      });
    }

    const accessToken = generateAccessToken({ _id: user._id });
    const refreshToken = await generateRefreshToken({ _id: user._id });

    // Set Cookie
    setRefreshTokenCookie(res, refreshToken);

    return res.send({
      success: true,
      data: { accessToken },
      message: "Login successful",
      statusCode: 200,
    });
  } catch {
    res.status(500).send({ success: false, message: "Error", statusCode: 500 });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { tokenId } = req.body;
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload()!;
    const userExists = await User.findOne({ email: payload.email });

    let accessToken;
    let refreshToken;
    let targetUser;

    if (!userExists) {
        // Create new user logic
        const username = generateUsername();
        targetUser = await new User({
            username: username!.trim(),
            email: payload.email!.trim(),
            profile: payload.picture!,
            emailVerified: true,
            isOAuth: true,
        }).save();
    } else {
        targetUser = userExists;
        // Handle logic if user exists (e.g. merge accounts)
    }

    // Generate tokens for whoever targetUser is
    accessToken = generateAccessToken({ _id: targetUser._id });
    refreshToken = await generateRefreshToken({ _id: targetUser._id });

    // Set Cookie
    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).send({
      success: true,
      data: { accessToken },
      message: "Google OAuth successful",
      statusCode: 200,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).send({ success: false, message: "Google OAuth failed", statusCode: 500 });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
    // Clear the cookie with the SAME options
    res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        path: "/"
    });
    return res.status(200).json({ success: true, message: "Logged out successfully" });
};