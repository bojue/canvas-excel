const htmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'development',
    mode: 'production',
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
                    // Creates `style` nodes from JS strings
                    'style-loader',
                    // Translates CSS into CommonJS
                    'css-loader',
                    // Compiles Sass to CSS
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
      contentBase: path.join(__dirname, 'dist'),
      port: 3000,
      hot:true,
      host:"localhost",
      historyApiFallback: true,
      compress: true,
      open:"Chrome",
      openPage:'index.html'
    },
};