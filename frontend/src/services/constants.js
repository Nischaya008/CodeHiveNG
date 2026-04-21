// Judge0 CE language IDs (from https://ce.judge0.com/languages/)
export const LANGUAGE_IDS = {
    "javascript": 93,   // JavaScript (Node.js 18.15.0)
    "python": 92,        // Python (3.11.2)
    "java": 91,          // Java (JDK 17.0.6)
    "c": 103,            // C (GCC 14.1.0)
    "cpp": 105,          // C++ (GCC 14.1.0)
    "csharp": 51,        // C# (Mono 6.6.0.161)
    "go": 107            // Go (1.23.5)
};

// Keep LANGUAGE_VERSIONS for display/backward compat
export const LANGUAGE_VERSIONS = {
    "javascript": "18.15.0",
    "python": "3.11.2",
    "java": "17.0.6",
    "c": "14.1.0",
    "cpp": "14.1.0",
    "csharp": "6.6.0",
    "go": "1.23.5"
};

export const SUPPORTED_LANGUAGES = [
    "javascript",
    "python",
    "java",
    "c",
    "cpp",
    "csharp",
    "go"
];

export const FILE_EXTENSIONS = {
  javascript: 'js',
  python: 'py',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  csharp: 'cs',
  go: 'go'
};

export const COMMENT_SYNTAX = {
  javascript: '//',
  python: '#',
  java: '//',
  c: '//',
  cpp: '//',
  csharp: '//',
  go: '//'
};
