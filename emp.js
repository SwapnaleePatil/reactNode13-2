var mongoose =require('mongoose');
var express=require('express');
var bodyParser=require('body-parser');
var validator=require('validator');
var jwt=require('jsonwebtoken')
const _ = require('lodash');
var bcrypt=require('bcryptjs');

mongoose.Promise=global.Promise;
mongoose.connect("mongodb://localhost:27017/reactapp");
var app=express();

app.use(bodyParser.json());
var empSchema=new mongoose.Schema({
    ename:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        validate:{
            validator:validator.isEmail,
            message:'{Value} is not valid Email'
        }
    },
    password:{
        type:String,
        minlength:6,
        maxlength:32
    },
    pno:{
        type:String
    },
    gender:{
        type:String
    },
    city:{
        type:String
    },
    agree:{
        type:Number
    },
    tokens:[{
        access:{
            type:String,
            required:true
        },
        token:{
            type:String,
            required:true
        }

    }]},
    {
    usePushEach:true

});
empSchema.methods.generateAuthToken=function(){
    var emp=this;
    var access='auth';
    var token=jwt.sign(
        {
            _id:emp._id.toHexString(),
            access
        },
        'abc123'
    ).toString();
    emp.tokens.push({access,token});

    return emp.save().then(()=>{
        console.log("Token",token)
        return token;
    })

}

empSchema.pre('save',function (next) {
    const emp=this;
    if(emp.isModified('password')){
        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(emp.password,salt,(err,hash)=>{
                emp.password=hash;
                next();
            })
        })
    }
    else{
        next();
    }
})

var emp=mongoose.model('emp',empSchema);


app.use((req,res,next) =>{

    res.header('Access-Control-Allow-Origin',' http://localhost:3000');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    next();
});
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
