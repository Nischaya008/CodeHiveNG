import Pusher from 'pusher';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Add debug logging before creating instance
console.log('Creating Pusher instance with config:', {
  appId: process.env.PUSHER_APP_ID ? 'Set' : 'Not Set',
  key: process.env.PUSHER_KEY ? 'Set' : 'Not Set',
  secret: process.env.PUSHER_SECRET ? 'Set' : 'Not Set',
  cluster: process.env.PUSHER_CLUSTER ? 'Set' : 'Not Set'
});

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

export default pusher;
