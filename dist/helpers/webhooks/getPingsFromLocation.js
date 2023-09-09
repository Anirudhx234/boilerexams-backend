var Ping;
(function (Ping) {
    Ping["Matthew"] = "<@266021275992850433>";
    Ping["Anish"] = "<@748640361592651886>";
    Ping["Trevin"] = "<@534143614993956865>";
    Ping["Thomas"] = "<@341741687065804812>";
    Ping["Chris"] = "<@455084750487683102>";
    Ping["Frontend"] = "<@&1078747995979403326>";
})(Ping || (Ping = {}));
const getPingsFromLocation = (location) => {
    switch (location) {
        case "home": return Ping.Matthew;
        case "about": return Ping.Anish;
        case "stats": return Ping.Trevin;
        case "courses": return Ping.Matthew;
        case "feedback": return Ping.Matthew;
        case "study": return Ping.Thomas;
        case "resources": return Ping.Chris;
        case "question": return Ping.Anish;
        case "navbar": return Ping.Matthew + Ping.Anish;
        case "footer": return Ping.Matthew;
        case "dashboard": return Ping.Matthew + Ping.Thomas;
        case "other": return Ping.Frontend;
        default: return Ping.Frontend;
    }
};
export default getPingsFromLocation;
//# sourceMappingURL=getPingsFromLocation.js.map