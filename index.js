const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;

// setting up middlewares
app.use(cors());
app.use(express.json());

// setting up database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.23ilw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("db connected");
    const database = client.db("TravelTour");
    const tourCollection = database.collection("Tours");
    const destinationCollection = database.collection("Destinations");
    const bookingCollection = database.collection("Bookings");

    // get api for loading tours
    app.get("/tours", async (req, res) => {
      const tours = await tourCollection.find({}).toArray();
      res.json(tours);
    });

    // get api to load destinations
    app.get("/destinations", async (req, res) => {
      const destinations = await destinationCollection.find({}).toArray();
      res.json(destinations);
    });

    // get api for loading single tour by id
    app.get("/booking/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: ObjectId(id) };
      const tour = await tourCollection.findOne(query);
      res.json(tour);
    });

    // post api for booking
    app.post("/booking/addBooking", async (req, res) => {
      const bookingOrder = req.body;
      console.log("hitting booking server");
      const result = await bookingCollection.insertOne(bookingOrder);
      res.json(result);
    });

    // get api for loading data form logged in user
    app.get("/myTours/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const result = await bookingCollection.find(query).toArray();
      res.json(result);
    });

    // delete api for deleting an user's tour
    app.delete("/deleteBooking/:id", async (req, res) => {
      console.log("hitting the delete server");
      const id = req.params.id;
      const query = { id: id };
      const result = await bookingCollection.deleteOne(query);
      res.json(result);
    });

    // api for loading booked tours by all users
    app.get("/allBookings", async (req, res) => {
      const allBookings = await bookingCollection.find({}).toArray();
      res.json(allBookings);
    });
    // put api for updating 'status'
    app.put("/booking/status", async (req, res) => {
      const status = req.body.bookingStatus;
      const id = req.body.id;
      const filter = { id: id };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: status,
        },
      };
      const result = await bookingCollection.updateOne(
        filter,
        updateDoc,
        options
      );

      res.json(result);
    });
    // post api for adding new tour by admin
    app.post("/tours/newTour", async (req, res) => {
      const newTour = req.body;
      const result = await tourCollection.insertOne(newTour);
      res.json(result);
    });
  } finally {
    //   await client.close()
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Runnig TravelTour Server on Port -5000");
});

app.listen(port, () => {
  console.log(`Running Server on port,${port}`);
});
