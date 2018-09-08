const logger = {
    log: (str) => {
        if (process.env.TESTING) return;
        console.log(str);
    }
}

module.exports = logger;