var mongoose =require('mongoose');
var express=require('express');
var bodyParser=require('body-parser');
var validator=require('validator');
var jwt=require('jsonwebtoken')
const _ = require('lodash');
var bcrypt=require('bcryptjs');

mongoose.Promise=global.Promise;
mongoose.connect("mongodb://localhost:27017/reactapp");

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


empSchema.methods.toJSON=function () {
    var emp=this;
 var empObject=emp.toObject();

 return _.pick(empObject,['_id','ename','email','password','gender','city','pno','agree']);

}
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
empSchema.methods.removeToken=function (token) {
    var emp=this;
    return emp.update({
        $pull:{
            tokens:{
                token:token
            }
        }
    })
}
empSchema.statics.findByToken=function (token) {
    var emp=this;
    var decoded='';

    try {
        decoded = jwt.verify(token, 'abc123');
    } catch (e) {
        console.log("Error", e);
    }
    return emp.findOne({
        '_id': decoded._id,
        'tokens.access': 'auth',
        'tokens.token': token
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
module.exports={emp};
