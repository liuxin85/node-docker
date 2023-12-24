const express = require('express');
const mongoose = require('mongoose');
const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT } = require('./config/config');

const postRouter = require('./routes/postRoute');
const userrouter = require('./routes/userRoute');
const app = express();

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = () => {
  mongoose
    .connect(mongoURL)
    .then(() => console.log('successfully connected to DB'))
    .catch((e) => {
      console.log(e);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

app.use(express.json());

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('<h2>Hi, there!!!</h2>');
});
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/users', userrouter);

app.listen(port, () => console.log(`listening on port ${port}`));
