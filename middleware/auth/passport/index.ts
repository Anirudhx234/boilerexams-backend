import localPassport from "./localPassport.js";
import discordPassport from "./discordPassport.js";
import googlePassport from "./googlePassport.js";

const initializePassport = (passport) => {
    localPassport(passport);
    discordPassport(passport);
    googlePassport(passport);
};

export default initializePassport;
