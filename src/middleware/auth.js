const jwt = require('jsonwebtoken');
const User = require('../model/user')

const auth = async (req,res,next) => {
    try{
       
      let token    = req.header('Authorization').replace('Bearer ','');
      let decoded  = jwt.verify(token,process.env.JWT_SECRET);
      let user     = await User.findOne({"_id":decoded._id,"tokens.token":token});
      if(!user) {
        throw new Error();
      }
      console.log('2222');
      req.token = token;
      req.user = user;
      next();
    } catch(e) {
      res.status(401).send('error:validate user');
    }
}

module.exports = auth