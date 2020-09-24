const express = require('express');
const router = express.Router();
const Task = require('../model/task');
const auth = require('../middleware/auth')

router.post('/tasks',auth, async (req,res)=>{
    let tasks = new Task({
    ...req.body,
    owner: req.user._id
  });
    try{
      await tasks.save();
      res.status(201).send(tasks)
    }catch(e){
      res.status(400).send(e)
    }
})

// get /tasks?completed=true/false or get all tasks
// get /tasks?limit=#&skip=#
// get /tasks?sortBy=createdAt_desc/completed_desc
router.get('/tasks',auth, async (req,res)=>{
   let match = {};
   let sort = {};
   if(req.query.completed){
      match.completed = req.query.completed === 'true'?true:false;
   } 
   if(req.query.sortBy) {
     let parts = req.query.sortBy.split('_');
     sort[parts[0]] = parts[1] === 'desc'? -1:1;
   }
   try { 
     await req.user.populate({
       'path':'tasks',
        match,
        options : {
          limit : parseInt(req.query.limit),
          skip  : parseInt(req.query.skip),
          sort 
        }
      }).execPopulate();
     res.send(req.user.tasks);
    } catch(e) {
       res.status(500).send(e);
    }
})

router.get('/tasks/:id',auth, async (req,res)=>{
    let _id = req.params.id
    try {
      let task =  await Task.findOne({_id, owner:req.user._id });
      if(!task){
          res.status(404);
      }
      res.send(task);
    } catch(e) {
      res.status(500).send(e);
    }

})


router.patch('/tasks/:id',auth,async (req,res)=>{
  let allowedUpdates = ['description','completed'];
  let updates = Object.keys(req.body);
  let isValidUpdate = updates.every((update)=>allowedUpdates.includes(update));


  if(!isValidUpdate){
    return res.status(400).send({'error':'invlalid Update'})
  }
 
  let _id = req.params.id

  try {

    let task = await Task.findOne({_id,owner:req.user._id});
    if(!task){
      res.status(404).send()
    }

    updates.forEach((update)=>task[update] = req.body[update]);

    await task.save();
    res.send(task);

  } catch(e) {
    
    res.status(500).send(e);
  } 

})

router.delete('/tasks/:id',auth, async (req,res)=>{
  try{
   let task = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id});
   if(!task){
     return res.status(404).send('');
   }

   res.send(task);
  } catch(e) {
    res.status(500).send(e);
  }
})

module.exports = router;