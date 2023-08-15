const parseQuestions = (content, choices) => {
    const regex1 = /\\[a-z]+\{enumerate\}/g;
    const regex2 = /\\setcounter\{enumi\}\{[0-9]*\}/g;
    const questions = content.substring(content.search('begin\{document\}') + 15, content.search('\\end\{document\}')).replaceAll(regex1, '').replaceAll(regex2, '').split(/\\item|\\section/);
    const images = content.substring(content.search('\\end\{document\}')).match(/(.+)(https:\/\/cdn.mathpix.com\/.+)PK/g);
    let modifiedQuestion = new Array();
    let qs = 0;
    questions.forEach(question => {
        let multiQ;
        let singleQ;
        let q = question;
        let mQR, sQR;
        switch (choices) {
            case 4:
                mQR = /(.+)\(*[Aa][\.\)](.+)\(*[Bb][\.\)](.+)\(*[Cc][\.\)](.+)\(*[Dd][\.\)](.+)[0-9]+[\.\)]/s;
                sQR = /(.+)\(*[Aa][\.\)](.+)\(*[Bb][\.\)](.+)\(*[Cc][\.\)](.+)\(*[Dd][\.\)](.+)/s;
                break;
            case 5:
                mQR = /(.+)\(*[Aa][\.\)](.+)\(*[Bb][\.\)](.+)\(*[Cc][\.\)](.+)\(*[Dd][\.\)](.+)\(*[Ee][\.\)](.+)[0-9]+[\.\)]/s;
                sQR = /(.+)\(*[Aa][\.\)](.+)\(*[Bb][\.\)](.+)\(*[Cc][\.\)](.+)\(*[Dd][\.\)](.+)\(*[Ee][\.\)](.+)/s;
                break;
            case 6:
                mQR = /(.+)\(*[Aa][\.\)](.+)\(*[Bb][\.\)](.+)\(*[Cc][\.\)](.+)\(*[Dd][\.\)](.+)\(*[Ee][\.\)](.+)\(*[Ff][\.\)](.+)[0-9]+[\.\)]/s;
                sQR = /(.+)\(*[Aa][\.\)](.+)\(*[Bb][\.\)](.+)\(*[Cc][\.\)](.+)\(*[Dd][\.\)](.+)\(*[Ee][\.\)](.+)\(*[Ff][\.\)](.+)/s;
                break;
            default:
                throw new Error("Enter a valid amount of answer choices");
        }
        const section = new Array();
        while (multiQ = q.match(mQR)) {
            if (singleQ = q.substring(multiQ[0].length).match(sQR)) {
                section.push(checkImage(singleQ, images));
                qs += 1;
            }
            q = q.substring(0, multiQ[0].length - 2);
        }
        if (singleQ = q.match(sQR)) {
            section.push(checkImage(singleQ, images));
            qs += 1;
        }
        modifiedQuestion = modifiedQuestion.concat(section.reverse());
    });
    return modifiedQuestion;
};
const checkImage = (arr, images) => {
    let question = new Array();
    arr.shift();
    arr.forEach(element => {
        let part = {
            content: element.trim(),
            hasImage: false,
        };
        const imageReg = /includegraphics.+\{([^\{\}]+)\}/g;
        let image;
        let imagelinks = new Array();
        while (image = imageReg.exec(element)) {
            // console.log(`image=${image}`)
            const imageid = image[1].substring(0, image[1].length).replaceAll(/\(/g, '\\\(').replaceAll(/\)/g, '\\\)');
            // console.log(`imageid=${imageid}`)
            const i = images.find(i => i.replaceAll(/\(/g, '\\\(').replaceAll(/\)/g, '\\\)').includes(imageid));
            if (i) {
                const imageURL = i.substring(i.search("https\:"), i.length - 2);
                imagelinks.push(imageURL);
            }
        }
        if (imagelinks.length != 0) {
            part.hasImage = true;
            part.imageLinks = imagelinks;
        }
        question.push(part);
    });
    return question;
};
export default parseQuestions;
//# sourceMappingURL=questionParser.js.map