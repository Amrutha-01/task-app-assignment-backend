const router = require("express").Router();
const Task = require("../models/task");

router.get('/summary-stats', async (req, res) => {
    try {
        const totalTasks = await Task.countDocuments();
        const completedTasks = await Task.countDocuments({ status: 'completed' });
        const pendingTasks = await Task.countDocuments({ status: "pending" });
        const completedPercentage = (completedTasks / totalTasks) * 100 ;
        const pendingPercentage = (pendingTasks / totalTasks) * 100;
        
        const completedTaskTimes = await Task.find(
          { status: "completed" },
          { startTime: 1, endTime: 1 }
        );

        let totalCompletedTime = 0;
        completedTaskTimes.forEach((task) => {
          totalCompletedTime +=
            (new Date(task.endTime) - new Date(task.startTime)) /
            (1000 * 60 * 60); 
        });

        const avgCompletionTime = completedTasks > 0 ? totalCompletedTime / completedTasks : 0;
        res.status(200).json({
            totalTasks,
            completedPercentage,
            pendingPercentage,
            avgCompletionTime
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});

router.get('/pending-tasks-summary', async (req, res) => {
    try {
        const pendingTasksCount = await Task.countDocuments({ status: "pending" });
        const pendingTasks = await Task.find({ status: 'pending' }).sort({ priority: 1 }).limit(5);
        
        let totalTimeLapsed=0;
        pendingTasks.map(task => {
            totalTimeLapsed+= (new Date() - new Date(task.startTime)) / (1000 * 60 * 60);
        });

        let totalTimeToFinish=0;
        pendingTasks.forEach((task) => {
          totalTimeToFinish +=
            (new Date(task.endTime) - new Date(task.startTime)) /
            (1000 * 60 * 60);
        });
        
        res.status(200).json({
            pendingTasksCount,
            totalTimeLapsed,
            totalTimeToFinish,
            pendingTasks: pendingTasks
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});

module.exports = router;