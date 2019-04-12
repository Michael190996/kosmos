import {ObjectId, Schema, model} from 'mongoose';

const scheme = new Schema({
    id: {
        type: String,
        index: true
    },
    first_name: {
        type: String,
        required: true
    },
    dateLastMessage: {
        type: Date,
        index: true
    },
}, {
    timestamps: true
});

// for test
scheme.pre('save', function (next) {
    this.id = this._id;
    next();
});

export default model('Players', scheme);