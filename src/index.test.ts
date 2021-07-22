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
import { intersect, KVSearch, Query, QueryNode, union } from './index';

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
            title: 'b empty returns a',
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
            b: [],
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

describe('intersect test', () => {
    const testSuite = [
        {
            title: 'empty gives empty',
            a: [],
            b: [],
            result: [],
        },
        {
            title: 'a empty returns empty',
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
            result: [],
        },
        {
            title: 'b empty returns empty',
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
            b: [],
            result: [],
        },
        {
            title: 'no common values',
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
            result: []
        },
        {
            title: 'common values',
            a: [
                {
                    score: 8,
                    key: 'john',
                    value: 'doe'
                },
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
                },
                {
                    score: 1,
                    key: 'Country',
                    value: 'Middle Earth'
                }
            ],
            result: [
                {
                    score: 8,
                    key: 'john',
                    value: 'doe'
                },
                {
                    score: 1,
                    key: 'Country',
                    value: 'Middle Earth'
                }
            ]
        }
    ]
    for (const test of testSuite) {
        it(test.title, () => {
            expect(intersect(test.a, test.b)).to.deep.equal(test.result)
        })
    }
})

describe('match test', () => {
    const testSuite = [
        {
            title: 'exact match',
            pattern: 'foo',
            text: 'foo',
            matcherType: 'exact' as 'exact' | 'fuzzy' | 'negative',
            result: {
                score: Infinity
            }
        },
        {
            title: 'no exact match',
            pattern: 'foo',
            text: 'bar',
            matcherType: 'exact' as 'exact' | 'fuzzy' | 'negative',
            result: null
        },
        {
            title: 'negative match',
            pattern: 'foo',
            text: 'bar',
            matcherType: 'negative' as 'exact' | 'fuzzy' | 'negative',
            result: {
                score: 1
            }
        },
        {
            title: 'no negative match',
            pattern: 'foo',
            text: 'foo',
            matcherType: 'negative' as 'exact' | 'fuzzy' | 'negative',
            result: null
        },
        {
            title: 'fuzzy match',
            pattern: 'br',
            text: 'bar',
            matcherType: 'fuzzy' as 'exact' | 'fuzzy' | 'negative',
            result: {
                fuzzyResult: {
                    original: 'bar',
                    rendered: 'bar',
                    score: 1.6666666666666667,
                },
                score: 1.6666666666666667,
            }
        }
    ]
    for (const test of testSuite) {
        it(test.title, () => {
            const search = new KVSearch()
            expect(search.match(test.pattern, test.text, test.matcherType)).to.deep.equal(test.result)
        })
    }
})

describe('filter test', () => {
    const testSuite = [
        {
            title: 'simple key search query with exact match',
            pattern: 'foo',
            query: {
                match: 'exact',
                keyPath: 'kvsearch_key'
            } as Query,
            list: {
                foo: 'bar',
                bar: 'foo',
            },
            result: [
                {
                    key: 'foo',
                    value: 'bar',
                    score: Infinity,
                }
            ]
        },
        {
            title: 'sophisticate key search query with exact match',
            pattern: 'foo',
            query: {
                operator: 'or',
                left: {
                    match: 'exact',
                    keyPath: 'kvsearch_key'
                },
                right: {
                    match: 'exact',
                    keyPath: 'kvsearch_value',
                },
            } as QueryNode,
            list: {
                foo: 'bar',
                bar: 'foo',
            },
            result: [
                {
                    key: 'bar',
                    value: 'foo',
                    score: Infinity,
                },
                {
                    key: 'foo',
                    value: 'bar',
                    score: Infinity,
                }
            ]
        }
    ]
    for (const test of testSuite) {
        it(test.title, () => {
            const search = new KVSearch()
            expect(search.filter(test.pattern, test.query, test.list)).to.deep.equal(test.result)
        })
    }
})
