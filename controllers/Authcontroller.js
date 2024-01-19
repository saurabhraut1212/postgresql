import vine, { errors } from "@vinejs/vine";
import prisma from "../DB/db.config.js";
import { loginSchema, registerSchema } from "../validations/Authvalidations.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../config/mailer.js";

class Authcontroller {
    static async register(req, res) {
        const body = req.body;
        try {
            const validator = vine.compile(registerSchema)
            const payload = await validator.validate(body)

            //check if email exists
            const findUser = await prisma.users.findUnique({
                where: {
                    email: payload.email
                }
            })

            if (findUser) {
                res.status(400).json({
                    errors: {
                        email: "Email already taken.Please use another one"
                    }
                })
            }
            //bcrypt the password
            const salt = bcrypt.genSaltSync(10);
            payload.password = bcrypt.hashSync(payload.password, salt);

            //insert into database
            const user = await prisma.users.create({
                data: payload
            })
            return res.json({ status: 200, message: "User created successfully", user });
        } catch (error) {
            if (error instanceof errors.E_VALIDATION_ERROR) {
                //console.log(error.messages)
                return res.status(400).json({ errors: error.messages })
            }
        }

    }

    static async login(req, res) {
        const body = req.body;
        try {
            const validator = vine.compile(loginSchema)
            const payload = await validator.validate(body);

            //find user
            const findUser = await prisma.users.findUnique({
                where: {
                    email: payload.email
                }
            })

            if (findUser) {
                if (!bcrypt.compareSync(payload.password, findUser.password)) {
                    return res.status(400).json({
                        errors: {
                            email: "Invalid credentials"
                        }
                    });
                }

                const payloadData = {
                    id: findUser.id,
                    email: findUser.email,
                    password: findUser.password,
                    name: findUser.name
                }
                const token = jwt.sign(payloadData, process.env.JWT_SECRET, { expiresIn: "365d" });
                return res.json({ message: "Logged in", access_token: `Bearer ${token}` })
            }
            return res.status(400).json({
                errors: {
                    email: "No user found with this email"
                }
            })

        } catch (error) {
            if (error instanceof errors.E_VALIDATION_ERROR) {
                //console.log(error.messages)
                return res.status(400).json({ errors: error.messages })
            }
        }
    }

    static async sendEmailMessage(req, res) {
        try {
            const { email } = req.query;

            const payload = {
                toEmail: email,
                subject: "I am testing email",
                body: "<h1>Hello world</h1>"
            }
            await sendEmail(payload.toEmail, payload.subject, payload.body);
            return res.json({ status: 200, message: "Email sent successfully" })
        } catch (error) {
            if (error instanceof errors.E_VALIDATION_ERROR) {
                return res.status(400).json({ errors: error.messages })
            }
        }

    }
}

export default Authcontroller;