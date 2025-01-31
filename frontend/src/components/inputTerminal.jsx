import React from 'react';
import { Box, Typography, TextField } from '@mui/material';

const InputTerminal = ({ value, onChange }) => {
  return (
    <Box 
      className="output-container"
      sx={{ 
        marginBottom: '20px',
        '&:hover': {
          boxShadow: '0 0 30px rgba(0, 255, 149, 0.1)',
          borderColor: 'rgba(0, 255, 149, 0.3)',
        }
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          color: '#00ff95',
          marginBottom: '10px',
          fontSize: '1rem',
          fontWeight: 500
        }}
      >
        Input:
      </Typography>
      <TextField
        multiline
        rows={2}
        fullWidth
        value={value}
        onChange={onChange}
        placeholder="Enter program input here..."
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            color: 'rgba(0, 255, 149, 0.8)',
            fontFamily: 'Consolas, monospace',
            fontSize: '0.9rem',
            '& fieldset': {
              borderColor: 'rgba(0, 255, 149, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 255, 149, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'rgba(0, 255, 149, 0.5)',
            },
          },
          '& .MuiInputBase-input': {
            padding: '8px 12px',
          },
          '& .MuiInputBase-input::placeholder': {
            color: 'rgba(0, 255, 149, 0.4)',
            opacity: 1,
          }
        }}
      />
    </Box>
  );
};

export default InputTerminal; 