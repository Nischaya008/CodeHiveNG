import axios from 'axios';

export const signup = async (userData) => {
  try {
    const response = await axios.post('/api/users/signup', userData);
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
    console.log('Attempting signin with:', { 
      emailOrUsername: credentials.emailOrUsername, 
      hasPassword: !!credentials.password 
    });
    const response = await axios.post('/api/users/signin', credentials);
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    console.error('Signin error:', error.response || error);
    if (error.response) {
      throw error.response.data;
    } else {
      throw { message: 'Network error occurred' };
    }
  }
};

export const logout = () => {
  localStorage.removeItem('user');
};
