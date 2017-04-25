/**
 * Created by harsh on 15/12/16.
 */

var webpack = require('webpack'),
path = require('path');

module.exports = {
    debug: true,
    entry: {
        main: './app.js'
    },
    output: {
        filename: 'bundle.js'
    },
    node:{
        fs:'empty'
    },
    resolve: {
        root: [
            path.resolve(__dirname, '../node_modules')
        ],
        alias: {
            'jquery-ui': 'jquery-ui-dist/jquery-ui.js'
        },
        extensions: ['', '.js', '.json'],
    },
    externals: [
        {'./cptable':'var cptable'},
        {'./jszip':'jszip'}
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules/,

                query: {
                    cacheDirectory: true,
                    presets: ['react', 'es2015']
                }
            }]
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          screw_ie8: true,
          conditionals: true,
          unused: true,
          comparisons: true,
          sequences: true,
          dead_code: true,
          evaluate: true,
          if_return: true,
          join_vars: true,
        }
        })
    ]

};
