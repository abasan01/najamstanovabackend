import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
    name: String,
    age: Number,
});

const Test = mongoose.model('Test', testSchema);

export default Test;