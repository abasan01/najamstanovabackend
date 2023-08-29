/* Importovi */
import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import Test from "../Models/Test.js"
import Ad from "../Models/Ad.js"
import User from "../Models/User.js"
import jwt from "jsonwebtoken"
import auth from "./auth.js"

/* Konstante za spajanje */
const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

import connect from '../initDB.js';

await connect()

app.post('/add-test', async (req, res) => {
    try {
        const newData = {
            name: "test",
            age: 1
        };
        const createdData = await Test.create(newData);

        console.log('New data inserted:', createdData);
        res.status(201).json(createdData);
    } catch (error) {
        console.error('Error inserting data:', error.message);
        res.status(500).json({
            error: 'Internal Server Error',
        });
    }
});

app.get('/get-tests', async (req, res) => {
    try {
        const tests = await Test.find(); // Retrieve all documents

        console.log('Retrieved tests:', tests);
        res.status(200).json(tests);
    } catch (error) {
        console.error('Error retrieving tests:', error.message);
        res.status(500).json({
            error: 'Internal Server Error',
        });
    }
});

/* Glavna stranica */

/* GET za oglase */

app.get("/ads", async (req, res) => {
    try {
        const filters = {
            location: new RegExp(String(req.query.location), "i"),
            price: {
                min: req.query.minPrice || null,
                max: req.query.maxPrice || null,
            },
            rooms: {
                min: req.query.minRooms || null,
                max: req.query.maxRooms || null,
            },
            surface: {
                min: req.query.minSurface || null,
                max: req.query.maxSurface || null,
            },
            parking: req.query.parking || null,
            pets: req.query.pets || null,
            smoking: req.query.smoking || null,
            season: req.query.season || null,
            furnished: req.query.furnished || null,
            floors: {
                min: req.query.minFloors || null,
                max: req.query.maxFloors || null,
            },
            lift: req.query.lift || null,
        }

        /* query za filtriranje, ulančani ifovi kako se nepotrebno ne bi izvodio query za nešto što korisniku nije bitno */
        const query = Ad.find()

        if (req.query.location) query.where("location").regex(filters.location);
        if (filters.price.min) query.where("price").gte(Number(filters.price.min));
        if (filters.price.max) query.where("price").lte(Number(filters.price.max))
        if (filters.surface.min) query.where("surface").gte(Number(filters.surface.min))
        if (filters.surface.max) query.where("surface").lte(Number(filters.surface.max))
        if (filters.rooms.min) query.where("rooms").gte(Number(filters.rooms.min))
        if (filters.rooms.max) query.where("rooms").lte(Number(filters.rooms.max))
        if (filters.parking) query.where("parking").equals(true)
        if (filters.pets) query.where("pets").equals(true)
        if (filters.smoking) query.where("smoking").equals(true)
        if (filters.season) query.where("season").equals(true)
        if (filters.furnished) query.where("furnished").equals(true)
        if (filters.floors.min) query.where("floors").gte(Number(filters.floors.min))
        if (filters.floors.max) query.where("floors").lte(Number(filters.floors.max))
        if (filters.lift) query.where("lift").equals(true)

        console.log("query: ", query)
        console.log("filters: ", filters)

        const ads = await query.exec();
        res.json(ads)
    } catch (e) {
        console.error(e.message)
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
})

/* GET za specifični oglas */
app.get("/ads/:id", async (req, res) => {
    try {
        /* Podaci za filtriranje oglasa */
        const id = req.params.id
        const ad = await Ad.findById(id)
        res.json(ad)
    } catch (e) {
        console.error(e)
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
})

/* Izrada oglasa */

/* POST za oglas */
/* napomena dodati auth */
app.post("/upload", [auth.verify], async (req, res) => {
    try {
        console.log("/upload")
        const body = req.body
        console.log("body: ", body)
        const ads = await Ad.create(
            body
        )
        res.json(`ads: ${ads}`)
    } catch (e) {
        console.error(e)
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
})

/* PATCH za oglas */
/* napomena dodati auth */
app.patch("/upload/:id", async (req, res) => {
    try {
        const body = req.body
        const id = req.params.id

        console.log("body: ", body)
        res.json(`body: ${body}, id: ${id}`)
    } catch (e) {
        console.error(e)
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
})

/* DELETE za oglas */
/* napomena dodati auth */
app.delete("/upload/:id", async (req, res) => {
    try {
        const id = req.params.id

        res.json(`Oglas obrisan: ${id}`)
    } catch (e) {
        console.error(e)
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
})

/* Dio za poruke */

/* GET za poruke */
/* napomena dodati auth */
app.get("/messages/:id", async (req, res) => {
    try {
        const id = req.params.id

        res.json(`Poruke iz chata: ${id}`)
    } catch (e) {
        console.error(e)
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
})

/* GET za listu korisnika s kojim se dopisujemo */
/* napomena dodati auth */
app.get("/messages/", async (req, res) => {
    try {
        const conversations = "test"
        res.json(`Lista korisnika: ${conversations}`)
    } catch (e) {
        console.error(e)
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
})

/* POST za poruke */
/* napomena dodati auth */
app.post("/messages/:id", async (req, res) => {
    try {
        const id = req.params.id
        const message = req.body

        res.json(`Poruke iz chata: ${id}, message: ${message}`)
    } catch (e) {
        console.error(e)
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
})

/* Dio za user */

/* PATCH za login */
app.patch("/login", async (req, res) => {
    try {
        /* Tražimo korisnika */
        const user = await User.findOne({
            email: req.body.email
        });
        /* Provjera u slučaju da ne nađemo korisnika */
        if (!user) {
            throw new Error("Can't find user!")
        }
        console.log("user: ", user)

        const authCheck = await auth.authenticateUser(user, req.body.pass) /* Provjerava ako je lozinka točna, dobivamo nazad token */
        user.status = true,
            await user.save() /* Postavljamo da je korisnik online */
        res.json(authCheck)
    } catch (e) {
        console.error(e.message)
        res.status(500).send({
            error: e.message
        })
    }
})

/* PATCH za logout */
app.patch("/logout", async (req, res) => {
    try {
        console.log("user: ", req.body)
        /* Tražimo korisnika */
        const user = await User.findOne({
            email: req.body.email
        });
        /* Provjera u slučaju da ne nađemo korisnika */
        if (!user) {
            throw new Error("Can't find user!")
        }
        console.log("user: ", user)

        user.status = false,
            await user.save() /* Postavljamo da je korisnik offline */
        res.json("success")
    } catch (e) {
        console.error(e.message)
        res.status(500).send({
            error: e.message
        })
    }
})

/* POST za signup */
app.post("/signup", async (req, res) => {
    try {
        const newUser = req.body
        const savedDoc = await auth.registerUser(newUser)
        res.json(savedDoc)
    } catch (e) {
        console.error(e.message)
        res.status(500).send({
            error: e.message
        })
    }
})


app.listen(port, () => console.log(`Slušam na portu ${port}!`))