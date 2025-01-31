import Message from '../models/message.js';
import pusher from '../pusher.js';
import User from '../models/user.js';

export const createMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const { roomId } = req.params;

    const message = new Message({
      content,
      roomId,
      userId: req.userId
    });

    await message.save();

    // Get user details
    const user = await User.findById(req.userId);
    
    // Broadcast message via Pusher
    await pusher.trigger(`room-${roomId}-chat`, 'new-message', {
      content,
      userId: req.userId,
      username: user.username,
      timestamp: message.createdAt
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId })
      .populate('userId', 'username')
      .sort({ createdAt: 1 })
      .limit(100);

    const formattedMessages = messages.map(msg => ({
      content: msg.content,
      userId: msg.userId._id,
      username: msg.userId.username,
      timestamp: msg.createdAt
    }));

    res.status(200).json({ success: true, messages: formattedMessages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 