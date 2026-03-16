import dotenv from 'dotenv';
import { getTopIndiaFinanceNews } from './controllers/newsController.js';

dotenv.config();

const req = {};
const res = {
    status: (code) => ({
        json: (data) => {
            console.log(`Response Code: ${code}`);
            console.log('Response Data:', JSON.stringify(data, null, 2));
        }
    })
};

console.log('--- Testing News API Integration ---');
getTopIndiaFinanceNews(req, res).then(() => {
    console.log('--- Test Complete ---');
}).catch(err => {
    console.error('--- Test Failed ---', err);
});
