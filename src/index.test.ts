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
import { union } from './index';

describe('union test', () => {
    const testSuite = [
        {
            title: 'empty gives empty',
            a: [],
            b: [],
            result: [],
        },
        {
            title: 'a empty returns b',
            a: [],
            b: [
                {
                    score: 1,
                    key: 'foo',
                    value: 'bar'
                },
                {
                    score: 1,
                    key: 'Country',
                    value: 'Middle Earth'
                }
            ],
            result: [
                {
                    score: 1,
                    key: 'foo',
                    value: 'bar'
                },
                {
                    score: 1,
                    key: 'Country',
                    value: 'Middle Earth'
                }
            ],
        },
        {
            title: 'pure union, no common value',
            a: [
                {
                    score: 1,
                    key: 'foo',
                    value: 'bar'
                },
                {
                    score: 1,
                    key: 'Country',
                    value: 'Middle Earth'
                }
            ],
            b: [
                {
                    score: 8,
                    key: 'john',
                    value: 'doe'
                }
            ],
            result: [
                {
                    score: 1,
                    key: 'foo',
                    value: 'bar'
                },
                {
                    score: 1,
                    key: 'Country',
                    value: 'Middle Earth'
                },
                {
                    score: 8,
                    key: 'john',
                    value: 'doe'
                }
            ]
        },
        {
            title: 'merging value',
            a: [
                {
                    score: 4,
                    key: 'foo',
                    value: 'bar'
                },
                {
                    score: 1,
                    key: 'Country',
                    value: 'Middle Earth'
                }
            ],
            b: [
                {
                    score: 8,
                    key: 'john',
                    value: 'doe'
                },
                {
                    score: 5,
                    key: 'Country',
                    value: 'Middle Earth'
                },
                {
                    score: 1,
                    key: 'foo',
                    value: 'bar'
                },
            ],
            result: [
                {
                    score: 4,
                    key: 'foo',
                    value: 'bar'
                },
                {
                    score: 5,
                    key: 'Country',
                    value: 'Middle Earth'
                },
                {
                    score: 8,
                    key: 'john',
                    value: 'doe'
                }
            ]
        }
    ];
    for (const test of testSuite) {
        it(test.title, () => {
            expect(union(test.a, test.b)).to.deep.equal(test.result)
        })
    }
})
