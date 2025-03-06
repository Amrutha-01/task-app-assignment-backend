const router= require('express').Router();
const Task=require('../models/task');
const User=require('../models/user');
const authenticateToken=require('./authenticate');

router.post('/add-task', authenticateToken ,async(req,res)=>{
    try{
        const {title,startTime,endTime,status,priority}=req.body;
        const {id}=req.headers;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const newTask=new Task({
            title,
            startTime,
            endTime,
            status,
            priority
        });
        const savedTask=await newTask.save();
        const taskId=savedTask._id;
        await User.findByIdAndUpdate(id,{
            $push:{
                tasks:taskId._id
            }
        });
        res.status(200).json({
            message:'Task added successfully'
        });
    }catch(error){
        console.error(error);
        res.status(500).json({
            message:'Internal Server Error'
        });
    }
});

router.get('/get-tasks',authenticateToken, async(req,res)=>{
    try{
        const {id}=req.headers;
        const { priority, status, sortBy, order } = req.query;
        
        const user=await User.findById(id).populate({
            path:'tasks',
            match:{
                priority:priority || { $exists: true },
                status:status || { $exists: true }
            },
            options: {
                sort: {
                    [sortBy]: order === "asc" ? 1 : -1,
                },
            }
        });

        if (!user){
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            tasks:user.tasks
        });
    }catch(error){
        console.error(error);
        res.status(500).json({
            message:'Internal Server Error'
        });
    }
});

router.put('/update-task', authenticateToken, async(req,res)=>{
    try{
        const {title,startTime,endTime,status,priority}=req.body;
        const {id}=req.headers;
        console.log(title,startTime,endTime,status,priority,id);
        const respone = await Task.findByIdAndUpdate(
          id,
          {
            title,
            startTime,
            endTime,
            status,
            priority,
          },
          { new: true } 
        );
        res.status(200).json({
            message:'Task updated successfully'
        });
    }catch(error){
        console.error(error);
        res.status(500).json({
            message:'Internal Server Error'
        });
    }
});

router.delete('/delete-task',authenticateToken, async(req,res)=>{
    try{
        const {id}=req.headers;
        const task = await Task.findById(id);
        if (!task) {
          return res.status(404).json({ message: "Task not found" });
        }
        await Task.findByIdAndDelete(id);
        await User.updateMany({},{
            $pull:{
                tasks:id
            }
        });
        res.status(200).json({
            message:'Task deleted successfully'
        });
    }catch(error){
        console.error(error);
        res.status(500).json({
            message:'Internal Server Error'
        });
    }
});

module.exports=router;