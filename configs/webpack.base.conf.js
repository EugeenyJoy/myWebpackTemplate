const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const PATHS = {
    src: path.join(__dirname, '../src'),
    dist: path.join(__dirname, '../dist'),
    assets: 'assets/'
}

const PAGES_DIR = `${PATHS.src}/pug/pages/`
const PAGES = fs.readdirSync(PAGES_DIR).filter(fileName => fileName.endsWith('.pug'))

module.exports = {

    externals: {
        paths: PATHS
    },
    // Точка входа
    entry: {
        app: PATHS.src,
         
        // Доп файл для разбивки, пример лк 
        // app: `${PATHS.src}/lk.js` 
        // или так  module: `${PATHS.src}/your-module.js`,
    },

    // Точка выхода, конечный фаил-сборка.js и путь к нему
    output: {
        filename: `${PATHS.assets}js/[name].[hash].js`,
        path: PATHS.dist,
        publicPath: '/'
    },
    // Оптимизация, разбивка на вендоры
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    name: 'vendors',
                    test: /node_modules/,
                    chunks: 'all',
                    enforce: true
                }
            }
        }
    },
     // Подключение модулей
    module: {
        rules: [

                 // Подключение pug с помощью pug-loader
            { 
                test: /\.pug$/,
                oneOf: [
                    // this applies to <template lang="pug"> in Vue components
                    {
                    resourceQuery: /^\?vue/,
                    use: ['pug-plain-loader']
                    },
                    // this applies to pug imports inside JavaScript
                    {
                    use: ['pug-loader']
                    }
                ]
            },

                // Подключение BABEL для JS, исключили папку /node_modules/
            { 
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: '/node_modules/'
            }, 
            // Подключение шрифтов через file-loader
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'file-loader',
                options: {
                name: '[name].[ext]'
                }
            }, 
            // Обработка картинок через file-loader
            { 
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]'
                }
            }, 
            // Подключение SCSS и получение css файла с помощью MiniCssExtractPlugin через css-loader и sass-loader
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: { sourceMap: true }
                    }, {
                        loader: 'postcss-loader',
                        options: { sourceMap: true, config: { path: `${PATHS.src}/js/postcss.config.js` } }
                    }, {
                        loader: 'sass-loader',
                        options: { sourceMap: true }
                    }
                ]
            }, 
            // Подключение css
            { 
                test: /\.css$/,
                use: [
                    'style-loader',
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: { sourceMap: true }
                    }, {
                        loader: 'postcss-loader',
                        options: { sourceMap: true, config: { path: './postcss.config.js' } }
                    },
                ]
            }
        ]
    },


    // Алиасы
    resolve: {
        alias: {
            '~': 'src'
        }
    },


    // Подключение плагинов
    plugins: [

        // Подключение экстракт плагина на css
        new MiniCssExtractPlugin({ 
            filename: `${PATHS.assets}css/[name].[hash].css`
        }),

        // Для использования html без pug
        // new HtmlWebpackPlugin({ 
        //     template: `${PATHS.src}/index.html`,
        //     filename: './index.html',
        //     // Для отмены автовставки js и css
        //     // inject: false
        // }),


        // Копирование статичных файлов с помощью CopyWebpackPlugin
        new CopyWebpackPlugin([
            { from: `${PATHS.src}/${PATHS.assets}img`, to: `${PATHS.assets}img` },
            { from: `${PATHS.src}/${PATHS.assets}fonts`, to: `${PATHS.assets}fonts` },
            { from: `${PATHS.src}/static`, to: '' }
        ]),

        ...PAGES.map(page => new HtmlWebpackPlugin({
            template: `${PAGES_DIR}/${page}`,
            filename: `./${page.replace(/\.pug/,'.html')}`
          }))
    ]
}

