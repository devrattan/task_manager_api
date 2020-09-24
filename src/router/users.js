const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');

const {sendWelcomeEmail,sendCancellationEmail} = require('../emails/account');
const User = require('../model/user');
const auth = require('../middleware/auth')



router.post('/user', async (req,res)=>{
    console.log(req.body);
    let user = new User(req.body);
    
    try {
      await user.save();
      sendWelcomeEmail(user.email,user.name);
      let token = await user.generateAuthToken();
      res.status(201).send({user,token});
    } catch(e){
       res.status(400).send(e);
    }
});

router.post('/user/login' ,async (req,res)=>{
  try{
      let user = await User.findUserByCredentials(req.body.email,req.body.password);
     
      if(!user){
      return res.status(404)
      }
      let token = await user.generateAuthToken();
      res.send({user,token});
  } catch(e) {
      res.status(400).send(e);
  }

})

router.post('/user/logout',auth, async (req,res)=>{
try {
     req.user.tokens = req.user.tokens.filter((token)=>{
     return token.token !== req.token
   })

   await req.user.save();
   
   res.send()
} catch (e) {
   res.status(500).send();
}

})

router.get('/user/me',auth, async (req,res)=>{
   res.send(req.user);
})

router.patch('/user/me',auth, async (req,res)=>{
    let updates = Object.keys(req.body);
    
    let allowedupdates = ['name','age','email','password'];
    let validUpdates = updates.every((update)=>allowedupdates.includes(update))
    
    console.log('validUpdates',validUpdates);
    if(!validUpdates){
      return res.status(400).send({'error':'Invalid update'});
    }

    try {
        updates.forEach((update)=> req.user[update] = req.body[update])
        await req.user.save();
       res.send(req.user);
    } catch(e) {
        res.status(400).send(e);
    }
})

router.delete('/user/me', auth,async (req,res)=>{
    try{
    sendCancellationEmail(req.user.email,req.user.name);  
    await req.user.remove();
    res.send(req.user);
    } catch(e) {
      res.status(500).send(e);
    }
  });


  router.post('/user/logoutall',auth,async (req,res)=> {
    try {
       req.user.tokens = [];
       await req.user.save();
       res.send();
    } catch (e) {
      res.status(500).send()
    }
  });

  const upload = multer({
      limits : {
      fileSize: 1000000
    },
    fileFilter(req,files,cb) {
      if(!files.originalname.match(/\.(jpg|jpeg|png)$/)){
            cb(new Error('Please enter a valid image format'));
      }
      cb(undefined,true);
    }
  })

  router.post('/user/me/avatar',auth,upload.single('avatar'), async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:200,height:300}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send()
  },(error,req,res,next)=>{
    res.status(400).send({error:error.message})
  })

  router.delete('/user/me/avatar',auth,async (req,res)=>{
    if(req.user.avatar){
     console.log('abc')    
    req.user.avatar = undefined;
    }
    console.log(req.user)
    await req.user.save();
    res.send();
  })

  router.get('/users/:id/avatar', async (req,res)=>{
    try {

      let user = await User.findById(req.params.id);

      if(!user && !user.avatar) {
        throw new Error('no user or no profile picture present');
      }

      res.set('Content-Type','image/png');
      res.send(user.avatar)
     } catch (e) {
      res.status(404).send('error',e.message);
    }
  })

  module.exports = router;