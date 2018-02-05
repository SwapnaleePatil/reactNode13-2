var mongoose =require('mongoose');
var express=require('express');
var bodyParser=require('body-parser');
var validator=require('validator');
var jwt=require('jsonwebtoken')
const _ = require('lodash');
var bcrypt=require('bcryptjs');
var {authenticatee}=require('./mid/authenticate');
var {emp}=require('./modal/emp');
var app=express();

const passport=require('passport');
const LocalStrategy=require('passport-local').Strategy;

app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next) =>{

    res.header('Access-Control-Allow-Origin',' http://localhost:3000');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

passport.serializeUser((emp,done)=>{
    console.log('Serialize');
    return done(null,emp);
})
passport.deserializeUser((emp,done)=>{
    console.log('Deserialize');
    return done(null,emp);
})

passport.use(new LocalStrategy ((username,password,done)=>{
    console.log("Username & password in Passport",username,password);
    emp.findOne({email:username},(err,user)=>{
        if(!user)
        {
            console.log("User Not Found");
        }
        if(user) {
            console.log("Email Found");
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                     console.log("Valid Password");
                }
                else {
                    // console.log("Alert");
                    console.log("Not valid");
                    return done(null,false);
                }
                return done(null,user);

            })
        }
    }).catch((e)=>{
        res.status(400).send();
    })
}))

app.post('/logP',passport.authenticate('local',{
    successRedirect: '/fetch',
    failureRedirect: '/logP',
}));



app.get('/',(req,res)=>{
    res.send("WelCOme To This Site");
});
app.post('/savedata',(req,res)=>{
    //console.log("Req:",req.body);

    var newEmp=new emp({

        ename:req.body.ename,
        email:req.body.email,
        password:req.body.password,
        pno:req.body.pno,
        gender:req.body.gender,
        city:req.body.city,
        agree:req.body.agree
    });

    newEmp.save().then(()=>{

            return newEmp.generateAuthToken();
        }
    ).then((token)=>{
        res.header('x-auth', token).send(newEmp);
    }).catch((e)=>{
        console.log("Error",e);
    });
});
app.get('/fetch',(req,res)=>{
    emp.find({},(err, emps)=>{
        if(err) throw error;
        console.log(emps)
        res.send(emps);
    });
})
app.post('/delete',(req,res)=>{
    let id=req.body.id;
    console.log(id);
    emp.findByIdAndRemove(id).then((emp)=>{
        if (!emp) {
            res.status(404).send();
        }
        res.send(emp);
    }).catch ((e)=>{
        console.log(`error : ${e.message}`);
        res.status(404).send();
    })
});
app.post('/edit',(req,res)=>{
    let id=req.body.id;
    console.log("Edit id",req.body.id);

    emp.find({_id:id}).then((emp)=>{
        if(!emp)
        {
            console.log(`${id} Id Not Found `);
            res.status(404).send();
        }
        console.log("Edit",emp);
        res.send(emp);
    }).catch((e)=>{
        console.log(`Error : ${e.message}`);
        res.status(404).send();
    });
});
app.post('/update',(req,res)=>{
    let body=_.pick(req.body,['id','ename','email','password','pno','gender','city','agree']);
    let id=req.body.id;
    console.log("Body:",body);
    emp.findByIdAndUpdate(id,{$set:body}).then((emp)=>{
        if(!emp){
            console.log(`${id} Id Not Found`);
            res.status(404).send();
        }
        res.send(emp);
    }).catch((e)=>{
        console.log(`Error : ${e.message}`);
    });
});
app.delete('/emp/tokend',authenticatee,(req,res)=>{
    req.emp.removeToken(req.token).then(()=>{
        res.status(200).send();
    }).catch((e)=>{
        res.status(400).send();
    })
})
app.get('/emp/me',authenticatee,(req,res)=> {
    res.send(req.emp);
})
app.post('/login',(req,res)=>{
    console.log(req.body.email);
    let email=req.body.email;
    let password=req.body.password;

    emp.findOne({email},(err,user)=>{
        if(user) {
            console.log("Email Found");

            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    // console.log("Success");
                    res.send(user);}
                else {
                    // console.log("Alert");
                    res.send("Alert");
                }
            })
        }
    }).catch((e)=>{
        res.status(400).send();
    })
//    res.send(body);
})
app.listen('5000');