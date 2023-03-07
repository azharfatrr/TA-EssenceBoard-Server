require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = "mongodb://localhost:27017";
const Koa = require('koa');
const app = new Koa();
const router = require('koa-router');
var bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const db = require('./res/mongo');
const ObjectID = require("mongodb").ObjectID;
require('koa-qs')(app, 'strict');
const fs = require('fs');

app.use(bodyParser({
  detectJSON: function (ctx) {
    return /\.json$/i.test(ctx.path);
  },
  extendTypes: {
    json: ['application/x-javascript'] // will parse application/x-javascript type body as a JSON string
  },

}));
app.use(cors());

const index = new router();

index.get('/', function (ctx, next) {
  ctx.status = 200;
  ctx.body = "Essence Editor Server is Online";
});

// List all people
index.get("/method", async (ctx) => {
  await MongoClient.connect(MONGO_URL, { useNewUrlParser: true })
    .then(async (connection) => {
      await connection.db("essence").collection('method').find({}).toArray().then((result) => {
        console.log("Database connection established");
        ctx.body = JSON.stringify(result);
      }).catch((err) => console.error(err));


    })
    .catch((err) => console.error(err));
});

index.get("/method/:id", async (ctx) => {
  await MongoClient.connect(MONGO_URL, { useNewUrlParser: true })
    .then(async (connection) => {
      await connection.db("essence")
        .collection('method')
        .findOne({ "_id": ObjectID(ctx.params.id) })
        .then((result) => {
          console.log("Database connection established");
          ctx.body = JSON.stringify(result);
        }).catch((err) => console.error(err));


    })
    .catch((err) => console.error(err));
});

index.put("/method/:id", async (ctx) => {
  var newValues = { $set: ctx.request.body };
  let connection = await MongoClient.connect(MONGO_URL, { useNewUrlParser: true });

  if (ObjectID.isValid(ctx.params.id)) {
    await connection.db("essence").collection('method')
      .updateOne({ "_id": ObjectID(ctx.params.id) }, newValues, { upsert: true })
      .then((result) => {
        ctx.body = JSON.stringify(result);
      })
      .catch((err) => console.error(err));
    return;
  }

  await connection.db("essence").collection('method')
    .updateOne({ "nameId": ctx.params.id }, newValues, { upsert: true })
    .then((result) => {
      ctx.body = JSON.stringify(result);
    })
    .catch((err) => console.error(err));
});

index.post("/method", async (ctx) => {
  console.log(ctx.request.body);
  await MongoClient.connect(MONGO_URL, { useNewUrlParser: true })
    .then(async (connection) => {
      await connection.db("essence")
        .collection('method')
        .insertOne(ctx.request.body)
        .then((result) => {
          console.log("Created Data Method");

          ctx.body = JSON.stringify(result);
        }).catch((err) => {
          console.error(err);

        });


    })
    .catch((err) => console.error(err));
});

index.post("/example/:id", async (ctx) => {
  console.log(ctx.request.body);
  await MongoClient.connect(MONGO_URL, { useNewUrlParser: true })
    .then(async (connection) => {
      await connection.db("essence")
        .collection('example')
        .findOne({ "_id": ObjectID(ctx.params.id) })
        .then(async (result) => {
          ctx.request.body.edge = result.edge;
          ctx.request.body.essence_kernel = result.essence_kernel;

          await MongoClient.connect(MONGO_URL, { useNewUrlParser: true })
            .then(async (connection) => {
              await connection.db("essence")
                .collection('method')
                .insertOne(ctx.request.body)
                .then((res) => {
                  console.log("Created Data Method");

                  ctx.body = JSON.stringify(res);
                }).catch((err) => {
                  console.error(err);
                });
            })
            .catch((err) => console.error(err));
        }).catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
});

index.post("/rules", async (ctx) => {
  await MongoClient.connect(MONGO_URL, { useNewUrlParser: true })
    .then(async (connection) => {
      await connection.db("essence")
        .collection('rule')
        .insertOne(ctx.request.body)
        .then((result) => {
          ctx.body = JSON.stringify(result);
        }).catch((err) => {
          console.error(err);
        });
    })
    .catch((err) => console.error(err));
});

index.get("/rules", async (ctx) => {
  await MongoClient.connect(MONGO_URL, { useNewUrlParser: true })
    .then(async (connection) => {
      await connection.db("essence").collection('rule').find({}).toArray().then((result) => {
        console.log("Database connection established");
        ctx.body = JSON.stringify(result);
      }).catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
});

index.put("/rules/:id", async (ctx) => {
  delete ctx.request.body._id;
  delete ctx.request.body.color;
  var newvalues = { $set: ctx.request.body };

  await MongoClient.connect(MONGO_URL, { useNewUrlParser: true })
    .then(async (connection) => {
      await connection.db("essence").collection('rule')
        .updateOne({ "_id": ObjectID(ctx.params.id) }, newvalues).then((result) => {
          console.log("Database connection established");
          ctx.body = JSON.stringify(result);
        }).catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
});

app.use(index.routes()).use(index.allowedMethods());

let port = process.env.PORT;
app.listen(port);
console.log("App is listening. Port " + port);
