const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8zhi6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const collection = client.db("I-House").collection("Items");

        app.post('/item', async (req, res) => {
            const newItem = req.body;
            console.log(newItem);
            const result = await collection.insertOne(newItem);
            res.send(result);
        });

        app.get('/item', async (req, res) => {
            const query = {};
            const cursor = collection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });

        app.get('/myItem', async(req, res) =>{
            const email = req.query.email;
            const query = {email};
            const cursor = collection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        })

        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            console.log(query);
            const singleItem = await collection.findOne(query);
            res.send(singleItem);

        })

        app.put('/item/:id', async (req, res) => {
            const id = req.params.id;
            const updatedService = req.body;
            console.log(updatedService)
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    productName: updatedService.productName,
                    price: updatedService.price,
                    quantity: updatedService.quantity,
                    image: updatedService.image,
                    supplier: updatedService.supplier,
                    description: updatedService.description,
                }
            };
            const result = await collection.updateOne(query, updateDoc, options);
            res.send(result);


        })

        app.delete('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            console.log(query);
            const result = await collection.deleteOne(query);
            res.send(result);
        })



    } finally {
        /* await client.close(); */
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('running I-House Backend')
});

app.listen(port, () => {
    console.log('I-House server running');
});
