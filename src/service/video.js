exports.convert = (event, context, callback) => {
    console.log(JSON.stringify(event));
    callback(null, {});
}