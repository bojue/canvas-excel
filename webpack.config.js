const htmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: {   
        app:"./src/index.tsx",
        vendor: ['react', 'react-dom']
    },
    output: {
        path: __dirname + "/dist",
        filename: 'js/[name].bundle.js'
    },
    devtool: "source-map",
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    module: {
        rules: [
            { 
                test: /\.tsx?$/, loader: "awesome-typescript-loader" 
            },
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
        new webpack.ProvidePlugin({
            "React": "react",
        }),
        new htmlWebpackPlugin({
            template: path.join(__dirname, './public/index.html'),
            filename:'index.html',
            favicon:'./public/favicon.ico'
        })
    ],
    watch:true,
    devServer: {
      contentBase: path.join(__dirname, 'public'),
      port: 4000,
      hot:true,
      host:"localhost",
      historyApiFallback: true,
      compress: true,
      open:'chrome',
      openPage:''
    },
};