// load reliant library
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var crypto = require('crypto');
// load mogoose db
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var noteSchema = new Schema({
    username : String,
    password : String,
    date : {type:Date,default:Date.now}
});
var contentSchema = new Schema(
{
    author : String,
    title : String,
    tag : String,
    content : String,
    date :{type:Date,default:Date.now}
}
);
var notedbmodel = mongoose.model('notedbmodel',noteSchema);
var contentdbmodel = mongoose.model('contentdbmodel',contentSchema);

//insert data into db
var notedb = new notedbmodel({username:'xchen',password:'123456'});
console.log("usr:"+notedb.username+" passwd:"+notedb.password);
notedb.save();

//connect mongodb
mongoose.connect("mongodb://127.0.0.1:27017/notedb");
mongoose.connection.on('error',function(err){console.log("can not connect mongodb notedb "+err);});


// create express example
var app = express();
app.use(express.static('public'));
//define EJS template engine and template file position
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

//define static file directory
app.use(express.static(path.join(__dirname,'public')));

// define data parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// register part
app.get('/register.html',function(req,res)
{
    res.sendFile(__dirname+"/"+"register.html");
});

// login part
app.get('/login.html',function(req,res)
{
    res.sendFile(__dirname+"/"+"login.html");
});

// get data from register.html to db
app.get('/register_process_get',function(req,res)
{
    //register data output to mongodb
    response = {
	user_name:req.query.username,
	passwd:req.query.password,
	repeat_passwd:req.query.repeatpasswd};
    console.log(response);
    
    //req.body get every element in form
    var username = req.query.username;
    var password = req.query.password;
    var repeatpasswd = req.query.repeatpasswd;
   
    //check repeat
    
    //use callback function get usernamedata from collection.findOne
    notedbmodel.findOne({username:username},function(err,usern){
	//if(err){
	//    console.log(err);
	//    return res.redirect("/register.html");
	//}
	if(usern)
	{
	    console.log("username:"+username+" have existed!");
	    return res.redirect("/register.html");
	}
  	//because the async of nodejs the insert part should be put in this {},if after this{},program will process this part           //so that findone part can not get callback data
        //insert a new user info
        var newUser = new notedbmodel({username:username,password:password});
        console.log("new user:"+username+" "+password);
        newUser.save();
        return res.redirect("/");
    });
});
app.get('/login_process_get',function(req,res)
{
    //login data output by json
    response= {
	user_name:req.query.username,
	passwd:req.query.password};
    console.log(response);
   // res.end(JSON.stringify(response));
    var username = req.query.username;
    var password = req.query.password;
    notedbmodel.findOne({username:username},function(err,usern){
	if(!usern)
	{
	    console.log("user don't exist");
	}else
	{
	    if(usern.password == password)
	    {
		console.log("login in successfully!");
		res.redirect("/");
	    }else
	    {
		console.log("wrong password!");
		res.redirect("/login.html");
	    }
	}
    });
});
app.get('/content_process_get',function(req,res){
    var noteContent = new contentdbmodel({
        title : req.query.title,
	tag : req.query.tag,
	content : req.query.content
    });
    console.log("title:"+noteContent.title);
    console.log("tag:"+noteContent.tag);
    console.log("content:"+noteContent.content);
    noteContent.save();
    console.log("save note successfully!");
});

//refect to main get require
app.get('/',function(req,res)
{
    res.render('index',{title:'first page'});
});
app.get('/register',function(req,res)
{
    console.log('resgister');
    res.render('register',{title:'register'});
});
app.get('/login',function(req,res)
{
    console.log('login');
    res.render('login',{title:'login'});
});
app.get('/quit',function(req,res)
{
    console.log('quit');
    return res.redirect('/login');
});
app.get('/post',function(req,res)
{
    console.log('post');
    return res.sendFile(__dirname+"/"+"/post.html");
    //res.render('post',{title:'post'});
   // var noteContent = new contentdbmodel({
//	title : req.query.title,
//	content : req.query.title,
 //	tag : req.query.tag
   // });
   // console.log("title:"+noteContent.title);
   // console.log("tag:"+noteContent.tag);
   // console.log("content:"+noteContent.content);
});
app.get('/detail/',function(req,res)
{
    console.log('check notes');
    res.render('detail',{title:'check notes'});
});
app.listen(3000,function(req,res)
{
    console.log('app is running at port 3000');
});
