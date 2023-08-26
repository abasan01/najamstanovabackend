import mongoose from "mongoose";
import "dotenv/config";

export default () => {
    mongoose
        .connect(String(process.env.MONGODB_URI), {
            dbName: process.env.DB_NAME,
            user: process.env.DB_USER,
            pass: process.env.DB_PASS,
        })
        /* .connect("mongodb://localhost:27017", {
            dbName: "test",
        }) */
        .then(() => {
            console.log('Mongodb spojen....');
        })
        .catch(err => console.log(err.message));

    mongoose.connection.on('connected', () => {
        console.log('Mongoose spojen na db...');
    });

    mongoose.connection.on('error', err => {
        console.log(err.message);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('Mongoose je odspojen...');
    });

    process.on('SIGINT', () => {
        // @ts-ignore
        mongoose.connection.close(() => {
            console.log(
                'Mongoose je ugašen...'
            );
            process.exit(0);
        });
    })
};