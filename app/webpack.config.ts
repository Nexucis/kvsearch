// Copyright 2021 The Perses Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { Configuration } from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

export const commonConfig: Configuration = {
    mode: 'development',
    entry: path.resolve(__dirname, './src/app.ts'),
    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/',
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
    },
    plugins: [
        // Generates HTML index page with bundle injected
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './src/app.html'),
            templateParameters: {},
        }),
        // Does TS type-checking in a separate process
        new ForkTsCheckerWebpackPlugin({
            typescript: {
                configFile: path.resolve(__dirname, './tsconfig.json'),
                build: true, // Since we use project references...
            },
            eslint: {
                files: '../*/src/**/*.{ts,js}',
            },
        }),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            // Type-checking happens in separate plugin process
                            transpileOnly: true,
                            projectReferences: true,
                        },
                    },
                ],
            },
        ],
    },
};

export default commonConfig;
