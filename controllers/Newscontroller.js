import vine, { errors } from "@vinejs/vine";
import { newsSchema } from "../validations/Newsvalidations.js";
import { generateRandomNum, imageValidator } from "../utils/helper.js";
class Newcontroller {

    static async index(req, res) {
        try {
            const news = await prisma.news.findMany({});
            return res.json({ status: 200, news });
        } catch (error) {
            if (error instanceof errors.E_VALIDATION_ERROR) {
                //console.log(error.messages)
                return res.status(400).json({ errors: error.messages })
            }
        }
    }
    static async store(req, res) {
        try {
            const user = req.user;
            const body = req.body;

            const validator = vine.compile(newsSchema);
            const payload = await validator.validate(body);

            //check for image
            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).json({
                    errors: {
                        image: "Image field is required"
                    }
                })
            }

            const image = req.files?.image;
            const message = imageValidator(image?.size, image?.mimetype);
            if (message !== null) {
                return res.status(400).json({
                    errors: {
                        image: message
                    }
                })
            }

            //image upload

            const imgExt = image?.name.split(".");
            const imageName = generateRandomNum() + "." + imgExt[1];
            const uploadPath = process.cwd() + "/public/images/" + imageName;

            //upload to folder
            image.mv(uploadPath, (err) => {
                if (err) throw err;
            })

            payload.image = imageName;
            payload.id = user.id;

            //store to the database
            const news = prisma.news.create({
                data: payload
            })
            return res.json({
                status: 200,
                message: "News created successfully",
                news
            });
        } catch (error) {
            if (error instanceof errors.E_VALIDATION_ERROR) {
                //console.log(error.messages)
                return res.status(400).json({ errors: error.messages })
            }
        }

    }
    static async show(req, res) { }
    static async update(req, res) { }
    static async destroy(req, res) { }
}

export default Newcontroller;