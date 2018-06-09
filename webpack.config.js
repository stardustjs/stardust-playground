let webpack = require("webpack");
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
    entry: {
        playground: "./dist/playground.js",
        runtime: "./dist/runtime/iframe-webgl.js"
    },
    output: {
        filename: "[name].bundle.js",
        path: __dirname + "/dist",
        library: "StardustPlayground",
        libraryTarget: "umd"
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }]
    },
    plugins: [
        new MonacoWebpackPlugin()
    ]
};