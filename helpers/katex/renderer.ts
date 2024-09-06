import { QuestionType, Resource } from "@prisma/client";
import { UrlResourceData } from "../../controllers/resourceController.js";
import katex from "katex";
import { z } from "zod";


// In order to render \n properly, we need a random string to perform the replacement. This string should never appear in a question or else
// random new lines will appear
const randomNewLineString =
    "NLtlc5yBurhii6xd0aTlT7eH1q2Bg0bqE4dRev24Y4GXPzSDIFYrs63Pxjmf6Mn4PzOBuACUmp4Awgp3U6YdWU88QvcoFORl";

// In order to render actual dollar signs ($) properly, we need a random string to perform the replacement. This string should never appear in a question or else random dollar signs appear.
const randomDollarSignString =
    "Nc65hh7zQkQkDFt1FIpNH2MHlijJ32OhALfCuMCzfv1WZQ8AbhBTnPdQ9HKboMVpKG469NyL7vO8FU0Suy9ZQw8KJG2T2T78";

export default class KatexRenderer {
    public static tryRender(str: string = "", resources?: Array<Resource>, questionType?: QuestionType) {
        try {
            return KatexRenderer.render(str, resources, questionType);
        } catch (err) {
            return str;
        }
    }
    public static render(str: string = "", resources?: Resource[], questionType?: QuestionType) {
        let index = 0;
        return str
            .replaceAll("\n", ` ${randomNewLineString} `) // Replace all instances of \n to a random string for future rendering
            .replaceAll("\\$", ` ${randomDollarSignString} `)
            .replace(/point \\\(([-\d+][-,\d+]*)\\\)/g, function (outer, inner) {
                return `point \\((${inner})\\)`; // Add parentheses to points which do not have them
            })
            .replace(/\$\$(.*?)\$\$/g, function (outer, inner) {
                return katex.renderToString(mathStringReplacement(inner), { displayMode: true }); // Convert all LaTeX inside $$<LaTeX>$$ into math mode
            })
            .replace(/\\\[(.*?)\\\]/g, function (outer, inner) {
                return katex.renderToString(mathStringReplacement(inner), { displayMode: true }); // Convert all LaTeX inside \[<LaTeX>\] into math mode
            })
            .replace(/\\\((.*?)\\\)/g, function (outer, inner) {
                return katex.renderToString(mathStringReplacement(inner), { displayMode: false }); // Convert all LaTeX inside \(<LaTeX>\) into math mode
            })
            .replace(/\$(.*?)\$/g, function (outer, inner) {
                return katex.renderToString(mathStringReplacement(inner), { displayMode: false }); // Convert all LaTeX inside $<LaTeX>$ into math mode, but ignore one-off $ signs
            })
            .replace(/\\verb\|(.*?)\|/g, function (outer, inner) {
                return `<span class='bg-[#ddd] dark:bg-[#606060] dark:text-[#e0e0e0] px-1 rounded-lg text-lg' style='font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "Source Code Pro", "source-code-pro", monospace'>${inner}</span>`;
            })
            .replace(/\\texttt\{(.*?)\}/g, function (outer, inner) {
                return `<span class='bg-[#ddd] dark:bg-[#606060] dark:text-[#e0e0e0] px-1 rounded-lg text-lg' style='font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "Source Code Pro", "source-code-pro", monospace'>${inner}</span>`;
            })
            .replace(/\\textbf\{(.*?)\}/g, function (outer, inner) {
                // Bolded text
                // \textbf{inner}
                return `<span class='font-bold'>${inner}</span>`;
            })
            .replace(/\\textit\{(.*?)\}/g, function (outer, inner) {
                // Italicized text
                // \textit{inner}
                return `<span class='italic'>${inner}</span>`;
            })
            .replace(/\\underline\{(.*?)\}/g, function (outer, inner) {
                // Underlined text
                // \underline{inner}
                return `<span class='underline underline-offset-auto'>${inner}</span>`;
            })
            .replace(/\\fontsize\[(.*?)\]\{(.*?)\}/g, function (outer, fontSize, text) {
                // Changing font size
                // \fontsize[fontSize]{text}
                return `<span style='font-size: ${fontSize}'>${text}</span>`;
            })
            .replace(/\\textsuperscript\{(.*?)\}/g, function (outer, inner) {
                // Superscript text
                // \textsuperscript{inner}
                return `<sup>${inner}</sup>`;
            })
            .replace(/\\textsubscript\{(.*?)\}/g, function (outer, inner) {
                // Subscript text
                // \textsubscript{inner}
                return `<sub>${inner}</sub>`;
            })
            .replace(/\\indent\[(.*?)\]\{(.*?)\}/g, function (outer, indent, text) {
                // Indentation
                // \indent[indent]{text}
                return `<span style='margin-left: ${indent}'>${text}</span>`;
            })
            .replace(/\\centerline\{(.*?)\}/g, function (outer, inner) {
                // Centered text
                // \centerline{inner}
                return `<p class='text-center'>${inner}</p>`;
            })
            .replace(/\\rightline\{(.*?)\}/g, function (outer, inner) {
                // Right-justified text
                // \rightline{inner}
                return `<p class='text-right'>${inner}</p>`;
            })
            .replace(/\\textcolor\[(.*?)\]\{(.*?)\}/g, function (outer, color, text) {
                // Text color
                // \textcolor[color]{text}
                return `<span style='color: ${color}'>${text}</span>`;
            })
            .replace(/\\pic\{(.*?)\}/g, function (outer, inner) {
                /* A PIC object can have the following values
                 *  alt: the alt text for the image, required for accessibility
                 *  url: the url of the picture to load
                 *  maxHeight: the max height of the picture
                 *
                 * I used a custom object since it seemed kind of hard to do it in native LaTeX
                 *
                 * Currently not used, but kept in case \includegraphics ever has a problem
                 */
                try {
                    const json = JSON.parse("{" + inner + "}");
                    const maxHeight = json.maxHeight ? json.maxHeight : 300;
                    const isInline = json.isInline ? "inline-block" : "mx-2 my-8";
                    return `<div class='${isInline}'><img style='max-height: ${maxHeight}px;' class='mx-auto dark:invert-[0.9]' src='${json.url}' alt='${json.alt}'/></div>`;
                } catch (e) {
                    return "Image could not be loaded";
                }
            })
            .replace(/\[(.*?)\]/g, function (outer: string) {
                // Fill in the blanks
                return questionType === "FILL_IN_BLANK" ? `<input id="replace" index=${index++}></input>` : outer;
            })
            .replace(/\\includegraphics{([a-zA-Z0-9\-_]+)}/g, function (outer, inner) {
                const imageResourceIndex =
                    typeof resources !== "undefined"
                        ? resources.findIndex((resource) => resource.type == "IMAGE" && resource.id === inner)
                        : -1;
                const imageNotFoundResource: z.infer<typeof UrlResourceData> = {
                    url: "https://c4.wallpaperflare.com/wallpaper/839/927/713/404-fon-error-404-not-found-wallpaper-thumb.jpg",
                    altText:
                        "An image with the text '404 not found' in faded black in front of a white background. The '404' portion of the text is larger than the rest. It lies on the line above the rest of the text with the entire number enveloped by black flames. A white-red shine is visible on the center-left portion of the '0' in '404'. A watermark for 'FeRRoR' appears in small font on the bottom-right part of the picture.",
                };
                if (imageResourceIndex === -1 || typeof resources === "undefined") {
                    // \includegraphics referenced a resource id that does not exist (this shouldn't happen)
                    return `<div class='mx-2 my-8'><img class='mx-auto max-h-[300px] dark:invert-[0.9]' src='${imageNotFoundResource.url}' alt='${imageNotFoundResource.altText}'/></div>`;
                } else {
                    const imageResource = resources[imageResourceIndex].data as z.infer<typeof UrlResourceData>;
                    return `<div class='mx-2 my-8'><img class='mx-auto max-h-[300px] dark:invert-[0.9]' src='${imageResource.url}' alt='${imageResource.altText}'/></div>`;
                }
            })
            .replaceAll(` ${randomNewLineString} `, " <br /> ") // Insert a line break for each new line character (currently in random string format) in the output
            .replaceAll(` ${randomDollarSignString} `, "$");
    }
}

/*
 * Known issues:
 * Line breaks in in-line math mode with \left and \right (this is not possible, see https://github.com/KaTeX/KaTeX/discussions/3457)
 */

// This function performs string replacement on strings that are in math mode
function mathStringReplacement(str: string) {
    str = str.replaceAll(",", ", \\allowbreak "); // Allow line breaks after a comma (does not work for inline with \left and \right)
    str = str.replaceAll(` ${randomNewLineString} `, " "); // Remove all instances of \n (now a random string) with a space as \n is not valid LaTeX and a space ensures no rendering errors
    str = str.replaceAll(` ${randomDollarSignString} `, " "); // Remove all instances of the dollar sign ($) in math mode
    return str;
}