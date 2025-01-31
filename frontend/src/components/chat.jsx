import React, { useState, useEffect, useRef } from 'react';
import {
  Drawer,
  IconButton,
  Typography,
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Avatar,
  Badge
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import Pusher from 'pusher-js';
import Particles from './styles/particles.jsx';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://codehiveng.vercel.app'
  : 'http://localhost:5000';

const Chat = ({ roomId }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [channel, setChannel] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // Initialize Pusher channel
    const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
      cluster: process.env.REACT_APP_PUSHER_CLUSTER,
      forceTLS: true
    });
    
    const chatChannel = pusher.subscribe(`room-${roomId}-chat`);
    setChannel(chatChannel);

    chatChannel.bind('new-message', (data) => {
      setMessages(prev => [...prev, data]);
      if (!open && data.userId !== currentUser.user.id) {
        setUnreadCount(prev => prev + 1);
        showFloatingMessage(data);
      }
    });

    // Fetch existing messages
    fetchMessages();

    return () => {
      chatChannel.unbind_all();
      chatChannel.unsubscribe();
    };
  }, [roomId, open]);

  // Reset unread count when opening chat
  useEffect(() => {
    if (open) {
      setUnreadCount(0);
    }
  }, [open]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/rooms/${roomId}/messages`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axios.post(`${API_URL}/api/rooms/${roomId}/messages`, {
        content: newMessage,
        userId: currentUser.user.id
      }, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`
        }
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const showFloatingMessage = (message) => {
    // Only show floating message if chat drawer is closed and message is not from current user
    if (!open && message.userId !== currentUser.user.id) {
      const floatingMsg = document.createElement('div');
      floatingMsg.className = 'floating-message';
      floatingMsg.innerHTML = `
        <div class="floating-message-content">
          <strong>${message.username}</strong>
          <p>${message.content}</p>
        </div>
      `;
      document.body.appendChild(floatingMsg);

      // Remove after animation
      setTimeout(() => {
        floatingMsg.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(floatingMsg);
        }, 500);
      }, 5000);
    }
  };

  return (
    <>
      <IconButton
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          right: 30,
          top: 140,
          color: '#00ff95',
          backgroundColor: 'rgba(15, 15, 26, 0.98)',
          border: '1px solid rgba(0, 255, 149, 0.25)',
          padding: '8px',
          '&:hover': {
            backgroundColor: 'rgba(0, 255, 149, 0.1)',
            transform: 'scale(1.05)',
            boxShadow: '0 0 20px rgba(0, 255, 149, 0.15)',
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1200,
        }}
      >
        <Tooltip title="Room Chat" placement="left">
          <Badge 
            badgeContent={unreadCount} 
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: '#00ff95',
                color: '#0f0f1a',
                fontWeight: 'bold',
                minWidth: '20px',
                height: '20px',
                padding: '0 6px',
              }
            }}
          >
            <ChatIcon />
          </Badge>
        </Tooltip>
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: 340,
            backgroundColor: 'rgba(15, 15, 26, 0.98)',
            backdropFilter: 'blur(15px)',
            borderLeft: '1px solid rgba(0, 255, 149, 0.25)',
            boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden'
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
            borderBottom: '1px solid rgba(0, 255, 149, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backdropFilter: 'blur(10px)',
          }}>
            <Typography variant="h6" sx={{ 
              color: '#00ff95', 
              fontWeight: 600,
              letterSpacing: '0.5px',
            }}>
              Room Chat
            </Typography>
          </Box>

          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            height: 'calc(100% - 160px)',
            overflow: 'hidden',
            padding: '12px 8px',
          }}>
            <List sx={{ 
              flex: 1, 
              overflow: 'auto',
              padding: 1,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0, 255, 149, 0.2)',
                borderRadius: '3px',
                '&:hover': {
                  background: 'rgba(0, 255, 149, 0.3)',
                },
              },
            }}>
              {messages.map((message, index) => (
                <ListItem
                  key={index}
                  sx={{
                    flexDirection: 'column',
                    alignItems: message.userId === currentUser.user.id ? 'flex-end' : 'flex-start',
                    padding: '2px 0',
                    marginBottom: '6px',
                  }}
                >
                  <Box sx={{
                    maxWidth: '85%',
                    backgroundColor: message.userId === currentUser.user.id 
                      ? 'rgba(0, 255, 149, 0.15)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: message.userId === currentUser.user.id
                      ? '16px 16px 4px 16px'
                      : '16px 16px 16px 4px',
                    padding: '8px 12px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    border: message.userId === currentUser.user.id
                      ? '1px solid rgba(0, 255, 149, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.2)',
                  }}>
                    <Typography variant="caption" sx={{ 
                      color: message.userId === currentUser.user.id ? '#00ff95' : '#fff',
                      opacity: 0.8,
                      display: 'block',
                      marginBottom: '4px',
                      fontWeight: 500,
                      fontSize: '0.8rem',
                    }}>
                      {message.username}
                    </Typography>
                    <Typography sx={{ 
                      color: message.userId === currentUser.user.id ? '#00ff95' : '#fff',
                      wordBreak: 'break-word',
                      lineHeight: 1.4,
                      fontSize: '0.95rem',
                    }}>
                      {message.content}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
              <div ref={messagesEndRef} />
            </List>
          </Box>

          <Box
            component="form"
            onSubmit={handleSendMessage}
            sx={{
              p: 2,
              borderTop: '1px solid rgba(0, 255, 149, 0.25)',
              display: 'flex',
              gap: 1,
              backgroundColor: 'rgba(15, 15, 26, 0.95)',
            }}
          >
            <TextField
              fullWidth
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#00ff95',
                  backgroundColor: 'rgba(0, 255, 149, 0.05)',
                  borderRadius: '20px',
                  '& fieldset': {
                    borderColor: 'rgba(0, 255, 149, 0.3)',
                    borderRadius: '20px',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0, 255, 149, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#00ff95',
                  },
                  '& input': {
                    padding: '10px 16px',
                  },
                },
              }}
            />
            <IconButton 
              type="submit"
              sx={{ 
                color: '#00ff95',
                backgroundColor: 'rgba(0, 255, 149, 0.1)',
                borderRadius: '50%',
                padding: '8px',
                '&:hover': {
                  backgroundColor: 'rgba(0, 255, 149, 0.2)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Chat; 
