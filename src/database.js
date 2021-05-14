const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useFindAndModify: false
})

    .then(db => console.log('DataBase is connected'))
    .catch(err => console.error(err));