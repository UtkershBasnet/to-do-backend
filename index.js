require('dotenv').config();
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const {userModel , todoModel} = require("./db");
const {z} = require("zod");

mongoose.connect(process.env.MONGO_URL);

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());

//input validations using zod

app.post("/signup",async function(req,res){

    const requiredBody = z.object({
        email : z.string().min(3).max(100).email(),          
        username : z.string().min(3).max(100),
        password : z.string().min(3).max(100)
    })

    // const parsedData = requiredBody.parse(req.body);
    const parseDataWithSuccess = requiredBody.safeParse(req.body);
    if(parseDataWithSuccess.success == false){
        return res.status(400).json({
            message: "Invalid data",
            error: parseDataWithSuccess.error
        })
    }

    const username = req.body.username;
    const password  = req.body.password;
    const email = req.body.email;


    let errorThrown = false;
    try{                                           
        const hashedPassword = await bcrypt.hash(password, 5)      
    
        await userModel.create({                    
            email: email,
            password: hashedPassword,
            username: username
        });
    }catch(e){
        res.json({
            "message": "User already exist!"
        });
        errorThrown = true
    }

    if(!errorThrown){
        res.json({
            "message": "You are signed up!"
        });
    }    
})
function auth(req,res,next){
    const token = req.headers.authorization;
    const decodedData = jwt.verify(token,JWT_SECRET);

    console.log(decodedData);

    if(decodedData){
        req.userId = decodedData.id;
        next();
    }
    else{
        res.status(403).json({
            message: "Invalid token"
        })
    }
}

app.post("/signin",async function(req,res){
    const username = req.body.username;
    const password  = req.body.password;

   const foundUser = await userModel.findOne({
        username: username,
   })

   if(!foundUser){
       return res.status(403).json({
           message: "Invalid username or password"
       })
    }

    const isPasswordCorrect = await bcrypt.compare(password,foundUser.password);
   
    if(isPasswordCorrect){    
        const token = jwt.sign({
            id: foundUser._id.toString()
        },JWT_SECRET);
        res.json({
            message: "Login successfull",
            token: token
        })
    }else{
        res.status(403).json({
            message: "Invalid username or password"
        })
    }
})

app.post("/todo",auth,async function(req,res){
    const userId = req.userId;
    const title = req.body.title;
    const done = req.body.done;

    await todoModel.create({
        title: title,
        done: done,
        userId: userId
    })

    res.json({
        message: "Todo created successfully"
    })
})

app.get("/todos",auth,async function(req,res){
    const userId = req.userId;
    const todos = await todoModel.find({
        userId: userId
    });

    res.json({
        todos: todos
    })

})

// app.get("/sum",function(req,res){
//     const a = parseInt(req.query.a);
//     const b = parseInt(req.query.b);      
//     res.send("The sum of "+a+" and "+b+" is "+(a+b));
// })


//Middleware:
// It may or may not change the request object
// It will either stop the request right there 
// or forward the request to the next middleware

app.listen(3000);