import Room from '../models/room.js';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/user.js';
import pusher from '../pusher.js';
import mongoose from 'mongoose';

// Create a new room
export const createRoom = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if room with this name already exists
    const existingRoom = await Room.findOne({ name: name });
    if (existingRoom) {
      return res.status(400).json({ 
        success: false, 
        message: 'A room with this name already exists' 
      });
    }

    const roomId = uuidv4();
    
    const room = new Room({
      name,
      roomId,
      createdBy: req.userId
    });

    await room.save();
    res.status(201).json({ 
      success: true, 
      room: {
        ...room.toObject(),
        roomId: room.roomId
      } 
    });
  } catch (error) {
    // Check if error is a MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'A room with this name already exists' 
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Join a room
export const joinRoom = async (req, res) => {
  try {
    // First, update room's users array
    const room = await Room.findOneAndUpdate(
      { roomId: req.params.roomId },
      { $addToSet: { users: new mongoose.Types.ObjectId(req.userId) } },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Then, update user's room history in two separate steps
    // 1. First remove the room if it exists
    await User.findByIdAndUpdate(
      req.userId,
      { $pull: { rooms: room.roomId } }
    );

    // 2. Then add it to the end and maintain the 5 room limit
    await User.findByIdAndUpdate(
      req.userId,
      { 
        $push: { 
          rooms: { 
            $each: [room.roomId],
            $slice: -5 
          }
        }
      },
      { new: true }
    );

    res.status(200).json({ success: true, message: 'Joined room successfully' });
  } catch (error) {
    console.error('Error in joinRoom:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all rooms
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('createdBy', 'username');
    res.status(200).json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a room
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findOneAndDelete({ roomId: req.params.roomId });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.status(200).json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add this function to the existing room_controller.js
export const getUserRooms = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get unique roomIds (remove duplicates)
    const uniqueRoomIds = [...new Set(user.rooms)];
    
    // Get the last 5 rooms
    const recentRoomIds = uniqueRoomIds.slice(-5);

    // Fetch room details for recent rooms
    const rooms = await Promise.all(
      recentRoomIds.map(roomId => 
        Room.findOne({ roomId }).populate('createdBy', 'username')
      )
    );

    // Filter out any null values and reverse to show newest first
    const validRooms = rooms
      .filter(room => room !== null)
      .reverse();

    res.status(200).json({ success: true, rooms: validRooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoomUsers = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .populate('users', 'username _id');
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    // Filter out any null or undefined users and ensure uniqueness
    const validUsers = room.users.filter(user => user && user._id);
    const uniqueUsers = Array.from(
      new Map(validUsers.map(user => [user._id.toString(), user])).values()
    );
    
    // Sort users to put current user at top
    const sortedUsers = uniqueUsers.sort((a, b) => {
      if (a._id.toString() === req.userId) return -1;
      if (b._id.toString() === req.userId) return 1;
      return 0;
    });
    
    res.status(200).json({ 
      success: true, 
      users: sortedUsers
    });
  } catch (error) {
    console.error('Error in getRoomUsers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const leaveRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Remove user from room's active users array using ObjectId comparison
    room.users = room.users.filter(userId => 
      userId.toString() !== req.userId
    );
    
    await room.save();
    res.status(200).json({ success: true, message: 'Left room successfully' });
  } catch (error) {
    console.error('Error in leaveRoom:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoomDetails = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .populate('createdBy', 'username');
    
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    res.status(200).json({ 
      success: true, 
      room: {
        name: room.name,
        roomId: room.roomId,
        createdBy: room.createdBy
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRoomCode = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { code, userId } = req.body;
    
    if (!code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Code is required' 
      });
    }

    // Verify Pusher configuration
    if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || 
        !process.env.PUSHER_SECRET || !process.env.PUSHER_CLUSTER) {
      console.error('Missing Pusher configuration:', {
        appId: !!process.env.PUSHER_APP_ID,
        key: !!process.env.PUSHER_KEY,
        secret: !!process.env.PUSHER_SECRET,
        cluster: !!process.env.PUSHER_CLUSTER
      });
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const channelName = `room-${roomId}`;
    const eventName = 'code-update';
    const eventData = {
      code,
      userId,
      timestamp: new Date().toISOString()
    };

    console.log('Triggering Pusher event:', {
      channelName,
      eventName,
      userId,
      codeLength: code.length
    });

    await pusher.trigger(channelName, eventName, eventData);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in updateRoomCode:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error',
      error: error.toString(),
      stack: error.stack
    });
  }
};

export const updateLanguage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { language, userId } = req.body;
    
    const channelName = `room-${roomId}`;
    await pusher.trigger(channelName, 'language-update', {
      language,
      userId,
      timestamp: new Date().toISOString()
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in updateLanguage:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTerminals = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { input, output, isLoading, userId } = req.body;
    
    const channelName = `room-${roomId}`;
    await pusher.trigger(channelName, 'terminals-update', {
      input,
      output,
      isLoading,
      userId,
      timestamp: new Date().toISOString()
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in updateTerminals:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFileSelection = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { file, userId } = req.body;
    
    // Get the user's username
    const user = await User.findById(userId).select('username');
    
    const channelName = `room-${roomId}`;
    await pusher.trigger(channelName, 'file-selection', {
      file,
      userId,
      username: user.username,
      timestamp: new Date().toISOString()
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in updateFileSelection:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCursor = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { position, userId } = req.body;
    
    const user = await User.findById(userId).select('username');
    
    const channelName = `room-${roomId}`;
    await pusher.trigger(channelName, 'cursor-update', {
      position,
      userId,
      username: user.username,
      timestamp: new Date().toISOString()
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in updateCursor:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
