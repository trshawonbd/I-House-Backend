const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function jwtVerify  (req, res, next) {
    const jwtHeader = req.headers.authorization;
    if(!jwtHeader){
        return res.status(401).send({message: 'unauthorized access'});
    }
    const token = jwtHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(error, decoded)=>{
        if(error){
            return res.status(403).send({message: 'Forbidden Access'});
        }
        console.log('decode', decoded);
        req.decoded = decoded;
    })
    next();
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8zhi6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const collection = client.db("I-House").collection("Items");
        //JWT
        app.post('/login', async(req,res) =>{
            
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{
                expiresIn: '1d'
            });
            res.send({accessToken});


        })



        //website API
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

        app.get('/myItem', jwtVerify, async (req, res) =>{
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if(email === decodedEmail){
                const query = {email};
           const cursor = collection.find(query);
           const items = await cursor.toArray();
           res.send(items);
       }
       else{
           res.status(403).send({message: 'forbidden access'})
       }
            
        
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
