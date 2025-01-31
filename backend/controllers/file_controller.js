import File from '../models/file.js';
import User from '../models/user.js';

export const createFile = async (req, res) => {
  try {
    const { name, content, language, roomId } = req.body;
    
    // Check if file with this name already exists in the room
    const existingFile = await File.findOne({ name, roomId });
    if (existingFile) {
      // Update existing file
      existingFile.content = content;
      existingFile.language = language;
      await existingFile.save();
      return res.status(200).json({ success: true, file: existingFile });
    }

    const file = new File({
      name,
      content,
      language,
      roomId,
      createdBy: req.userId
    });

    await file.save();
    
    const populatedFile = await File.findById(file._id).populate('createdBy', 'username');
    res.status(201).json({ success: true, file: populatedFile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoomFiles = async (req, res) => {
  try {
    const { roomId } = req.params;
    const files = await File.find({ roomId })
      .populate('createdBy', 'username')
      .sort({ updatedAt: -1 });
    res.status(200).json({ success: true, files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId).populate('createdBy', 'username');
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    res.status(200).json({ success: true, file });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);
    
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Only creator can delete the file
    if (file.createdBy.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await File.findByIdAndDelete(fileId);
    res.status(200).json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 