import chai from 'chai';
import { CompletionContext } from '@codemirror/autocomplete';
import { createEditorState } from '../test/utils.test';
import { Complete, matcherTerms, operatorTerms } from './complete';
import { objectList } from '../test/objectlist';

describe('autocomplete kvsearch test', () => {
    const testCases = [
        {
            title: 'empty expression should autocomplete first key of query path',
            expr: '',
            pos: 0,
            expectedResult: {
                'options': [
                    {
                        label: 'discoveredLabels',
                        type: 'text'
                    },
                    {
                        label: 'labels',
                        type: 'text'
                    },
                    {
                        label: 'scrapePool',
                        type: 'text'
                    },
                    {
                        label: 'scrapeUrl',
                        type: 'text'
                    },
                    {
                        label: 'globalUrl',
                        type: 'text'
                    },
                    {
                        label: 'lastError',
                        type: 'text'
                    },
                    {
                        label: 'lastScrape',
                        type: 'text'
                    },
                    {
                        label: 'lastScrapeDuration',
                        type: 'text'
                    },
                    {
                        label: 'health',
                        type: 'text'
                    },
                ],
                from: 0,
                to: 0,
                span: /^[a-zA-Z0-9_:]+$/,
            }
        },
        {
            title: 'autocomplete query path',
            expr: 'lab',
            pos: 3,
            expectedResult: {
                'options': [
                    {
                        label: 'discoveredLabels',
                        type: 'text'
                    },
                    {
                        label: 'labels',
                        type: 'text'
                    },
                    {
                        label: 'scrapePool',
                        type: 'text'
                    },
                    {
                        label: 'scrapeUrl',
                        type: 'text'
                    },
                    {
                        label: 'globalUrl',
                        type: 'text'
                    },
                    {
                        label: 'lastError',
                        type: 'text'
                    },
                    {
                        label: 'lastScrape',
                        type: 'text'
                    },
                    {
                        label: 'lastScrapeDuration',
                        type: 'text'
                    },
                    {
                        label: 'health',
                        type: 'text'
                    }
                ],
                from: 0,
                to: 3,
                span: /^[a-zA-Z0-9_:]+$/

            }
        },
        {
            title: 'autocomplete query path 2',
            expr: 'labels.env != demo OR l',
            pos: 23,
            expectedResult: {
                'options': [
                    {
                        label: 'discoveredLabels',
                        type: 'text'
                    },
                    {
                        label: 'labels',
                        type: 'text'
                    },
                    {
                        label: 'scrapePool',
                        type: 'text'
                    },
                    {
                        label: 'scrapeUrl',
                        type: 'text'
                    },
                    {
                        label: 'globalUrl',
                        type: 'text'
                    },
                    {
                        label: 'lastError',
                        type: 'text'
                    },
                    {
                        label: 'lastScrape',
                        type: 'text'
                    },
                    {
                        label: 'lastScrapeDuration',
                        type: 'text'
                    },
                    {
                        label: 'health',
                        type: 'text'
                    }
                ],
                from: 22,
                to: 23,
                span: /^[a-zA-Z0-9_:]+$/

            }
        },
        {
            title: 'autocomplete query path 3',
            expr: 'labels.',
            pos: 7,
            expectedResult: {
                'options': [
                    {
                        label: 'env',
                        type: 'text'
                    },
                    {
                        label: 'instance',
                        type: 'text'
                    },
                    {
                        label: 'job',
                        type: 'text'
                    },
                    {
                        label: 'test',
                        type: 'text'
                    },
                ],
                from: 7,
                to: 7,
                span: /^[a-zA-Z0-9_:]+$/

            }
        },
        {
            title: 'autocomplete query path 4',
            expr: 'labels.env != demo OR labels.',
            pos: 29,
            expectedResult: {
                'options': [
                    {
                        label: 'env',
                        type: 'text'
                    },
                    {
                        label: 'instance',
                        type: 'text'
                    },
                    {
                        label: 'job',
                        type: 'text'
                    },
                    {
                        label: 'test',
                        type: 'text'
                    },
                ],
                from: 29,
                to: 29,
                span: /^[a-zA-Z0-9_:]+$/

            }
        },
        {
            title: 'autocomplete pattern',
            expr: 'labels.instance != dem',
            pos: 22,
            expectedResult: {
                options: [
                    {
                        label: 'demo.do.prometheus.io:9093',
                        type: 'text',
                    },
                    {
                        label: 'http://localhost:9100',
                        type: 'text'
                    },
                    {
                        label: 'localhost:2019',
                        type: 'text'
                    },
                    {
                        label: 'demo.do.prometheus.io:3000',
                        type: 'text'
                    },
                    {
                        label: 'demo.do.prometheus.io:9100',
                        type: 'text'
                    },
                    {
                        label: 'demo.do.prometheus.io:9090',
                        type: 'text'
                    },
                    {
                        label: 'demo.do.prometheus.io:8996',
                        type: 'text'
                    },
                    {
                        label: 'demo.do.prometheus.io:8999',
                        type: 'text'
                    },
                    {
                        label: 'demo.do.prometheus.io:8998',
                        type: 'text'
                    },
                    {
                        label: 'demo.do.prometheus.io:8997',
                        type: 'text'
                    }
                ],
                from: 19,
                to: 22,
                span: /^[a-zA-Z0-9_:]+$/,
            },
        },
        {
            title: 'autocomplete empty pattern',
            expr: 'labels.instance != ',
            pos: 19,
            expectedResult: {
                options: [
                    {
                        label: 'demo.do.prometheus.io:9093',
                        type: 'text'
                    },
                    {
                        label: 'http://localhost:9100',
                        type: 'text'
                    },
                    {
                        label: 'localhost:2019',
                        type: 'text'
                    },
                    {
                        label: 'demo.do.prometheus.io:3000',
                        type: 'text'
                    },
                    {
                        label: 'demo.do.prometheus.io:9100',
                        type: 'text'
                    },
                    {
                        label: 'demo.do.prometheus.io:9090',
                        type: 'text'
                    },
                    {
                        label: 'demo.do.prometheus.io:8996',
                        type: 'text'
                    },
                    {
                        label: 'demo.do.prometheus.io:8999',
                        type: 'text'
                    },
                    {
                        label: 'demo.do.prometheus.io:8998',
                        type: 'text'
                    },
                    {
                        label: 'demo.do.prometheus.io:8997',
                        type: 'text'
                    },
                ],

                from: 19,
                to: 19,
                span: /^[a-zA-Z0-9_:]+$/,
            },
        },
        {
            title: 'autocomplete empty pattern 2',
            expr: 'labels.instance !=         ',
            pos: 27,
            expectedResult: {
                options: [
                    {
                        label: 'demo.do.prometheus.io:9093',
                        type: 'text'
                    },
                    {
                        label: 'http://localhost:9100',
                        type: 'text'
                    },
                    {
                        label: 'localhost:2019',
                        type: 'text'
                    },
                    {
                        label: 'demo.do.prometheus.io:3000',
                        type: 'text'
                    },
                    {
                        label: 'demo.do.prometheus.io:9100',
                        type: 'text'
                    },
                    {
                        label: 'demo.do.prometheus.io:9090',
                        type: 'text'
                    },
                    {
                        label: 'demo.do.prometheus.io:8996',
                        type: 'text'
                    },
                    {
                        label: 'demo.do.prometheus.io:8999',
                        type: 'text'
                    },
                    {
                        label: 'demo.do.prometheus.io:8998',
                        type: 'text'
                    },
                    {
                        label: 'demo.do.prometheus.io:8997',
                        type: 'text'
                    },
                ],

                from: 27,
                to: 27,
                span: /^[a-zA-Z0-9_:]+$/,
            },
        },
        {
            title: 'autocomplete query matcher',
            expr: 'labels.instance ',
            pos: 16,
            expectedResult: {
                options: matcherTerms,
                from: 16,
                to: 16,
                span: /^[a-zA-Z0-9_:]+$/,
            },
        },
        {
            title: 'autocomplete query matcher 2',
            expr: 'labels.instance        ',
            pos: 23,
            expectedResult: {
                options: matcherTerms,
                from: 23,
                to: 23,
                span: /^[a-zA-Z0-9_:]+$/,
            },
        },
        {
            title: 'autocomplete query matcher 3',
            expr: '(labels.instance )',
            pos: 17,
            expectedResult: {
                options: matcherTerms,
                from: 17,
                to: 17,
                span: /^[a-zA-Z0-9_:]+$/,
            },
        },
        {
            title: 'autocomplete query operator',
            expr: '(labels.instance != test )',
            pos: 25,
            expectedResult: {
                options: operatorTerms,
                from: 25,
                to: 25,
                span: /^[a-zA-Z0-9_:]+$/,
            }
        },
        {
            title: 'autocomplete query operator 2',
            expr: '(labels.instance != test OR labels.test = other) ',
            pos: 49,
            expectedResult: {
                options: operatorTerms,
                from: 49,
                to: 49,
                span: /^[a-zA-Z0-9_:]+$/,
            }
        }
    ];
    testCases.forEach((value) => {
        it(value.title, () => {
            const state = createEditorState(value.expr);
            const context = new CompletionContext(state, value.pos, true);
            const completion = new Complete(objectList);
            const result = completion.kvSearch(context);
            chai.expect(value.expectedResult).to.deep.equal(result);
        })
    })
})
