const htmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
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
      port: 3000,
      hot:true,
      host:"localhostç",
      historyApiFallback: true,
      compress: true,
      open:"Chrome",
      openPage:''
    },
};