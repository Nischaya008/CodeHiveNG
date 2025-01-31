import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Alert
} from '@mui/material';
import { signup } from '../services/auth.js';
import './styles/shared.css';

const SignUp = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(formData);
      onClose();
      window.location.reload();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{ className: 'dialog-paper' }}
    >
      <DialogTitle className="dialog-title">Sign Up</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          autoFocus
          className="dialog-input"
          name="username"
          label="Username"
          type="text"
          fullWidth
          variant="outlined"
          value={formData.username}
          onChange={handleChange}
        />
        <TextField
          className="dialog-input"
          name="email"
          label="Email Address"
          type="email"
          fullWidth
          variant="outlined"
          value={formData.email}
          onChange={handleChange}
        />
        <TextField
          className="dialog-input"
          name="password"
          label="Password"
          type="password"
          fullWidth
          variant="outlined"
          value={formData.password}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} className="dialog-button">Cancel</Button>
        <Button onClick={handleSubmit} className="dialog-button">Sign Up</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SignUp; 