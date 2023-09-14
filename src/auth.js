import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../Models/User.js"
import "dotenv/config";


export default {
    async registerUser(userData) {
        try {
            const doc = {
                email: userData.email,
                pass: await bcrypt.hash(userData.pass, 8)
            }

            return await User.create(doc)
        } catch (e) {
            throw new Error(e)
        }
    },

    async authenticateUser(user, pass) {
        try {

            if (user && user.pass && (await bcrypt.compare(pass, user.pass))) {

                const payload = {
                    _id: user._id,
                }

                const token = jwt.sign(payload, String(process.env.JWT_SECRET), {
                    algorithm: "HS512",
                    expiresIn: "1 day"
                })
                return {
                    token,
                    email: user.email
                }

            } else {
                throw new Error("Neispravni podaci")
            }
        } catch (e) {
            throw new Error(e)
        }
    },
    async verify(req, res, next) {
        try {
            if (req.headers.authorization) {

                const auth = req.headers.authorization.split(" ")
                const type = auth[0]
                const token = auth[1]

                if (type !== "Bearer") {
                    return res.status(401).send()
                } else {
                    req.jwt = jwt.verify(token, String(process.env.JWT_SECRET));
                    return next();
                }

            } else {
                return res.status(401).send()
            }
        } catch (e) {
            return res.status(403).send(e.message);
        }
    },
    async userInfo(req) {
        try {
            const header = req.headers.authorization
            const token = header.split(" ")
            const decoded = jwt.decode(token[1])
            return decoded
        } catch (e) {
            throw new Error(e)
        }
    }
}