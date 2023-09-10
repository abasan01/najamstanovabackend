/* Importovi */
import express from "express"
import cors from "cors"
import Chat from "../Models/Chat.js"
import Ad from "../Models/Ad.js"
import User from "../Models/User.js"
import auth from "./auth.js"
import {
    Server
} from "socket.io"
import http from "http"

/* Konstante za spajanje */
const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

import connect from '../initDB.js';

await connect()



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

        const ads = await query.populate("createdBy").exec();
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
        const id = req.params.id
        const ad = await Ad.findById(id).populate("createdBy");
        console.log("ad: ", ad)
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
app.post("/upload", [auth.verify], async (req, res) => {
    try {
        console.log("/upload")
        const user = await User.findOne({
            email: req.body.createdBy
        });
        req.body.createdBy = user
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
app.patch("/upload/:id", [auth.verify], async (req, res) => {
    try {
        console.log("/upload patch")
        const id = req.params.id

        const user = await User.findOne({
            email: req.body.createdBy
        });
        req.body.createdBy = user

        const body = req.body

        const ads = await Ad.findByIdAndUpdate(id, body)


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

/* POST za poruke */
app.post("/messages", async (req, res) => {
    try {
        console.log("req.body: ", req.body)
        const user = await auth.userInfo(req)
        const body = req.body
        const data = await Chat.create({
            message: {
                text: body.message
            },
            users: [body.from, body.to],
            // @ts-ignore
            sender: user._id,
        });
        if (data) return res.json({
            msg: "Uspijeh!"
        })
        return res.json({
            msg: "Neuspijeh"
        })
    } catch (e) {
        console.error(e)
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
})

/* GET za poruke */
app.get("/messages", async (req, res) => {
    try {
        console.log(req.query)
        const data = req.query
        const messages = await Chat.find({
                users: {
                    $all: [data.from, data.to]
                }
            })
            .sort({
                updatedAt: 1
            })
        console.log(messages)

        const mappedMessages = messages.map((item) => {
            return {
                id: item._id,
                type: item.sender.toString() === data.from,
                // @ts-ignore
                message: item.message.text,
            }
        })
        return res.json(mappedMessages)
    } catch (e) {
        console.error(e)
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
})

/* GET za listu korisnika s kojim se dopisujemo */
/* napomena dodati auth */
app.get("/conversations", [auth.verify], async (req, res) => {
    try {
        const userId = await auth.userInfo(req)
        const user = await User.findById(userId).populate("conversations")
        res.json(user)
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
        console.log(savedDoc)
        res.json(savedDoc)
    } catch (e) {
        console.error(e.message)
        res.status(500).send({
            error: e.message
        })
    }
})

/* GET za provjeru autorizacije */
app.get("/auth", [auth.verify], async (req, res) => {
    try {
        res.json(true)
    } catch (e) {
        console.error(e.message)
        res.status(500).send({
            error: e.message
        })
    }
})

const httpServer = app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
});

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:8080",
        credentials: true,
    },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
    io.emit('my broadcast', `server`);
    console.log('a user connected');
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
        global.onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) => {
        console.log("data: ", data)
        const sendUserSocket = global.onlineUsers.get(data.to);
        console.log("from: ", global.onlineUsers.get(data.from))
        console.log("to: ", global.onlineUsers.get(data.to))
        if (sendUserSocket) {
            io.to(sendUserSocket).emit("msg-recieve", data);
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});