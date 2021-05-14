const { Schema, model } = require('mongoose');

const Product = new Schema({
    title: String,
    description: String,
    category: String,
    price: String,
    imageURL: Array,
    public_id: Array
});

module.exports = model('Product', Product);
