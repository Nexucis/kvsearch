// MIT License
//
// Copyright (c) 2021 Augustin Husson
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import 'mocha';
import { expect } from 'chai';
import { walk } from './walk';


describe('walk test', () => {
    const testSuite = [
        {
            title: 'simple, k/v object',
            path: ['k'],
            obj: { 'k': 'v' },
            result: 'v'
        },
        {
            title: 'deep, k/v object',
            path: ['k', 'k', 'k', 'k'],
            obj: { 'k': { 'k': { 'k': { 'k': 'v' } } } },
            result: 'v'
        },
        {
            title: 'deep, k/v object2',
            path: ['k', 'k', 'k'],
            obj: { 'k': { 'k': { 'k': { 'k': 'v' } } } },
            result: { 'k': 'v' }
        },
        {
            title: 'nested array of object',
            path: ['k', 'k3', 'k4'],
            obj: { 'k': [{ 'k1': 'v1' }, { 'k2': 'v2' }, { 'k3': [{ 'k4': 'v4' }] }] },
            result: 'v4'
        },
        {
            title: 'nested array of object where it returns multiple possibilities',
            path: ['k', 'k3', 'k4'],
            obj: {
                'k': [{ 'k1': 'v1' }, { 'k2': 'v2' }, {
                    'k3': [
                        { 'k4': 'v4' },
                        { 'k4': ['a', 'b', 'c'] },
                        { 'k3': 'test', 'k4': 'v5' }
                    ]
                }]
            },
            result: ['v4', ['a', 'b', 'c'], 'v5']
        },
        {
            title: 'wrong path, null expected',
            path: ['k1', 'k2', 'k3'],
            obj: { 'k': { 'k': 'v' }, 'k1': { 'k2': [1, 2, 3] } },
            result: null,
        },
    ]
    for (const test of testSuite) {
        it(test.title, () => {
            expect(walk(test.path, test.obj)).to.deep.equal(test.result)
        })
    }
});
