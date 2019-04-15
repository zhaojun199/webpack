const path = require('path');
const fs = require('fs');
const UglifyJSPlugin = require('webpack-parallel-uglify-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// 判断dll文件是否生成
const manifestExists = fs.existsSync(path.resolve(__dirname, 'dll', 'mobx.manifest.json'));
if (!manifestExists) {
    console.error('请先执行`npm run dll`指令！');
    return;
}

const dllFiles = fs
    .readdirSync(path.resolve(__dirname, 'dll'));
// 引入dll链接库打包的文件
const dllMainfests = dllFiles
    .filter(it => {
        return /.json$/.test(it);
    })
    .map(it => {
        return new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require(path.resolve(__dirname, 'dll', it)),
        });
    });
const dllJS = dllFiles
    .filter(it => {
        return /.js$/.test(it);
    });

const config = {
    mode: 'production',
    // mode: 'development',
    entry: ['@babel/polyfill', path.resolve(__dirname, 'src/index.js')],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/[name]-[hash].js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                // 个人测试：如果配置了options，会和.babelrc的配置取并集
                options: {
                    presets: [],
                    plugins: []
                }
            }
        }]
    },
    devtool: 'cheap-module-eval-source-map',
    // devtool: 'cheap-module-source-map',  生产环境
    // webpack-dev-server
    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        open: true,
        port: 8088,
        hot: true,
    },
    // 未验证 - splitChunksPlugins
    // optimization: {
    //     splitChunks: {
    //         cacheGroups:{
    //             // 比如你要单独把jq之类的官方库文件打包到一起，就可以使用这个缓存组，如想具体到库文件（jq）为例，就可把test写到具体目录下
    //             vendor: {
    //                 test: /node_modules/,
    //                 name: 'vendor',
    //                 priority: 10,
    //                 enforce: true
    //             },
    //             // 这里定义的是在分离前被引用过两次的文件，将其一同打包到common.js中，最小为30K
    //             common: {
    //                 name: 'common',
    //                 minChunks: 2,
    //                 minSize: 30000
    //             }
                
    //         },
    //         chunks: 'all',
    //         minSize: 40000
    //     }
    // },
    plugins: [
        // 压缩输出的 JS 代码
        // new UglifyJSPlugin({
        //     compress: {
        //         // 在UglifyJs删除没有用到的代码时不输出警告
        //         warnings: false,
        //         // 删除所有的 `console` 语句，可以兼容ie浏览器
        //         drop_console: true,
        //         // 内嵌定义了但是只用到一次的变量
        //         collapse_vars: true,
        //         // 提取出出现多次但是没有定义成变量去引用的静态值
        //         reduce_vars: true,
        //     },
        //     output: {
        //         // 最紧凑的输出
        //         beautify: false,
        //         // 删除所有的注释
        //         comments: false,
        //     }
        // }),
        // 将dll文件拷贝到dist目录
        new CopyWebpackPlugin([{
            from: path.resolve(__dirname, 'dll'),
            to: path.resolve(__dirname, 'dist', 'dll'),
            ignore: ['html/*', '.DS_Store']
        }]),
        // 引入dll链接库打包的文件
        ...dllMainfests,
        new HtmlWebpackPlugin({
            path: path.resolve(__dirname, 'dist'),
            template: path.resolve(__dirname, 'index.html'),
            title: 'mobx和webpack',
            // version: '?v' + pkg.version,
            filename: 'index.html',
            inject: true,
            // 允许插入到模板中的一些chunk
            chunks: ['main'],
            // hash: false,
            // minify: {
            //     removeComments: false,
            //     collapseWhitespace: false
            // }
            dll: dllJS, // 自定义属性
        }),
        // 分析包插件
        new BundleAnalyzerPlugin(),
        // 未验证 - 打包第三方库文件 - webpack4已删除
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: (pkg.name ? (pkg.name + '-') : '') + 'vendor',
        //     minChunks(module){
        //         return module.context && module.context.indexOf('node_modules') !== -1
        //     }
        // }),
    ],
    // 不进行打包的库
    // externals: {
    //     'mobx': 'mobx',
    // },
};

module.exports = config;