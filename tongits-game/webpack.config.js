// @ts-nocheck
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    devServer: {
        static: './dist',
        port: 3000
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(js|jsx)$/i,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
            {
                test: /\.(mp3|wav|ogg)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/audio/[name][ext]'
                }
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|webp)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/graphics/[name][ext]'
                }
            }
        ]
    },

    devServer: {
        static: [
            {
                directory: path.join(__dirname, 'public'),
                publicPath: '/',
            },
            {
                directory: path.join(__dirname, 'dist'),
                publicPath: '/'
            }
        ],
        port: 3000
    }
,    

    
    resolve: {
        extensions: ['.js', '.jsx']
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html'
        })
    ]
};