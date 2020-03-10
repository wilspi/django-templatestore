module.exports = {
   devtool: 'inline-source-map',
   entry: './src/index.js',
   output: {
      path: __dirname + '/dist',
      publicPath: '/',
      filename: 'te-bundle.js'
   },
   module: {
      rules: [
         {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: [
               'babel-loader',
               'eslint-loader'
            ]
         },
         {
            test: /\.less$/,
            use: [
               'style-loader',
               {
                  loader: 'css-loader',
                  options: {
                     modules: true,
                  },
               },
               'less-loader',
            ]
         },
      ]
   },
};
