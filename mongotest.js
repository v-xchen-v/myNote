var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/testdb');
var db = mongoose.connection;
db.on('error',console.error.bind(console,'connect error testdb'));
