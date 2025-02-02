import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Snackbar } from '@mui/material';
import Editor from '@monaco-editor/react';
import Sidebar from './userSidebar';
import EditorHeader from './header.jsx';
import { executeCode } from '../services/compiler';
import { LANGUAGE_VERSIONS, FILE_EXTENSIONS } from '../services/constants';
import { BOILERPLATE_CODE } from '../services/boilerplate';
import axios from 'axios';
import FileSidebar from './fileSidebar';
import SaveIcon from '@mui/icons-material/Save';
import InputTerminal from './inputTerminal.jsx';
import Pusher from 'pusher-js';
import { debounce } from 'lodash';
import MuiAlert from '@mui/material/Alert';
import Chat from './chat.jsx';
import BrandHeader from './styles/brandheader.jsx';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://codehiveng.vercel.app'
  : 'http://localhost:5000';

const CodeEditor = () => {
  const { roomId } = useParams();
  const [code, setCode] = useState(BOILERPLATE_CODE['javascript']);
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [input, setInput] = useState('');
  const outputRef = useRef(null);
  const [pusher] = useState(() => new Pusher(process.env.REACT_APP_PUSHER_KEY, {
    cluster: process.env.REACT_APP_PUSHER_CLUSTER,
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    timeout: 20000
  }));
  const [channel] = useState(() => pusher.subscribe(`room-${roomId}`));
  const [lastUpdateBy, setLastUpdateBy] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const editorRef = useRef(null);
  const [remoteCursors, setRemoteCursors] = useState({});

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        const response = await axios.get(`${API_URL}/api/rooms/${roomId}/details`, {
          headers: {
            Authorization: `Bearer ${userData.token}`
          }
        });
        setRoomName(response.data.room.name);
      } catch (error) {
        console.error('Error fetching room details:', error);
      }
    };

    fetchRoomDetails();
  }, [roomId]);

  useEffect(() => {
    // Load boilerplate when language changes
    setCode(BOILERPLATE_CODE[language]);
  }, [language]);

  useEffect(() => {
    // Subscribe to code updates
    channel.bind('code-update', data => {
      if (data.userId !== currentUser.user.id) {
        // Store current cursor position and selections
        const selections = editorRef.current?.getSelections() || [];
        
        setCode(data.code);
        setLastUpdateBy(data.userId);

        // Restore cursor positions and selections after state update
        if (editorRef.current && selections.length > 0) {
          editorRef.current.setSelections(selections);
        }
      }
    });

    // New language update listener
    channel.bind('language-update', data => {
      if (data.userId !== currentUser.user.id) {
        setLanguage(data.language);
      }
    });

    // Modified terminals update listener
    channel.bind('terminals-update', data => {
      if (data.userId !== currentUser.user.id) {
        setInput(data.input);
        setOutput(data.output);
        setIsLoading(data.isLoading);
      }
    });

    // New file selection listener
    channel.bind('file-selection', data => {
      if (data.userId !== currentUser.user.id) {
        setLanguage(data.file.language);
        setCode(data.file.content);
        setToast({
          open: true,
          message: `${data.username} opened ${data.file.name}`,
          severity: 'info'
        });
      }
    });

    // Add cursor position listener
    channel.bind('cursor-update', data => {
      if (data.userId !== currentUser.user.id) {
        setRemoteCursors(prev => ({
          ...prev,
          [data.userId]: {
            position: data.position,
            username: data.username
          }
        }));
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      channel.unbind('cursor-update');
    };
  }, [channel, currentUser.user.id]);

  // Debounce the code update to prevent too many API calls
  const broadcastCodeUpdate = debounce(async (newCode) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.token) {
        console.error('No auth token found');
        return;
      }

      console.log('Broadcasting code update...', {
        roomId,
        codeLength: newCode.length,
        token: userData.token ? 'Present' : 'Missing'
      });

      const response = await axios.post(`${API_URL}/api/rooms/${roomId}/code`, {
        code: newCode,
        userId: userData.user.id
      }, {
        headers: {
          Authorization: `Bearer ${userData.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.data.success) {
        console.error('Server responded with error:', response.data);
        throw new Error(response.data.message || 'Failed to broadcast code');
      }
      
      console.log('Code broadcast successful');
    } catch (error) {
      console.error('Error broadcasting code:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    }
  }, 200);

  const broadcastLanguageUpdate = debounce(async (newLanguage) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.token) {
        console.error('No auth token found');
        return;
      }

      await axios.post(`${API_URL}/api/rooms/${roomId}/language`, {
        language: newLanguage,
        userId: userData.user.id
      }, {
        headers: {
          Authorization: `Bearer ${userData.token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error broadcasting language:', error);
    }
  }, 200);

  const broadcastTerminalsUpdate = debounce(async (newInput, newOutput, loadingState) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.token) {
        console.error('No auth token found');
        return;
      }

      await axios.post(`${API_URL}/api/rooms/${roomId}/terminals`, {
        input: newInput,
        output: newOutput,
        isLoading: loadingState,
        userId: userData.user.id
      }, {
        headers: {
          Authorization: `Bearer ${userData.token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error broadcasting terminals:', error);
    }
  }, 200);

  const broadcastFileSelection = debounce(async (file) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.token) {
        console.error('No auth token found');
        return;
      }

      await axios.post(`${API_URL}/api/rooms/${roomId}/file-selection`, {
        file,
        userId: userData.user.id
      }, {
        headers: {
          Authorization: `Bearer ${userData.token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error broadcasting file selection:', error);
    }
  }, 200);

  // Add this function to broadcast cursor position
  const broadcastCursorPosition = debounce(async (position) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.token) return;

      await axios.post(`${API_URL}/api/rooms/${roomId}/cursor`, {
        position,
        userId: userData.user.id
      }, {
        headers: {
          Authorization: `Bearer ${userData.token}`
        }
      });
    } catch (error) {
      console.error('Error broadcasting cursor:', error);
    }
  }, 50);

  // Add cursor position tracking
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    
    editor.onDidChangeCursorPosition(e => {
      const position = editor.getPosition();
      broadcastCursorPosition({
        lineNumber: position.lineNumber,
        column: position.column
      });
    });

    // Add remote cursor decorations
    editor.onDidChangeModelContent(() => {
      const decorations = Object.entries(remoteCursors).map(([userId, data]) => ({
        range: new monaco.Range(
          data.position.lineNumber,
          data.position.column,
          data.position.lineNumber,
          data.position.column
        ),
        options: {
          className: 'remote-cursor',
          hoverMessage: { value: data.username },
          zIndex: 100
        }
      }));

      editor.deltaDecorations([], decorations);
    });
  };

  const handleEditorChange = async (value) => {
    // Store current cursor position and selections
    const selections = editorRef.current?.getSelections() || [];
    
    setCode(value);
    broadcastCodeUpdate(value);

    // Restore cursor positions and selections after state update
    if (editorRef.current && selections.length > 0) {
      editorRef.current.setSelections(selections);
    }
  };

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
    setCode(BOILERPLATE_CODE[newLanguage]);
    broadcastLanguageUpdate(newLanguage);
  };

  const scrollToOutput = () => {
    const editorContent = document.querySelector('.editor-content');
    const outputContainer = outputRef.current;
    
    if (editorContent && outputContainer) {
      const headerHeight = 64; // Height of the fixed header
      const scrollPosition = outputContainer.offsetTop - headerHeight;
      
      editorContent.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleRunCode = async () => {
    setIsLoading(true);
    // Broadcast loading state immediately
    broadcastTerminalsUpdate(input, output, true);
    
    try {
      const result = await executeCode(
        language,
        LANGUAGE_VERSIONS[language],
        code,
        input
      );
      const newOutput = result.run.output || 'No output';
      setOutput(newOutput);
      // Broadcast final result with loading false
      broadcastTerminalsUpdate(input, newOutput, false);
      scrollToOutput();
    } catch (error) {
      const errorOutput = `Error: ${error.message}`;
      setOutput(errorOutput);
      // Broadcast error with loading false
      broadcastTerminalsUpdate(input, errorOutput, false);
      scrollToOutput();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFile = async () => {
    if (!fileName) return;
    
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      await axios.post(`${API_URL}/api/files`, {
        name: `${fileName}.${FILE_EXTENSIONS[language]}`,
        content: code,
        language,
        roomId
      }, {
        headers: {
          Authorization: `Bearer ${userData.token}`
        }
      });
      setSaveDialogOpen(false);
      setFileName('');
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const handleFileSelect = (file) => {
    setLanguage(file.language);
    // Add a small delay to ensure language is set before setting code
    setTimeout(() => {
      setCode(file.content);
      broadcastFileSelection(file);
    }, 50);
  };

  const handleInputChange = (e) => {
    const newInput = e.target.value;
    setInput(newInput);
    broadcastTerminalsUpdate(newInput, output, isLoading);
  };

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  return (
    <Box className="code-editor-container">
      <EditorHeader 
        language={language}
        onLanguageChange={handleLanguageChange}
        roomId={roomId}
        roomName={roomName}
        code={code}
      >
        <BrandHeader variant="h6" sx={{ flexBasis: '200px' }} />
      </EditorHeader>
      <Sidebar roomId={roomId} />
      <Box className="editor-content">
        <Box className="editor-wrapper">
          <Editor
            height="100%"
            defaultLanguage={language}
            language={language}
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              formatOnType: true,
              formatOnPaste: true,
              autoIndent: 'full',
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: true
            }}
          />
        </Box>
        
        <Box sx={{ 
          width: '100%', 
          maxWidth: '1200px',
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '1rem 0',
          gap: '1rem',
          margin: '0 auto'
        }}>
          <Button
            onClick={() => setSaveDialogOpen(true)}
            className="run-button"
            startIcon={<SaveIcon />}
          >
            Save File
          </Button>
          <Button
            onClick={handleRunCode}
            disabled={isLoading}
            className="run-button"
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Running...' : 'Run Code'}
          </Button>
        </Box>

        <InputTerminal value={input} onChange={handleInputChange} />

        <Box className="output-container" ref={outputRef}>
          <h3>Output:</h3>
          <pre>{output}</pre>
        </Box>
      </Box>
      <FileSidebar
        roomId={roomId}
        onFileSelect={handleFileSelect}
        currentLanguage={language}
      />
      <Chat roomId={roomId} />
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(15, 15, 26, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 255, 149, 0.2)',
          }
        }}
      >
        <DialogTitle sx={{ color: '#00ff95' }}>Save File</DialogTitle>
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
          <Button onClick={() => setSaveDialogOpen(false)} sx={{ color: '#00ff95' }}>
            Cancel
          </Button>
          <Button onClick={handleSaveFile} sx={{ color: '#00ff95' }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          zIndex: 9999,
          marginTop: '80px' // Add space below the header
        }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity={toast.severity}
          sx={{
            backgroundColor: 'rgba(0, 255, 149, 0.2)',
            color: '#00ff95',
            border: '1px solid rgba(0, 255, 149, 0.3)',
            '& .MuiAlert-icon': {
              color: '#00ff95'
            }
          }}
        >
          {toast.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default CodeEditor;
