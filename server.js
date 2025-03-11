const express=require('express');
const connectDB=require('./db');

const app=express();
const cors=require('cors');
app.use(
  cors(
    {
    origin: "*",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "id"],
  }
)
);

const userAPI=require('./routes/user-routes');
const taskAPI=require('./routes/task-routes');
const statsAPI=require('./routes/stats-routes');

const port=5000;

app.use(express.json());
app.use("/api/auth/",userAPI);
app.use("/api/tasks/",taskAPI);
app.use('/api/stats/',statsAPI);

connectDB();

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});