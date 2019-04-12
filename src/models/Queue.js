import {Schema, model} from 'mongoose';

const scheme = new Schema({
    message: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

export default model('Queue', scheme);