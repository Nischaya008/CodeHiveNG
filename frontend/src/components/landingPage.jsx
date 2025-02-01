import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignIn from './signIn.jsx';
import SignUp from './signUp.jsx';
import Particles from './styles/particles.jsx';
import './styles/landingPage.css';
import {
  Container,
  Box,
  Button,
  Typography,
  TextField,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { logout } from '../services/auth.js';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmailIcon from '@mui/icons-material/Email';
import BrandHeader from './styles/brandheader.jsx';

const StyledButton = styled(Button)(({ theme }) => ({
  background: 'rgba(0, 255, 149, 0.1)',
  border: '1px solid rgba(0, 255, 149, 0.5)',
  color: '#00ff95',
  '&:hover': {
    background: 'rgba(0, 255, 149, 0.2)',
  },
}));

const LandingPage = () => {
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState({ name: '' });
  const [joinRoomId, setJoinRoomId] = useState('');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isCodeEffect, setIsCodeEffect] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user) {
      fetchUserRooms();
    }
  }, [user, window.location.pathname]);

  const fetchUserRooms = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.token) {
        console.error('No auth token found');
        return;
      }

      // Verify token hasn't expired
      const tokenData = JSON.parse(atob(userData.token.split('.')[1]));
      if (tokenData.exp * 1000 < Date.now()) {
        console.error('Token expired');
        logout();
        window.location.reload();
        return;
      }

      const response = await axios.get(`/api/rooms/user/${userData.user.id}`, {
        headers: {
          Authorization: `Bearer ${userData.token}`
        }
      });

      setRooms(response.data.rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      if (error.response?.status === 401) {
        logout();
        window.location.reload();
      }
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const response = await axios.post('/api/rooms', {
        name: newRoom.name
      }, {
        headers: {
          Authorization: `Bearer ${userData.token}`
        }
      });
      if (response.data.success) {
        navigate(`/editor/${response.data.room.roomId}`);
      }
    } catch (error) {
      console.error('Error creating room:', error);
      if (error.response?.status === 400 && error.response.data.message === 'A room with this name already exists') {
        setToast({
          open: true,
          message: 'Room Already Exists',
          severity: 'error'
        });
      }
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      await axios.get(`/api/rooms/${joinRoomId}`, {
        headers: {
          Authorization: `Bearer ${userData.token}`
        }
      });
      navigate(`/editor/${joinRoomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const handleJoinExistingRoom = async (roomId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      await axios.post(`/api/rooms/${roomId}/join`, {}, {
        headers: {
          Authorization: `Bearer ${userData.token}`
        }
      });
      await fetchUserRooms();  // Refresh the room list
      navigate(`/editor/${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const handleBrandClick = () => {
    setIsCodeEffect(true);
    setTimeout(() => {
      setIsAboutOpen(true);
      setIsCodeEffect(false);
    }, 600);
  };

  const SocialLinks = () => (
    <div className="social-links">
      <a href="https://github.com/Nischaya008" target="_blank" rel="noopener noreferrer" className="social-link">
        <GitHubIcon /> GitHub
      </a>
      <a href="https://www.linkedin.com/in/nischaya008/" target="_blank" rel="noopener noreferrer" className="social-link">
        <LinkedInIcon /> LinkedIn
      </a>
      <a href="https://x.com/Nischaya008" target="_blank" rel="noopener noreferrer" className="social-link">
        <TwitterIcon /> Twitter
      </a>
      <a href="mailto:nischayagarg008@gmail.com" className="social-link">
        <EmailIcon /> Email
      </a>
    </div>
  );

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  return (
    <div className="landing-container">
      <Particles />
      <div className="content-wrapper">
        {user && (
          <AppBar position="static" sx={{ background: 'rgba(15, 15, 26, 0.8)', backdropFilter: 'blur(10px)' }}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <BrandHeader variant="h5" onClick={handleBrandClick} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography>Hi, {user.user.username}</Typography>
                <StyledButton onClick={handleLogout}>
                  Logout
                </StyledButton>
              </Box>
            </Toolbar>
          </AppBar>
        )}

        {!user ? (
          <Container>
            <Box className="auth-container">
              <BrandHeader size="large" onClick={handleBrandClick} />
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#fff', 
                  textAlign: 'center', 
                  mb: 4,
                  opacity: 0.9,
                  maxWidth: '600px',
                  lineHeight: 1.6
                }}
              >
                Collaborate. Code. Create.
              </Typography>
              <Box className="auth-buttons">
                <StyledButton
                  className="auth-button"
                  onClick={() => setIsSignInOpen(true)}
                >
                  Sign In
                </StyledButton>
                <StyledButton
                  className="auth-button"
                  onClick={() => setIsSignUpOpen(true)}
                >
                  Sign Up
                </StyledButton>
              </Box>
            </Box>
          </Container>
        ) : (
          <Container className="rooms-container">
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card className="room-card">
                  <CardContent>
                    <Typography variant="h6" className="room-title">
                      Create New Room
                    </Typography>
                    <Box component="form" onSubmit={handleCreateRoom}>
                      <TextField
                        className="room-input"
                        fullWidth
                        label="Room Name"
                        value={newRoom.name}
                        onChange={(e) => setNewRoom({ name: e.target.value })}
                        autoComplete="off"
                        inputProps={{
                          autoComplete: 'new-password',
                          form: {
                            autoComplete: 'off',
                          },
                        }}
                      />
                      <Button type="submit" className="dialog-button">
                        Create Room
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card className="room-card">
                  <CardContent>
                    <Typography variant="h6" className="room-title">
                      Join Room
                    </Typography>
                    <Box component="form" onSubmit={handleJoinRoom}>
                      <TextField
                        className="room-input"
                        fullWidth
                        label="Room ID"
                        value={joinRoomId}
                        onChange={(e) => setJoinRoomId(e.target.value)}
                        autoComplete="off"
                        inputProps={{
                          autoComplete: 'new-password',
                          form: {
                            autoComplete: 'off',
                          },
                        }}
                      />
                      <Button type="submit" className="dialog-button">
                        Join Room
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card className="room-card">
                  <CardContent>
                    <Typography variant="h6" className="room-title">
                      Your Rooms
                    </Typography>
                    <List className="room-history-list">
                      {rooms.map((room) => (
                        <ListItem key={room.roomId} className="room-list-item">
                          <ListItemText 
                            primary={room.name}
                            secondary={`Created by ${room.createdBy.username}`}
                            sx={{ 
                              color: '#fff',
                              '& .MuiListItemText-secondary': {
                                color: 'rgba(0, 255, 149, 0.7)'
                              }
                            }}
                          />
                          <Button 
                            onClick={() => handleJoinExistingRoom(room.roomId)}
                            className="dialog-button"
                          >
                            Join
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        )}

        <SocialLinks />
        <SignIn open={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
        <SignUp open={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} />
      </div>
      <Dialog
        open={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(15, 15, 26, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 255, 149, 0.2)',
            borderRadius: '12px',
            color: '#00ff95'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(0, 255, 149, 0.2)' }}>
          About CodeHiveNG
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.5)',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0, 255, 149, 0.3)',
          }}>
            <Typography paragraph>
              CodeHiveNG is a real-time collaborative coding platform that enables developers to work together seamlessly. Built with React, Node.js, and MongoDB, it supports live code synchronization, multi-language coding, and code execution. With an integrated chat system, version tracking, and secure room access, CodeHiveNG enhances productivity in an intuitive and responsive environment.
            </Typography>
            <Typography paragraph>
              Key Features:
              <ul>
                <li><strong>Real-time Collaboration</strong>: Code together and see live updates.</li>
                <li><strong>Multi-language Support</strong>: Work with various programming languages.</li>
                <li><strong>Integrated Chat</strong>: Communicate instantly with teammates.</li>
                <li><strong>Code Execution</strong>: Run code directly within the platform.</li>
                <li><strong>Version Tracking</strong>: Keep track of code revisions.</li>
                <li><strong>Secure Room Access</strong>: Control access to your projects.</li>
                <li><strong>Intuitive UI</strong>: Simple and user-friendly design for enhanced productivity.</li>
              </ul>
            </Typography>
            <Typography paragraph>
              I am Nischaya Garg, a Computer Science Engineering student specializing in Artificial Intelligence and Machine Learning (Hons. IBM). My expertise lies in Full-stack Web Development, with proficiency in MongoDB, Express, React, Node.js, and C++ for Data Structures and Algorithms (DSA).
            </Typography>
          </div>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(0, 255, 149, 0.2)', p: 2 }}>
          <Button 
            onClick={() => setIsAboutOpen(false)}
            sx={{
              color: '#00ff95',
              border: '1px solid rgba(0, 255, 149, 0.5)',
              '&:hover': {
                background: 'rgba(0, 255, 149, 0.1)',
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert elevation={6} variant="filled" severity={toast.severity}>
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default LandingPage;
