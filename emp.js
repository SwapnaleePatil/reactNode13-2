var mongoose =require('mongoose');
mongoose.Promise=global.Promise;
var express=require('express');
var bodyParser=require('body-parser');
var validator=require('validator');
var jwt=require('jsonwebtoken')
const _ = require('lodash');
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
    console.log("Req:",req.body);

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

app.post('findbyid',(req,res)=>{
    let id=req.body.id;

    emp.find({_id:id}).then((emp)=>{
        if(!emp)
        {
            console.log(`${id} Id Not Found `);
            res.status(404).send();
        }

        res.send(emp);
    }).catch((e)=>{
        console.log(`Error : ${e.message}`);
        res.status(404).send();
    });
});
app.patch('update',(req,res)=>{
    let body=_.pick(req.body,['id','ename','email','password','pno','gender','city','agree']);
    let id=body.id;

    Student.findByIdAndUpdate(id,{$set:body}).then((student)=>{
        if(!student){
            console.log(`${id} Id Not Found`);
            res.status(404).send();
        }
        res.send(student);
    }).catch((e)=>{
        console.log(`Error : ${e.message}`);
    });
});

app.listen('5000');
