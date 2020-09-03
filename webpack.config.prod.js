const htmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    entry: {   
        app:"./src/index.tsx",
        vendor: ['react', 'react-dom']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath:'',
        filename: 'js/[name].bundle.js'
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                ],
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                       imit: 3*1024
                    }
                }
            }
        ]
    },
    performance : {
        hints : false
    },
    plugins: [
        new htmlWebpackPlugin({
            template: "./public/index.html"
        })
    ]
};