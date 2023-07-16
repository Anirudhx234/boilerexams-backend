const validDate = (milliseconds) => {
    return milliseconds ? new Date(milliseconds) : undefined
}
module.exports = validDate