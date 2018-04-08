module.exports = [{
    entry: {
        playground: "./dist/playground.js"
    },
    output: {
        filename: "[name].bundle.js",
        path: __dirname + "/dist",
        library: "StardustPlayground",
        libraryTarget: "umd"
    }
}, {
    entry: {
        runtime: "./dist/runtime/iframe-webgl.js"
    },
    output: {
        filename: "[name].bundle.js",
        path: __dirname + "/dist",
        library: "StardustPlayground",
        libraryTarget: "umd"
    }
}];
