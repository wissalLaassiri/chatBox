const dotenv = require('dotenv');
dotenv.config();

const port = process.env.PORT;
const secret = process.env.JWT_ENCRYPTION;
global.port = port;
global.secret = secret;