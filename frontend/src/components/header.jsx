import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Select,
  MenuItem,
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import { SUPPORTED_LANGUAGES, LANGUAGE_VERSIONS, FILE_EXTENSIONS, COMMENT_SYNTAX } from '../services/constants.js';
import Particles from './styles/particles.jsx';
import BrandHeader from './styles/brandheader.jsx';

const EditorHeader = ({ language, onLanguageChange, roomId, roomName, code }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const handleBrandClick = () => {
    setIsAboutOpen(true);
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
  };

  const handleDownloadClick = () => {
    setOpenDialog(true);
  };

  const handleDownload = () => {
    if (!fileName) return;
    const commentSyntax = COMMENT_SYNTAX[language];
    const websiteComment = `${commentSyntax} Coded on https://codehiveng.vercel.app\n\n`;
    const fileContent = websiteComment + code;
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.${FILE_EXTENSIONS[language]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    setOpenDialog(false);
    setFileName('');
  };

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          background: 'rgba(15, 15, 26, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 255, 149, 0.2)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: '100%',
          left: 0,
          right: 0,
          overflow: 'hidden'
        }}
      >
        <Particles />
        <Toolbar sx={{ justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <BrandHeader 
            variant="h6" 
            onClick={handleBrandClick}
            sx={{ flexBasis: '200px' }}
          />

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: 2
          }}>
            <Select
              value={language}
              onChange={onLanguageChange}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: 'rgba(15, 15, 26, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 255, 149, 0.2)',
                    '& .MuiMenuItem-root': {
                      color: '#00ff95',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 255, 149, 0.1)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(0, 255, 149, 0.2)',
                      },
                    },
                  },
                },
              }}
              sx={{
                minWidth: 250,
                background: 'rgba(0, 255, 149, 0.1)',
                border: '1px solid rgba(0, 255, 149, 0.3)',
                color: '#00ff95',
                '& .MuiSelect-icon': {
                  color: '#00ff95'
                }
              }}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <MenuItem key={lang} value={lang}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>{lang.charAt(0).toUpperCase() + lang.slice(1)}</span>
                    <Typography variant="caption" sx={{ opacity: 0.7, ml: 2 }}>
                      v{LANGUAGE_VERSIONS[lang]}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 2,
            flexBasis: '200px',
            justifyContent: 'flex-end'
          }}>
            <Tooltip title="Download Code">
              <IconButton 
                onClick={handleDownloadClick}
                sx={{ 
                  color: '#00ff95',
                  '&:hover': {
                    background: 'rgba(0, 255, 149, 0.1)'
                  }
                }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1,
              color: '#00ff95' 
            }}>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Room:
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {roomName || 'Loading...'}
              </Typography>
              <Tooltip title="Copy Room ID">
                <IconButton 
                  onClick={handleCopyRoomId}
                  sx={{ 
                    color: '#00ff95',
                    '&:hover': {
                      background: 'rgba(0, 255, 149, 0.1)'
                    }
                  }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{ 
          sx: { 
            background: 'rgba(15, 15, 26, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 255, 149, 0.2)',
            color: '#00ff95'
          } 
        }}
      >
        <DialogTitle>Download Code</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="File Name"
            fullWidth
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#00ff95',
                '& fieldset': {
                  borderColor: 'rgba(0, 255, 149, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 255, 149, 0.5)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(0, 255, 149, 0.7)',
              },
            }}
          />
          <Typography variant="caption" sx={{ color: 'rgba(0, 255, 149, 0.7)' }}>
            File will be saved as: {fileName}.{FILE_EXTENSIONS[language]}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)}
            sx={{ color: '#00ff95' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDownload}
            sx={{ color: '#00ff95' }}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>

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
          <Typography paragraph>
            CodeHiveNG is a real-time collaborative coding platform that enables developers to code together, share ideas, and learn from each other in a seamless environment.
          </Typography>
          <Typography paragraph>
            Features:
            • Real-time code collaboration
            • Multiple programming language support
            • Integrated chat system
            • Code execution capabilities
            • Easy room sharing
          </Typography>
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
    </>
  );
};

export default EditorHeader;
