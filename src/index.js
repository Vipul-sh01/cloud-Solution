import dotenv from 'dotenv';
import { connectDB, sequelize } from './db/server.db.js';
import {app} from '../src/app.js'

dotenv.config({
    path: './.env',
});

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server running on port http://localhost:${process.env.PORT || 3000}`);
        });
    })
    .catch((error) => {
        console.error("Error starting the application: ", error.message || error);
        process.exit(1);
    });