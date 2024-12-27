const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = mongoose.ObjectId;

const User= new Schema({
    username: String,
    password: String,
    email: {type : String, unique: true}
})

const Todo = new Schema({
    title: String,
    done: Boolean,
    userId: ObjectId
})

const userModel = mongoose.model('users',User);
const todoModel = mongoose.model('to-dos',Todo);

module.exports = {
    userModel : userModel,
    todoModel : todoModel
}
