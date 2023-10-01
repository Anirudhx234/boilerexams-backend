const msToHMS = (milliseconds: number | null) => {
    if (!milliseconds) {
        return {
            hours: 0,
            minutes: 0,
            seconds: 0
        };
    }
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    return {
        hours: hours,
        minutes: minutes,
        seconds: seconds
    };
};

export default msToHMS;