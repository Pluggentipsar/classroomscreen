require('dotenv').config();

console.log('Testing .env loading...');
console.log('PEXELS_API_KEY:', process.env.PEXELS_API_KEY ? 'LOADED ✓' : 'NOT FOUND ✗');
console.log('Key length:', process.env.PEXELS_API_KEY ? process.env.PEXELS_API_KEY.length : 0);
console.log('First 10 chars:', process.env.PEXELS_API_KEY ? process.env.PEXELS_API_KEY.substring(0, 10) + '...' : 'N/A');
