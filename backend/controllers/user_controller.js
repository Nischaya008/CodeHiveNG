import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
  try {
    console.log('Signup request received:', req.body);
    
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: "Missing required fields",
        received: { username: !!username, email: !!email, password: !!password }
      });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      rooms: []
    });

    await user.save();
    
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        rooms: user.rooms
      }, 
      token 
    });
  } catch (error) {
    console.error('Signup error details:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    res.status(500).json({ 
      message: "Server error during signup",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const signin = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    
    // Find user by either email or username
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        rooms: user.rooms
      }, 
      token 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
