var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

const websiteInputDirectory = path.join(__dirname, 'app/src/website/');
const websiteOutputDirectory = path.join(__dirname, 'deploy/outputweb/src/website/');



module.exports = {
    entry: {
        app: [
            websiteInputDirectory + "scripts/index.tsx"
        ]
    },
    output: {
        path: websiteOutputDirectory,
        publicPath: "deploy",
        filename: '[name]bundle.js'
    },

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    // Add the loader for .ts files.
    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            {
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader",
                options: {
                    configFileName: 'tsconfig.web.json'
                },
                include: websiteInputDirectory
            },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                test: /\.js$/,
                enforce: "pre",
                loader: "source-map-loader"
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract({ fallback: "style-loader", use: "css-loader!sass-loader" })
            },
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
            {
                test: /\.png$/,
                loader: "url-loader?limit=100000"
            },
            {
                test: /\.jpg$/,
                loader: "file-loader"
            },
            {
                test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'file-loader?limit=10000&mimetype=application/font-woff'
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'file-loader?limit=10000&mimetype=application/octet-stream'
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'file-loader'
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'file-loader?limit=10000&mimetype=image/svg+xml'
            }
        ]
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: "vendor",
            filename: "vendorbundle.js",
            minChunks: function (module) {
                return module.context && module.context.indexOf('node_modules') !== -1;
            }
        })
        , new ExtractTextPlugin({
            filename: 'style-[name]-[contenthash].css',
            allChunks: true
        })
    ]
};