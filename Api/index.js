const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

if (process.env.ENV === 'dev' && fs.existsSync(path.resolve(__dirname, '.env.development'))) {
  dotenv.config({
    path: path.resolve(__dirname, '.env.development'),
    override: true
  });
} else {
  dotenv.config();
}

const app = require('./app');

// Replace MongoDB connection with mock database
const { connectDB } = require('./db/mockDatabase');
connectDB();

app.listen(process.env.PORT || 4000, () => {
  console.log(`Server running on port ${process.env.PORT || 4000}`);
});