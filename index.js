const express = require('express');
const mongoose = require('mongoose');
const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT } = require('./config/config');
const session = require('express-session');

// Initialize client.

const { createClient } = require('redis');
let redisClient = createClient({
  host: 'redis',
  port: 6379,
});
redisClient.connect().catch(console.error);

const RedisStore = require('connect-redis').default;
let redisStore = new RedisStore({
  client: redisClient,
  prefix: 'myapp:',
});

const postRouter = require('./routes/postRoute');
const userRouter = require('./routes/userRoute');
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

// Initialize sesssion storage.
app.use(
  session({
    store: redisStore,
    resave: false, // required: force lightweight session keep alive (touch)
    saveUninitialized: false, // recommended: only save session when data exists
    secret: 'keyboard cat',
  })
);

connectWithRetry();

app.use(express.json());

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('<h2>Hi, there!!!</h2>');
});
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/users', userRouter);

app.listen(port, () => console.log(`listening on port ${port}`));
