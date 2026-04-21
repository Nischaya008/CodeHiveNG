import axios from 'axios';
import { LANGUAGE_IDS } from './constants.js';

const API = axios.create({
    baseURL: 'https://ce.judge0.com'
});

export const executeCode = async (language, version, sourceCode, stdin = '') => {
    try {
        const languageId = LANGUAGE_IDS[language];
        if (!languageId) {
            throw new Error(`Unsupported language: ${language}`);
        }

        // Submit the code for execution with wait=true for synchronous result
        const response = await API.post('/submissions?base64_encoded=false&wait=true', {
            source_code: sourceCode,
            language_id: languageId,
            stdin: stdin,
            cpu_time_limit: 5,
            wall_time_limit: 10
        });

        const data = response.data;

        // Judge0 status IDs:
        // 1-2 = In Queue/Processing, 3 = Accepted, 4 = Wrong Answer,
        // 5 = Time Limit Exceeded, 6 = Compilation Error, 7-14 = Runtime Errors
        let output = '';
        let hasError = false;

        if (data.compile_output) {
            output += data.compile_output;
            // If status is Compilation Error (id 6), mark as error
            if (data.status && data.status.id === 6) {
                hasError = true;
            }
        }

        if (data.stderr) {
            output += (output ? '\n' : '') + data.stderr;
            hasError = true;
        }

        if (data.stdout) {
            output = data.stdout + (hasError ? '\n' + output : '');
        }

        if (!output && data.status) {
            output = data.status.description || 'No output';
        }

        // Return in a format compatible with the existing codeEditor.jsx
        return {
            run: {
                output: output || 'No output',
                code: hasError ? 1 : 0
            }
        };
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || error.response.data.error || 'Execution failed');
        }
        throw new Error('Network error occurred');
    }
};
