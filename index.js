const express = require('express');
const mongoose = require('mongoose');
const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT } = require('./config/config');
const session = require('express-session');
const { createClient } = require('redis');
const cors = require('cors');

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

app.enable('trust proxy');
app.use(cors({}));
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

app.get('/api/v1', (req, res) => {
  res.send('<h2>Hi, there!!!</h2>');
  console.log('yeah it ran');
});
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/users', userRouter);

app.listen(port, () => console.log(`listening on port ${port}`));
