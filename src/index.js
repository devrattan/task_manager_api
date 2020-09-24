const express = require('express');
const app = express();
require('./db/mongoose');
const userRouter = require('./router/users');
const taskRouter = require('./router/tasks');

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

const port = process.env.PORT ;

app.listen(port,()=>{
    console.log('the port is listening at '+port);
})

