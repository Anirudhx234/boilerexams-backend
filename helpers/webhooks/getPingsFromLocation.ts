enum Ping {
    Matthew = "<@266021275992850433>",
    Anish = "<@748640361592651886>",
    Trevin = "<@534143614993956865>",
    Thomas = "<@341741687065804812>",
    Chris = "<@455084750487683102>",
    Frontend = "<@&1078747995979403326>"
}

const getPingsFromLocation = (location: string) => {
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