import session from 'express-session'; 
import SequelizeStore from 'connect-session-sequelize'; 
import { Sequelize } from 'sequelize';
import { DB_NAME } from '../constants.js';
import { initModels } from '../models/centralize.models.js';


const sequelize = new Sequelize(DB_NAME, process.env.PG_USER, process.env.PG_PASSWORD, {
    host: process.env.PG_HOST,
    dialect: 'postgres',
    logging: console.log,
});


const SequelizeSessionStore = SequelizeStore(session.Store);
const sessionStore = new SequelizeSessionStore({
    db: sequelize,
});


const syncSessionStore = async () => {
    try {
        await sessionStore.sync();
        console.log("Session store synchronized.");
    } catch (error) {
        console.error("Session store sync failed:", error.message || error);
    }
};


syncSessionStore();

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, 
        httpOnly: true,
    },
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log(`\nPostgreSQL connected! DB HOST: ${process.env.PG_HOST}`);
        await sequelize.sync({ force: false });
    } catch (error) {
        console.error("PostgreSQL connection FAILED: ", error.message || error);
        process.exit(1);
    }
};


const db = initModels(sequelize);


export { sequelize, connectDB, db, sessionMiddleware };
