import React, { useState, useEffect } from 'react';
import { useNavigate, useBeforeUnload } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Button,
  Chip
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Particles from './styles/particles.jsx';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://codehiveng.vercel.app'
  : 'http://localhost:5000';

const Sidebar = ({ roomId }) => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/rooms/${roomId}/users`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      
      if (response.data.success) {
        const uniqueUsers = Array.from(
          new Map(response.data.users.map(user => [user._id, user])).values()
        ).sort((a, b) => {
          if (a._id === currentUser.user.id) return -1;
          if (b._id === currentUser.user.id) return 1;
          return 0;
        });
        
        setUsers(uniqueUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 404) {
        navigate('/');
      }
    }
  };

  // Handle page unload
  useBeforeUnload(
    React.useCallback(() => {
      localStorage.setItem('lastRoomId', roomId);
    }, [roomId])
  );

  // Handle component mount and cleanup
  useEffect(() => {
    const lastRoomId = localStorage.getItem('lastRoomId');
    
    const joinRoom = async () => {
      try {
        await axios.post(`${API_URL}/api/rooms/${roomId}/join`, {}, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`
          }
        });
        fetchUsers();
      } catch (error) {
        console.error('Error joining room:', error);
        navigate('/');
      }
    };

    // If we have a lastRoomId and it matches current roomId, we're returning to the room
    if (lastRoomId === roomId) {
      joinRoom();
    } else {
      // New room visit
      joinRoom();
      localStorage.setItem('lastRoomId', roomId);
    }

    const interval = setInterval(fetchUsers, 3000);

    // Cleanup function
    return () => {
      clearInterval(interval);
      // Only leave room if we're actually navigating away (not refreshing)
      if (document.visibilityState === 'hidden') {
        axios.post(`${API_URL}/api/rooms/${roomId}/leave`, {}, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`
          }
        }).catch(error => console.error('Error leaving room:', error));
        localStorage.removeItem('lastRoomId');
      }
    };
  }, [roomId, currentUser.token, navigate]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        localStorage.removeItem('lastRoomId');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [roomId]);

  const leaveRoom = async () => {
    try {
      await axios.post(`${API_URL}/api/rooms/${roomId}/leave`, {}, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      localStorage.removeItem('lastRoomId');
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };

  // Handle browser/tab closing
  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      e.preventDefault();
      await leaveRoom();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [roomId]);

  // Handle navigation
  useEffect(() => {
    return () => {
      if (!window.location.pathname.includes('/editor/')) {
        leaveRoom();
      }
    };
  }, [roomId]);

  const handleLeaveRoom = async () => {
    await leaveRoom();
    navigate('/');
  };

  return (
    <Box sx={{ 
      width: 240,
      height: 'calc(100vh - 64px)',
      position: 'fixed',
      left: 0,
      top: 64,
      background: 'rgba(15, 15, 26, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRight: '1px solid rgba(0, 255, 149, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 1000
    }}>
      <Particles />
      <Box sx={{ 
        p: 2.5, 
        borderBottom: '1px solid rgba(0, 255, 149, 0.2)',
        position: 'relative',
        zIndex: 1
      }}>
        <Typography variant="h6" sx={{ color: '#00ff95', fontWeight: 500 }}>
          Room Users
        </Typography>
      </Box>

      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        position: 'relative',
        zIndex: 1
      }}>
        <List>
          {users.map((user) => (
            <ListItem 
              key={user._id} 
              sx={{ 
                pr: 2,
                backgroundColor: user._id === currentUser.user.id ? 
                  'rgba(0, 255, 149, 0.1)' : 'transparent'
              }}
            >
              <PersonIcon sx={{ color: '#00ff95', marginRight: 1, flexShrink: 0 }} />
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{user.username}</span>
                    {user._id === currentUser.user.id && (
                      <Chip 
                        label="You" 
                        size="small"
                        sx={{ 
                          backgroundColor: 'rgba(0, 255, 149, 0.2)',
                          color: '#00ff95',
                          height: '20px'
                        }}
                      />
                    )}
                  </Box>
                }
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  } 
                }} 
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ 
        padding: 2,
        borderTop: '1px solid rgba(0, 255, 149, 0.2)'
      }}>
        <Button
          fullWidth
          startIcon={<ExitToAppIcon />}
          onClick={handleLeaveRoom}
          sx={{
            color: '#00ff95',
            border: '1px solid rgba(0, 255, 149, 0.5)',
            '&:hover': {
              background: 'rgba(0, 255, 149, 0.1)',
            },
          }}
        >
          Leave Room
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;
