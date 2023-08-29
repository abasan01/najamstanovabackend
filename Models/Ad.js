import mongoose from 'mongoose';

const adSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minLength: 10,
    },
    url: {
        type: [String],
        required: true,
    },
    description: {
        type: String,
        required: true,
        minLength: 10,
    },
    location: {
        type: String,
        required: true,
        minLength: 2,
    },
    price: {
        type: Number,
        required: true,
        min: 1
    },
    rooms: {
        type: Number,
        required: true,
        min: 1
    },
    surface: {
        type: Number,
        required: true,
        min: 1
    },
    parking: {
        type: Boolean,
        required: true,
    },
    pets: {
        type: Boolean,
        required: true,
    },
    smoking: {
        type: Boolean,
        required: true,
    },
    season: {
        type: Boolean,
        required: true,
    },
    furnished: {
        type: Boolean,
        required: true,
    },
    floors: {
        type: Number,
        required: true,
        min: 0
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    },
    updatedAt: {
        type: Date,
        default: () => Date.now(),
    }
});

const Ad = mongoose.model('Ad', adSchema);

export default Ad;