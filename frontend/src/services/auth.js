import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://codehiveng.vercel.app/api/users'
  : 'http://localhost:5000/api/users';

export const signup = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, userData);
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const signin = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/signin`, credentials);
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const logout = () => {
  localStorage.removeItem('user');
};
