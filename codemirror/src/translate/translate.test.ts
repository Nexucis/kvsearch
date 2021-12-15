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


import { createEditorState } from '../test/utils.test';
import chai from 'chai';
import { translate } from './translate';
import { syntaxTree } from '@codemirror/language';
import { Query, QueryNode } from '@nexucis/kvsearch';

describe('translate test', () => {
    const testCases = [
        {
            title: 'Simple Query',
            expr: 'labels.instance != localhost',
            expectedResult: {
                keyPath: ['labels', 'instance'],
                match: 'negative',
                pattern: 'localhost'
            }
        },
        {
            title: 'Query with precedence',
            expr: 'labels.instance =~ demo AND ( labels.job = node OR labels.job = grafana )',
            expectedResult: {
                operator: 'and',
                left: {
                    keyPath: ['labels', 'instance'],
                    match: 'fuzzy',
                    pattern: 'demo'
                } as Query,
                right: {
                    operator: 'or',
                    left: {
                        keyPath: ['labels', 'job'],
                        match: 'exact',
                        pattern: 'node',
                    } as Query,
                    right: {
                        keyPath: ['labels', 'job'],
                        match: 'exact',
                        pattern: 'grafana',
                    } as Query,
                } as QueryNode
            } as QueryNode
        },
        {
            title: 'Query with precedence 2',
            expr: '( labels.instance =~ demo AND labels.job = node ) OR labels.job = grafana',
            expectedResult: {
                operator: 'or',
                left: {
                    operator: 'and',
                    left: {
                        keyPath: ['labels', 'instance'],
                        match: 'fuzzy',
                        pattern: 'demo'
                    } as Query,
                    right: {
                        keyPath: ['labels', 'job'],
                        match: 'exact',
                        pattern: 'node',
                    } as Query,
                } as QueryNode,
                right: {
                    keyPath: ['labels', 'job'],
                    match: 'exact',
                    pattern: 'grafana',
                } as Query,
            } as QueryNode
        }
    ];
    testCases.forEach((value) => {
        it(value.title, () => {
            const state = createEditorState(value.expr);
            const result = translate(state, syntaxTree(state).topNode)
            chai.expect(value.expectedResult).to.deep.equal(result);
        })
    })
});
