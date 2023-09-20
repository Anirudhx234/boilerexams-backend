const allowList = ["178.128.158.20", "178.128.159.255", "73.103.19.222"];

const allowListCheck = (ip: string) => {
    console.log(ip);
    return allowList.includes(ip);
}

export default allowListCheck