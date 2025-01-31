import axios from 'axios';
import { LANGUAGE_VERSIONS } from './constants.js';

const API_URL = axios.create({
    baseURL: 'https://emkc.org/api/v2/piston'
});

export const executeCode = async (language, version, sourceCode, stdin = '') => {
    try {
        const response = await API_URL.post('/execute', {
            language,
            version,
            files: [{ content: sourceCode }],
            stdin: stdin,
            compile_timeout: 10000,
            run_timeout: 3000
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || 'Execution failed');
        }
        throw new Error('Network error occurred');
    }
};