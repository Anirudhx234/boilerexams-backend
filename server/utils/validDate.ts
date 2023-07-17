const validDate = (milliseconds) => {
    return milliseconds ? new Date(milliseconds) : undefined
}
export default validDate