import mongoose from 'mongoose';

const MONGODB_URI = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

const dbConnect = async () => {
    if (mongoose.connections[0].readyState) return;

    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
        });
        console.log('DB Connected Successfully!');
    } catch (error) {
        console.log('DB Connection Error:', error);
    }
};

export default dbConnect;