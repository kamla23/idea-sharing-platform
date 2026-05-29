import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

import {
  validateSignup,
  validateLogin
} from "../validations/auth.validation.js";

export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const error = validateSignup(username, email, password);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
   
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const user = await User.create({
      username,
      email,
      passwordHash,
    });

    res.status(201).json({
      message: "User signed up successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const error = validateLogin(email, password);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
   
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
   
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

   
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false, 
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, 
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getMe = async (req, res) => {
  try {
   
    const user = await User.findById(req.user.id).select("-passwordHash");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({
      username: user.username,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔥 Naya logout function aapke controller ke format mein
export const logout = async (req, res) => {
  try {
    // 1. Dono cookies (accessToken aur refreshToken) ko clear karna hoga
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Deployed par automatic true ho jayega
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.status(200).json({ 
      success: true, 
      message: "Logged out successfully!" 
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};