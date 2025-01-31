import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Box,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import axios from 'axios';
import Particles from './styles/particles.jsx';

const FileSidebar = ({ roomId, onFileSelect, currentLanguage }) => {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, fileId: null });
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/files/room/${roomId}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      setFiles(response.data.files);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchFiles();
      const interval = setInterval(fetchFiles, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [open, roomId]);

  const handleDelete = async (fileId) => {
    try {
      await axios.delete(`http://localhost:5000/api/files/${fileId}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      fetchFiles();
      setDeleteConfirm({ open: false, fileId: null });
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          right: 30,
          top: 80,
          color: '#00ff95',
          backgroundColor: 'rgba(15, 15, 26, 0.95)',
          border: '1px solid rgba(0, 255, 149, 0.2)',
          '&:hover': {
            backgroundColor: 'rgba(0, 255, 149, 0.1)',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.3s ease',
          zIndex: 1200,
          
        }}
      >
        <Tooltip title="Room Files" placement="left">
          <FolderOpenIcon />
        </Tooltip>
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: 320,
            backgroundColor: 'rgba(15, 15, 26, 0.98)',
            backdropFilter: 'blur(10px)',
            borderLeft: '1px solid rgba(0, 255, 149, 0.2)',
            overflow: 'hidden',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0, 0, 0, 0.1)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0, 255, 149, 0.2)',
              borderRadius: '4px',
              '&:hover': {
                background: 'rgba(0, 255, 149, 0.3)',
              },
            },
          }
        }}
      >
        <Particles />
        <Box sx={{ 
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ 
            p: 2.5, 
            borderBottom: '1px solid rgba(0, 255, 149, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Typography variant="h6" sx={{ color: '#00ff95', fontWeight: 500 }}>
              Room Files
            </Typography>
          </Box>

          {files.length === 0 ? (
            <Box sx={{
              p: 3,
              textAlign: 'center',
              color: 'rgba(0, 255, 149, 0.7)',
              fontSize: '0.9rem'
            }}>
              No files exist yet in the room
            </Box>
          ) : (
            <List sx={{ p: 1 }}>
              {files.map((file) => (
                <ListItem
                  key={file._id}
                  sx={{
                    mb: 1,
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 255, 149, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 255, 149, 0.05)',
                      border: '1px solid rgba(0, 255, 149, 0.2)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ListItemText
                    primary={file.name}
                    secondary={`Created by ${file.createdBy.username}`}
                    sx={{
                      cursor: 'pointer',
                      '& .MuiListItemText-primary': { 
                        color: '#00ff95',
                        fontWeight: 500,
                        fontSize: '0.95rem'
                      },
                      '& .MuiListItemText-secondary': { 
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.8rem'
                      }
                    }}
                    onClick={() => onFileSelect(file)}
                  />
                  {file.createdBy._id === currentUser.user.id && (
                    <Tooltip title="Delete File">
                      <IconButton
                        onClick={() => setDeleteConfirm({ open: true, fileId: file._id })}
                        sx={{ 
                          color: '#00ff95',
                          opacity: 0.7,
                          '&:hover': {
                            opacity: 1,
                            backgroundColor: 'rgba(0, 255, 149, 0.1)'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Drawer>

      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, fileId: null })}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(15, 15, 26, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 255, 149, 0.2)',
          }
        }}
      >
        <DialogTitle sx={{ color: '#00ff95' }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#fff' }}>
            Are you sure you want to delete this file?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirm({ open: false, fileId: null })}
            sx={{ color: '#00ff95' }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDelete(deleteConfirm.fileId)}
            sx={{ color: '#00ff95' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FileSidebar; 