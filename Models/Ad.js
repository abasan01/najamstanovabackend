import mongoose from 'mongoose';

const adSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minLength: 10,
    },
    url: {
        type: [{
            name: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
        }, ],
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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
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

// @ts-ignore
adSchema.pre("save", function (next) {
    // @ts-ignore
    this.updatedAt = Date.now();
    next();
});

const Ad = mongoose.model('Ad', adSchema);

export default Ad;