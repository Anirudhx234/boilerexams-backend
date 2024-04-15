import { scrypt } from "crypto";
import APIError from "../middleware/errors/APIError.js";

const hashString = (password: string, salt: Buffer): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        scrypt(password, salt, 32, (err, hashedString) => {
            if (err) {
                reject(new APIError(err.message, 500));
            } else {
                resolve(hashedString);
            }
        });
    });
};

export default hashString;
