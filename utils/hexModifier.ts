import { APIError } from "../middleware/errors/index.js";

const hexModifier = (color: string, decimal: number): string => {
    if (color === "") {
        return "";
    }
    const validHexRegex = /^#[0-9A-F]{6}$/i;
    if (!validHexRegex.test(color)) {
        throw new APIError("Invalid color", 400);
    }

    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);

    r = Math.round(r / decimal);
    g = Math.round(g / decimal);
    b = Math.round(b / decimal);

    r = (r < 255)? r : 255;
    g = (g < 255)? g : 255;
    b = (b < 255)? b : 255;

    const rr = ((r.toString(16).length === 1)? `0${r.toString(16)}` : r.toString(16));
    const gg = ((g.toString(16).length === 1)? `0${g.toString(16)}` : g.toString(16));
    const bb = ((b.toString(16).length === 1)? `0${b.toString(16)}` : b.toString(16));

    return `#${rr}${gg}${bb}`;
};

export default hexModifier;