// @ts-nocheck
/* Importovi */
import express from "express"
import cors from "cors"
import Chat from "../Models/Chat.js"
import Ad from "../Models/Ad.js"
import User from "../Models/User.js"
import auth from "./auth.js"
import {
    Server
}
from "socket.io"
import connect from '../initDB.js';

/* Konstante za spajanje */
const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

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

        const ads = await query.sort({
            updatedAt: -1
        }).populate("createdBy").select("-pass").exec();
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
        const ad = await Ad.findById(id).populate("createdBy").select("-pass");
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
        const user = await auth.userInfo(req)
        req.body.createdBy = user
        const body = req.body
        const ads = await Ad.create(
            body
        )
        res.json(ads)
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
        const id = req.params.id
        const body = req.body

        const ads = await Ad.findByIdAndUpdate(id, body)
        ads.save()

        res.json(ads)
    } catch (e) {
        console.error(e)
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
})

/* DELETE za oglas */
app.delete("/upload/:id", [auth.verify], async (req, res) => {
    try {
        const id = req.params.id

        await Ad.findByIdAndDelete(id)

        res.json(`Oglas obrisan`)
    } catch (e) {
        console.error(e)
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
})

/* Dio za poruke */

/* POST za poruke */
app.post("/messages", [auth.verify], async (req, res) => {
    try {
        const user = await auth.userInfo(req)
        const body = req.body
        const data = await Chat.create({
            message: {
                text: body.message
            },
            users: [body.from, body.to],

            sender: user._id,
        });
        if (data) return res.json(true)
        return res.json(false)
    } catch (e) {
        console.error(e)
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
})

/* GET za poruke */
app.get("/messages", [auth.verify], async (req, res) => {
    try {
        const data = req.query
        const messages = await Chat.find({
                users: {
                    $all: [data.from, data.to]
                }
            })
            .sort({
                createdAt: 1
            })

        const mappedMessages = messages.map((item) => {
            return {
                id: item._id,
                type: item.sender.toString() === data.from,

                message: item.message.text,
                createdAt: item.createdAt
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
app.get("/conversations", [auth.verify], async (req, res) => {
    try {
        const user = await auth.userInfo(req)
        const userConversations = await User.findById(user).populate("conversations").select("-pass")
        res.json(userConversations)
    } catch (e) {
        console.error(e)
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
})

/* PATCH za dodavanje novog korisnika za dopisivanje */
app.patch("/conversations", [auth.verify], async (req, res) => {
    try {
        const user = await auth.userInfo(req)
        const userConversations = await User.findById(user).populate("conversations").select("-pass")

        const newConversationId = req.body._id

        if (userConversations.conversations.some((conversation) => conversation._id.toString() === newConversationId)) {
            res.json(true)
        } else {
            userConversations.conversations.push(newConversationId)
            const newUser = await User.findById(newConversationId).populate("conversations").select("-pass")
            newUser.conversations.push(user)
            await userConversations.save()
            await newUser.save()
            res.json(true)
        }
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
        /* Tražimo korisnika */
        const user = await User.findOne({
            email: req.body.email
        });
        /* Provjera u slučaju da ne nađemo korisnika */
        if (!user) {
            throw new Error("Korisnik nije pronađen!")
        }

        const authCheck = await auth.authenticateUser(user, req.body.pass) /* Provjerava ako je lozinka točna, dobivamo nazad token */
        res.json(authCheck)
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
    console.log('Korisnik spojen');
    socket.on("add-user", (userId) => {
        global.onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) => {
        const sendUserSocket = global.onlineUsers.get(data.to);
        if (sendUserSocket) {
            io.to(sendUserSocket).emit("msg-recieve", data);
        }
    });

    socket.on('disconnect', () => {
        socket.disconnect();
        console.log('Korisnik odspojen');
    });
});