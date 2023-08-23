/* Importovi */
import express from 'express'
import cors from 'cors'
import jwt from "jsonwebtoken"

/* Konstante za spajanje */
const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

import db from '../initDB.js';

const test = await db();
console.log(test)

/* Glavna stranica */

/* GET za oglase */
app.get("/ads", async (req, res) => {
    try {
        const filters = {
            location: req.query.location,
            price: {
                min: req.query.minPrice,
                max: req.query.maxPrice
            }
        }
        res.json("filters")
    } catch (e) {
        console.error(e)
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
})

/* GET za specifični oglas */
app.get("/ads/:id", async (req, res) => {
    try {
        const id = req.params.id

        res.json("specifični oglas")
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
app.post("/upload", async (req, res) => {
    try {
        const body = req.body
        res.json(`body: ${body}`)
    } catch (e) {
        console.error(e)
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
})

/* PATCH za oglas */
/* napomena dodati auth */
app.patch("/upload:id", async (req, res) => {
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
app.delete("/upload:id", async (req, res) => {
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

/* POST za login */
app.post("/login", async (req, res) => {
    try {
        const user = req.body
        res.json(user)
    } catch (e) {
        res.status(500).send({
            error: e.message
        })
    }
})

/* POST za signup */
app.post("/signup", async (req, res) => {
    try {
        const newUser = req.body
        res.json(newUser)
    } catch (e) {
        res.status(500).send({
            error: e.message
        })
    }
})


app.listen(port, () => console.log(`Slušam na portu ${port}!`))