var {emp} = require('../modal/emp');

var authenticatee = (req, res, next) => {
    var token = req.header('x-auth');
console.log("token",token);
    emp.findByToken(token).then((emp) => {
        console.log(emp);
        if (!emp) {
           console.log("user Not Found with Error");
        }

        req.emp = emp;
        req.token = token;
        next();
    }).catch((e) => {
        res.status(401).send();
    });
};

module.exports = {authenticatee};
