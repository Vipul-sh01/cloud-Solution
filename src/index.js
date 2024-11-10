import dotenv from 'dotenv';
import { connectDB, sequelize } from './db/server.db.js';
import {app} from './app.js';

const port = process.env.PORT || 3000;

dotenv.config({
    path: './.env',
});

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server running on port http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error("Error starting the application: ", error.message || error);
        process.exit(1);
    });