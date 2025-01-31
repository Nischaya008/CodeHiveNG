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
import { signin } from '../services/auth.js';
import './styles/shared.css';

const SignIn = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
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
      await signin(formData);
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
      <DialogTitle className="dialog-title">Sign In</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          autoFocus
          className="dialog-input"
          name="emailOrUsername"
          label="Email or Username"
          type="text"
          fullWidth
          variant="outlined"
          value={formData.emailOrUsername}
          onChange={handleChange}
          sx={{
            '& .MuiInputBase-input:-webkit-autofill': {
              '-webkit-box-shadow': '0 0 0 100px rgba(15, 15, 26, 0.95) inset',
              '-webkit-text-fill-color': '#fff'
            }
          }}
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
          sx={{
            '& .MuiInputBase-input:-webkit-autofill': {
              '-webkit-box-shadow': '0 0 0 100px rgba(15, 15, 26, 0.95) inset',
              '-webkit-text-fill-color': '#fff'
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} className="dialog-button">Cancel</Button>
        <Button onClick={handleSubmit} className="dialog-button">Sign In</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SignIn; 
