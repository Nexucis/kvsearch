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

import chai from 'chai';
import {KVSearch, Query, QueryNode} from './search';

describe('match test', () => {
    const testSuite = [
        {
            title: 'fuzzy match with matching result',
            obj: {
                'discoveredLabels': {
                    '__address__': 'demo.do.prometheus.io:9093',
                    '__meta_filepath': '/etc/prometheus/file_sd/alertmanager.yml',
                    '__metrics_path__': '/metrics',
                    '__scheme__': 'http',
                    'env': 'demo',
                    'job': 'alertmanager'
                },
                'labels': {
                    'env': 'demo',
                    'instance': 'demo.do.prometheus.io:9093',
                    'job': 'alertmanager'
                },
                'scrapePool': 'alertmanager',
                'scrapeUrl': 'http://demo.do.prometheus.io:9093/metrics',
                'globalUrl': 'http://demo.do.prometheus.io:9093/metrics',
                'lastError': '',
                'lastScrape': '2021-11-29T11:26:19.338578796Z',
                'lastScrapeDuration': 0.005635169,
                'health': 'up'
            },
            query: {keyPath: ['labels', 'job'], match: 'fuzzy' as 'exact' | 'fuzzy' | 'negative', pattern: 'alert'},
            conf: {includeMatches: true},
            result: {
                score: 25,
                original: {
                    'discoveredLabels': {
                        '__address__': 'demo.do.prometheus.io:9093',
                        '__meta_filepath': '/etc/prometheus/file_sd/alertmanager.yml',
                        '__metrics_path__': '/metrics',
                        '__scheme__': 'http',
                        'env': 'demo',
                        'job': 'alertmanager'
                    },
                    'labels': {
                        'env': 'demo',
                        'instance': 'demo.do.prometheus.io:9093',
                        'job': 'alertmanager'
                    },
                    'scrapePool': 'alertmanager',
                    'scrapeUrl': 'http://demo.do.prometheus.io:9093/metrics',
                    'globalUrl': 'http://demo.do.prometheus.io:9093/metrics',
                    'lastError': '',
                    'lastScrape': '2021-11-29T11:26:19.338578796Z',
                    'lastScrapeDuration': 0.005635169,
                    'health': 'up'
                },
                rendered: {
                    'discoveredLabels': {
                        '__address__': 'demo.do.prometheus.io:9093',
                        '__meta_filepath': '/etc/prometheus/file_sd/alertmanager.yml',
                        '__metrics_path__': '/metrics',
                        '__scheme__': 'http',
                        'env': 'demo',
                        'job': 'alertmanager'
                    },
                    'labels': {
                        'env': 'demo',
                        'instance': 'demo.do.prometheus.io:9093',
                        'job': 'alertmanager'
                    },
                    'scrapePool': 'alertmanager',
                    'scrapeUrl': 'http://demo.do.prometheus.io:9093/metrics',
                    'globalUrl': 'http://demo.do.prometheus.io:9093/metrics',
                    'lastError': '',
                    'lastScrape': '2021-11-29T11:26:19.338578796Z',
                    'lastScrapeDuration': 0.005635169,
                    'health': 'up'
                },
                matched: [
                    {
                        intervals: [{from: 0, to: 4}],
                        path: ['labels', 'job'],
                        value: 'alertmanager'
                    }
                ]
            }
        },
        {
            title: 'exact match with matching result',
            obj: {
                'discoveredLabels': {
                    '__address__': 'demo.do.prometheus.io:9093',
                    '__meta_filepath': '/etc/prometheus/file_sd/alertmanager.yml',
                    '__metrics_path__': '/metrics',
                    '__scheme__': 'http',
                    'env': 'demo',
                    'job': 'alertmanager'
                },
                'labels': {
                    'env': 'demo',
                    'instance': 'demo.do.prometheus.io:9093',
                    'job': 'alertmanager'
                },
                'scrapePool': 'alertmanager',
                'scrapeUrl': 'http://demo.do.prometheus.io:9093/metrics',
                'globalUrl': 'http://demo.do.prometheus.io:9093/metrics',
                'lastError': '',
                'lastScrape': '2021-11-29T11:26:19.338578796Z',
                'lastScrapeDuration': 0.005635169,
                'health': 'up'
            },
            query: {keyPath: ['labels'], match: 'exact' as 'exact' | 'fuzzy' | 'negative', pattern: 'instance'},
            conf: {includeMatches: true},
            result: {
                score: Infinity,
                original: {
                    'discoveredLabels': {
                        '__address__': 'demo.do.prometheus.io:9093',
                        '__meta_filepath': '/etc/prometheus/file_sd/alertmanager.yml',
                        '__metrics_path__': '/metrics',
                        '__scheme__': 'http',
                        'env': 'demo',
                        'job': 'alertmanager'
                    },
                    'labels': {
                        'env': 'demo',
                        'instance': 'demo.do.prometheus.io:9093',
                        'job': 'alertmanager'
                    },
                    'scrapePool': 'alertmanager',
                    'scrapeUrl': 'http://demo.do.prometheus.io:9093/metrics',
                    'globalUrl': 'http://demo.do.prometheus.io:9093/metrics',
                    'lastError': '',
                    'lastScrape': '2021-11-29T11:26:19.338578796Z',
                    'lastScrapeDuration': 0.005635169,
                    'health': 'up'
                },
                rendered: {
                    'discoveredLabels': {
                        '__address__': 'demo.do.prometheus.io:9093',
                        '__meta_filepath': '/etc/prometheus/file_sd/alertmanager.yml',
                        '__metrics_path__': '/metrics',
                        '__scheme__': 'http',
                        'env': 'demo',
                        'job': 'alertmanager'
                    },
                    'labels': {
                        'env': 'demo',
                        'instance': 'demo.do.prometheus.io:9093',
                        'job': 'alertmanager'
                    },
                    'scrapePool': 'alertmanager',
                    'scrapeUrl': 'http://demo.do.prometheus.io:9093/metrics',
                    'globalUrl': 'http://demo.do.prometheus.io:9093/metrics',
                    'lastError': '',
                    'lastScrape': '2021-11-29T11:26:19.338578796Z',
                    'lastScrapeDuration': 0.005635169,
                    'health': 'up'
                },
                matched: [
                    {
                        intervals: [{from: 0, to: 7}],
                        path: ['labels'],
                        value: 'instance'
                    }
                ]
            }
        },
        {
            title: 'less match',
            obj: {
                'discoveredLabels': {
                    '__address__': 'demo.do.prometheus.io:9093',
                    '__meta_filepath': '/etc/prometheus/file_sd/alertmanager.yml',
                    '__metrics_path__': '/metrics',
                    '__scheme__': 'http',
                    'env': 'demo',
                    'job': 'alertmanager'
                },
                'labels': {
                    'env': 'demo',
                    'instance': 'demo.do.prometheus.io:9093',
                    'job': 'alertmanager'
                },
                'scrapePool': 'alertmanager',
                'scrapeUrl': 'http://demo.do.prometheus.io:9093/metrics',
                'globalUrl': 'http://demo.do.prometheus.io:9093/metrics',
                'lastError': '',
                'lastScrape': '2021-11-29T11:26:19.338578796Z',
                'lastScrapeDuration': 0.005635169,
                'health': 'up'
            },
            query: {
                keyPath: ['lastScrapeDuration'],
                match: 'less' as 'exact' | 'fuzzy' | 'negative' | 'greater' | 'greaterEqual' | 'less' | 'lessEqual',
                pattern: 2
            },
            conf: {},
            result: {
                score: 1,
                original: {
                    'discoveredLabels': {
                        '__address__': 'demo.do.prometheus.io:9093',
                        '__meta_filepath': '/etc/prometheus/file_sd/alertmanager.yml',
                        '__metrics_path__': '/metrics',
                        '__scheme__': 'http',
                        'env': 'demo',
                        'job': 'alertmanager'
                    },
                    'labels': {
                        'env': 'demo',
                        'instance': 'demo.do.prometheus.io:9093',
                        'job': 'alertmanager'
                    },
                    'scrapePool': 'alertmanager',
                    'scrapeUrl': 'http://demo.do.prometheus.io:9093/metrics',
                    'globalUrl': 'http://demo.do.prometheus.io:9093/metrics',
                    'lastError': '',
                    'lastScrape': '2021-11-29T11:26:19.338578796Z',
                    'lastScrapeDuration': 0.005635169,
                    'health': 'up'
                },
                rendered: {
                    'discoveredLabels': {
                        '__address__': 'demo.do.prometheus.io:9093',
                        '__meta_filepath': '/etc/prometheus/file_sd/alertmanager.yml',
                        '__metrics_path__': '/metrics',
                        '__scheme__': 'http',
                        'env': 'demo',
                        'job': 'alertmanager'
                    },
                    'labels': {
                        'env': 'demo',
                        'instance': 'demo.do.prometheus.io:9093',
                        'job': 'alertmanager'
                    },
                    'scrapePool': 'alertmanager',
                    'scrapeUrl': 'http://demo.do.prometheus.io:9093/metrics',
                    'globalUrl': 'http://demo.do.prometheus.io:9093/metrics',
                    'lastError': '',
                    'lastScrape': '2021-11-29T11:26:19.338578796Z',
                    'lastScrapeDuration': 0.005635169,
                    'health': 'up'
                },
                matched: undefined
            }
        },
    ]
    for (const test of testSuite) {
        it(test.title, () => {
            const search = new KVSearch()
            chai.expect(search.match(test.query, test.obj, test.conf)).to.deep.equal(test.result)
        })
    }
})

const objectList = [
    {
        'discoveredLabels': {
            '__address__': 'demo.do.prometheus.io:9093',
            '__meta_filepath': '/etc/prometheus/file_sd/alertmanager.yml',
            '__metrics_path__': '/metrics',
            '__scheme__': 'http',
            'env': 'demo',
            'job': 'alertmanager'
        },
        'labels': {
            'env': 'demo',
            'instance': 'demo.do.prometheus.io:9093',
            'job': 'alertmanager'
        },
        'scrapePool': 'alertmanager',
        'scrapeUrl': 'http://demo.do.prometheus.io:9093/metrics',
        'globalUrl': 'http://demo.do.prometheus.io:9093/metrics',
        'lastError': '',
        'lastScrape': '2021-11-29T11:26:19.338578796Z',
        'lastScrapeDuration': 0.005635169,
        'health': 'up'
    },
    {
        'discoveredLabels': {
            '__address__': 'http://localhost:9100',
            '__metrics_path__': '/probe',
            '__param_module': 'http_2xx',
            '__scheme__': 'http',
            'job': 'blackbox'
        },
        'labels': {
            'instance': 'http://localhost:9100',
            'job': 'blackbox'
        },
        'scrapePool': 'blackbox',
        'scrapeUrl': 'http://127.0.0.1:9115/probe?module=http_2xx&target=http%3A%2F%2Flocalhost%3A9100',
        'globalUrl': 'http://demo.do.prometheus.io:9115/probe?module=http_2xx&target=http%3A%2F%2Flocalhost%3A9100',
        'lastError': '',
        'lastScrape': '2021-11-29T11:26:23.286374389Z',
        'lastScrapeDuration': 0.003101211,
        'health': 'up'
    },
    {
        'discoveredLabels': {
            '__address__': 'localhost:2019',
            '__metrics_path__': '/metrics',
            '__scheme__': 'http',
            'job': 'caddy'
        },
        'labels': {
            'instance': 'localhost:2019',
            'job': 'caddy'
        },
        'scrapePool': 'caddy',
        'scrapeUrl': 'http://localhost:2019/metrics',
        'globalUrl': 'http://demo.do.prometheus.io:2019/metrics',
        'lastError': '',
        'lastScrape': '2021-11-29T11:26:19.141536703Z',
        'lastScrapeDuration': 0.052116523,
        'health': 'up'
    },
    {
        'discoveredLabels': {
            '__address__': 'demo.do.prometheus.io:3000',
            '__metrics_path__': '/metrics',
            '__scheme__': 'http',
            'job': 'grafana'
        },
        'labels': {
            'instance': 'demo.do.prometheus.io:3000',
            'job': 'grafana'
        },
        'scrapePool': 'grafana',
        'scrapeUrl': 'http://demo.do.prometheus.io:3000/metrics',
        'globalUrl': 'http://demo.do.prometheus.io:3000/metrics',
        'lastError': '',
        'lastScrape': '2021-11-29T11:26:19.917137204Z',
        'lastScrapeDuration': 0.007423624,
        'health': 'up'
    },
    {
        'discoveredLabels': {
            '__address__': 'demo.do.prometheus.io:9100',
            '__meta_filepath': '/etc/prometheus/file_sd/node.yml',
            '__metrics_path__': '/metrics',
            '__scheme__': 'http',
            'env': 'demo',
            'job': 'node'
        },
        'labels': {
            'env': 'demo',
            'instance': 'demo.do.prometheus.io:9100',
            'job': 'node'
        },
        'scrapePool': 'node',
        'scrapeUrl': 'http://demo.do.prometheus.io:9100/metrics',
        'globalUrl': 'http://demo.do.prometheus.io:9100/metrics',
        'lastError': '',
        'lastScrape': '2021-11-29T11:26:13.434412959Z',
        'lastScrapeDuration': 0.121943025,
        'health': 'up'
    },
    {
        'discoveredLabels': {
            '__address__': 'demo.do.prometheus.io:9090',
            '__metrics_path__': '/metrics',
            '__scheme__': 'http',
            'job': 'prometheus'
        },
        'labels': {
            'instance': 'demo.do.prometheus.io:9090',
            'job': 'prometheus'
        },
        'scrapePool': 'prometheus',
        'scrapeUrl': 'http://demo.do.prometheus.io:9090/metrics',
        'globalUrl': 'http://demo.do.prometheus.io:9090/metrics',
        'lastError': '',
        'lastScrape': '2021-11-29T11:26:22.157765567Z',
        'lastScrapeDuration': 0.01639197,
        'health': 'up'
    },
    {
        'discoveredLabels': {
            '__address__': 'demo.do.prometheus.io:8999',
            '__meta_filepath': '/etc/prometheus/file_sd/random.yml',
            '__metrics_path__': '/metrics',
            '__scheme__': 'http',
            'job': 'random'
        },
        'labels': {
            'instance': 'demo.do.prometheus.io:8999',
            'job': 'random'
        },
        'scrapePool': 'random',
        'scrapeUrl': 'http://demo.do.prometheus.io:8999/metrics',
        'globalUrl': 'http://demo.do.prometheus.io:8999/metrics',
        'lastError': '',
        'lastScrape': '2021-11-29T11:26:15.080292611Z',
        'lastScrapeDuration': 0.003717954,
        'health': 'up'
    },
    {
        'discoveredLabels': {
            '__address__': 'demo.do.prometheus.io:8998',
            '__meta_filepath': '/etc/prometheus/file_sd/random.yml',
            '__metrics_path__': '/metrics',
            '__scheme__': 'http',
            'job': 'random'
        },
        'labels': {
            'instance': 'demo.do.prometheus.io:8998',
            'job': 'random'
        },
        'scrapePool': 'random',
        'scrapeUrl': 'http://demo.do.prometheus.io:8998/metrics',
        'globalUrl': 'http://demo.do.prometheus.io:8998/metrics',
        'lastError': '',
        'lastScrape': '2021-11-29T11:26:19.863430121Z',
        'lastScrapeDuration': 0.003379551,
        'health': 'up'
    },
    {
        'discoveredLabels': {
            '__address__': 'demo.do.prometheus.io:8997',
            '__meta_filepath': '/etc/prometheus/file_sd/random.yml',
            '__metrics_path__': '/metrics',
            '__scheme__': 'http',
            'job': 'random'
        },
        'labels': {
            'instance': 'demo.do.prometheus.io:8997',
            'job': 'random'
        },
        'scrapePool': 'random',
        'scrapeUrl': 'http://demo.do.prometheus.io:8997/metrics',
        'globalUrl': 'http://demo.do.prometheus.io:8997/metrics',
        'lastError': '',
        'lastScrape': '2021-11-29T11:26:15.221692269Z',
        'lastScrapeDuration': 0.00294093,
        'health': 'up'
    },
    {
        'discoveredLabels': {
            '__address__': 'demo.do.prometheus.io:8996',
            '__meta_filepath': '/etc/prometheus/file_sd/random.yml',
            '__metrics_path__': '/metrics',
            '__scheme__': 'http',
            'job': 'random'
        },
        'labels': {
            'instance': 'demo.do.prometheus.io:8996',
            'job': 'random'
        },
        'scrapePool': 'random',
        'scrapeUrl': 'http://demo.do.prometheus.io:8996/metrics',
        'globalUrl': 'http://demo.do.prometheus.io:8996/metrics',
        'lastError': '',
        'lastScrape': '2021-11-29T11:26:10.533656426Z',
        'lastScrapeDuration': 0.004148609,
        'health': 'up'
    }
];

describe('filterWithQuery test', () => {
    const testSuite = [
        {
            title: 'complex query with fuzzy and exact match with matching result',
            list: objectList,
            query: {
                operator: 'and',
                left: {
                    match: 'fuzzy',
                    keyPath: ['discoveredLabels', '__address__'],
                    pattern: 'demo',
                },
                right: {
                    match: 'exact',
                    keyPath: ['labels', 'env'],
                    pattern: 'demo'
                }
            } as QueryNode,
            conf: {includeMatches: true},
            result: [
                {
                    index: 0,
                    original: {
                        discoveredLabels: {
                            __address__: 'demo.do.prometheus.io:9093',
                            __meta_filepath: '/etc/prometheus/file_sd/alertmanager.yml',
                            __metrics_path__: '/metrics',
                            __scheme__: 'http',
                            env: 'demo',
                            job: 'alertmanager',
                        },
                        globalUrl: 'http://demo.do.prometheus.io:9093/metrics',
                        health: 'up',
                        labels: {
                            'env': 'demo',
                            'instance': 'demo.do.prometheus.io:9093',
                            'job': 'alertmanager',
                        },
                        'lastError': '',
                        'lastScrape': '2021-11-29T11:26:19.338578796Z',
                        'lastScrapeDuration': 0.005635169,
                        'scrapePool': 'alertmanager',
                        'scrapeUrl': 'http://demo.do.prometheus.io:9093/metrics',
                    },
                    rendered: {
                        discoveredLabels: {
                            __address__: 'demo.do.prometheus.io:9093',
                            __meta_filepath: '/etc/prometheus/file_sd/alertmanager.yml',
                            __metrics_path__: '/metrics',
                            __scheme__: 'http',
                            env: 'demo',
                            job: 'alertmanager',
                        },
                        globalUrl: 'http://demo.do.prometheus.io:9093/metrics',
                        health: 'up',
                        labels: {
                            'env': 'demo',
                            'instance': 'demo.do.prometheus.io:9093',
                            'job': 'alertmanager',
                        },
                        'lastError': '',
                        'lastScrape': '2021-11-29T11:26:19.338578796Z',
                        'lastScrapeDuration': 0.005635169,
                        'scrapePool': 'alertmanager',
                        'scrapeUrl': 'http://demo.do.prometheus.io:9093/metrics',
                    },
                    matched: [
                        {
                            intervals: [{from: 0, to: 3}],
                            path: ['labels', 'env',],
                            value: 'demo'
                        },
                        {
                            intervals: [{from: 0, to: 3}],
                            path: ['discoveredLabels', '__address__'],
                            value: 'demo.do.prometheus.io:9093'
                        },
                    ],
                    score: Infinity,
                },
                {
                    index: 4,
                    original: {
                        discoveredLabels: {
                            __address__: 'demo.do.prometheus.io:9100',
                            __meta_filepath: '/etc/prometheus/file_sd/node.yml',
                            __metrics_path__: '/metrics',
                            __scheme__: 'http',
                            env: 'demo',
                            job: 'node',
                        },
                        globalUrl: 'http://demo.do.prometheus.io:9100/metrics',
                        health: 'up',
                        labels: {
                            env: 'demo',
                            instance: 'demo.do.prometheus.io:9100',
                            job: 'node',
                        },
                        lastError: '',
                        lastScrape: '2021-11-29T11:26:13.434412959Z',
                        lastScrapeDuration: 0.121943025,
                        scrapePool: 'node',
                        scrapeUrl: 'http://demo.do.prometheus.io:9100/metrics',
                    },
                    rendered: {
                        discoveredLabels: {
                            __address__: 'demo.do.prometheus.io:9100',
                            __meta_filepath: '/etc/prometheus/file_sd/node.yml',
                            __metrics_path__: '/metrics',
                            __scheme__: 'http',
                            env: 'demo',
                            job: 'node',
                        },
                        globalUrl: 'http://demo.do.prometheus.io:9100/metrics',
                        health: 'up',
                        labels: {
                            env: 'demo',
                            instance: 'demo.do.prometheus.io:9100',
                            job: 'node',
                        },
                        lastError: '',
                        lastScrape: '2021-11-29T11:26:13.434412959Z',
                        lastScrapeDuration: 0.121943025,
                        scrapePool: 'node',
                        scrapeUrl: 'http://demo.do.prometheus.io:9100/metrics',
                    },
                    matched: [
                        {
                            intervals: [{from: 0, to: 3}],
                            path: ['labels', 'env'],
                            value: 'demo'
                        },
                        {
                            'intervals': [{from: 0, to: 3}],
                            path: ['discoveredLabels', '__address__'],
                            value: 'demo.do.prometheus.io:9100',
                        }
                    ],
                    score: Infinity,
                }
            ]

        },
        {
            title: 'query with regexp as a path',
            list: objectList,
            query: {
                match: 'fuzzy',
                pattern: 'demo',
                keyPath: ['labels', /.*/]
            } as Query,
            conf: {includeMatches: true},
            result: [
                {
                    index: 0,
                    original: {
                        'discoveredLabels': {
                            '__address__': 'demo.do.prometheus.io:9093',
                            '__meta_filepath': '/etc/prometheus/file_sd/alertmanager.yml',
                            '__metrics_path__': '/metrics',
                            '__scheme__': 'http',
                            'env': 'demo',
                            'job': 'alertmanager'
                        },
                        'labels': {
                            'env': 'demo',
                            'instance': 'demo.do.prometheus.io:9093',
                            'job': 'alertmanager'
                        },
                        'scrapePool': 'alertmanager',
                        'scrapeUrl': 'http://demo.do.prometheus.io:9093/metrics',
                        'globalUrl': 'http://demo.do.prometheus.io:9093/metrics',
                        'lastError': '',
                        'lastScrape': '2021-11-29T11:26:19.338578796Z',
                        'lastScrapeDuration': 0.005635169,
                        'health': 'up'
                    },
                    rendered: {
                        'discoveredLabels': {
                            '__address__': 'demo.do.prometheus.io:9093',
                            '__meta_filepath': '/etc/prometheus/file_sd/alertmanager.yml',
                            '__metrics_path__': '/metrics',
                            '__scheme__': 'http',
                            'env': 'demo',
                            'job': 'alertmanager'
                        },
                        'labels': {
                            'env': 'demo',
                            'instance': 'demo.do.prometheus.io:9093',
                            'job': 'alertmanager'
                        },
                        'scrapePool': 'alertmanager',
                        'scrapeUrl': 'http://demo.do.prometheus.io:9093/metrics',
                        'globalUrl': 'http://demo.do.prometheus.io:9093/metrics',
                        'lastError': '',
                        'lastScrape': '2021-11-29T11:26:19.338578796Z',
                        'lastScrapeDuration': 0.005635169,
                        'health': 'up'
                    },
                    matched: [
                        {
                            intervals: [{from: 0, to: 3}],
                            path: ['labels', 'instance'],
                            value: 'demo.do.prometheus.io:9093'
                        },
                        {
                            intervals: [{from: 0, to: 3}],
                            path: ['labels', 'env'],
                            value: 'demo'
                        },
                    ],
                    score: Infinity,
                },
                {
                    index: 3,
                    original: {
                        'discoveredLabels': {
                            '__address__': 'demo.do.prometheus.io:3000',
                            '__metrics_path__': '/metrics',
                            '__scheme__': 'http',
                            'job': 'grafana'
                        },
                        'labels': {
                            'instance': 'demo.do.prometheus.io:3000',
                            'job': 'grafana'
                        },
                        'scrapePool': 'grafana',
                        'scrapeUrl': 'http://demo.do.prometheus.io:3000/metrics',
                        'globalUrl': 'http://demo.do.prometheus.io:3000/metrics',
                        'lastError': '',
                        'lastScrape': '2021-11-29T11:26:19.917137204Z',
                        'lastScrapeDuration': 0.007423624,
                        'health': 'up'
                    },
                    rendered: {
                        'discoveredLabels': {
                            '__address__': 'demo.do.prometheus.io:3000',
                            '__metrics_path__': '/metrics',
                            '__scheme__': 'http',
                            'job': 'grafana'
                        },
                        'labels': {
                            'instance': 'demo.do.prometheus.io:3000',
                            'job': 'grafana'
                        },
                        'scrapePool': 'grafana',
                        'scrapeUrl': 'http://demo.do.prometheus.io:3000/metrics',
                        'globalUrl': 'http://demo.do.prometheus.io:3000/metrics',
                        'lastError': '',
                        'lastScrape': '2021-11-29T11:26:19.917137204Z',
                        'lastScrapeDuration': 0.007423624,
                        'health': 'up'
                    },
                    matched: [
                        {
                            intervals: [{from: 0, to: 3}],
                            path: ['labels', 'instance'],
                            value: 'demo.do.prometheus.io:3000'
                        }
                    ],
                    score: 16,
                },
                {
                    index: 4,
                    original: {
                        'discoveredLabels': {
                            '__address__': 'demo.do.prometheus.io:9100',
                            '__meta_filepath': '/etc/prometheus/file_sd/node.yml',
                            '__metrics_path__': '/metrics',
                            '__scheme__': 'http',
                            'env': 'demo',
                            'job': 'node'
                        },
                        'labels': {
                            'env': 'demo',
                            'instance': 'demo.do.prometheus.io:9100',
                            'job': 'node'
                        },
                        'scrapePool': 'node',
                        'scrapeUrl': 'http://demo.do.prometheus.io:9100/metrics',
                        'globalUrl': 'http://demo.do.prometheus.io:9100/metrics',
                        'lastError': '',
                        'lastScrape': '2021-11-29T11:26:13.434412959Z',
                        'lastScrapeDuration': 0.121943025,
                        'health': 'up'
                    },
                    rendered: {
                        'discoveredLabels': {
                            '__address__': 'demo.do.prometheus.io:9100',
                            '__meta_filepath': '/etc/prometheus/file_sd/node.yml',
                            '__metrics_path__': '/metrics',
                            '__scheme__': 'http',
                            'env': 'demo',
                            'job': 'node'
                        },
                        'labels': {
                            'env': 'demo',
                            'instance': 'demo.do.prometheus.io:9100',
                            'job': 'node'
                        },
                        'scrapePool': 'node',
                        'scrapeUrl': 'http://demo.do.prometheus.io:9100/metrics',
                        'globalUrl': 'http://demo.do.prometheus.io:9100/metrics',
                        'lastError': '',
                        'lastScrape': '2021-11-29T11:26:13.434412959Z',
                        'lastScrapeDuration': 0.121943025,
                        'health': 'up'
                    },
                    matched: [
                        {
                            'intervals': [{from: 0, to: 3}],
                            path: ['labels', 'instance'],
                            value: 'demo.do.prometheus.io:9100',
                        },
                        {
                            intervals: [{from: 0, to: 3}],
                            path: ['labels', 'env'],
                            value: 'demo'
                        }
                    ],
                    score: Infinity,
                },
                {
                    index: 5,
                    original: {
                        'discoveredLabels': {
                            '__address__': 'demo.do.prometheus.io:9090',
                            '__metrics_path__': '/metrics',
                            '__scheme__': 'http',
                            'job': 'prometheus'
                        },
                        'labels': {
                            'instance': 'demo.do.prometheus.io:9090',
                            'job': 'prometheus'
                        },
                        'scrapePool': 'prometheus',
                        'scrapeUrl': 'http://demo.do.prometheus.io:9090/metrics',
                        'globalUrl': 'http://demo.do.prometheus.io:9090/metrics',
                        'lastError': '',
                        'lastScrape': '2021-11-29T11:26:22.157765567Z',
                        'lastScrapeDuration': 0.01639197,
                        'health': 'up'
                    },
                    rendered: {
                        'discoveredLabels': {
                            '__address__': 'demo.do.prometheus.io:9090',
                            '__metrics_path__': '/metrics',
                            '__scheme__': 'http',
                            'job': 'prometheus'
                        },
                        'labels': {
                            'instance': 'demo.do.prometheus.io:9090',
                            'job': 'prometheus'
                        },
                        'scrapePool': 'prometheus',
                        'scrapeUrl': 'http://demo.do.prometheus.io:9090/metrics',
                        'globalUrl': 'http://demo.do.prometheus.io:9090/metrics',
                        'lastError': '',
                        'lastScrape': '2021-11-29T11:26:22.157765567Z',
                        'lastScrapeDuration': 0.01639197,
                        'health': 'up'
                    },
                    matched: [
                        {
                            'intervals': [{from: 0, to: 3}],
                            path: ['labels', 'instance'],
                            value: 'demo.do.prometheus.io:9090',
                        },
                    ],
                    score: 16,
                },
                {
                    index: 6,
                    original: {
                        'discoveredLabels': {
                            '__address__': 'demo.do.prometheus.io:8999',
                            '__meta_filepath': '/etc/prometheus/file_sd/random.yml',
                            '__metrics_path__': '/metrics',
                            '__scheme__': 'http',
                            'job': 'random'
                        },
                        'labels': {
                            'instance': 'demo.do.prometheus.io:8999',
                            'job': 'random'
                        },
                        'scrapePool': 'random',
                        'scrapeUrl': 'http://demo.do.prometheus.io:8999/metrics',
                        'globalUrl': 'http://demo.do.prometheus.io:8999/metrics',
                        'lastError': '',
                        'lastScrape': '2021-11-29T11:26:15.080292611Z',
                        'lastScrapeDuration': 0.003717954,
                        'health': 'up'
                    },
                    rendered: {
                        'discoveredLabels': {
                            '__address__': 'demo.do.prometheus.io:8999',
                            '__meta_filepath': '/etc/prometheus/file_sd/random.yml',
                            '__metrics_path__': '/metrics',
                            '__scheme__': 'http',
                            'job': 'random'
                        },
                        'labels': {
                            'instance': 'demo.do.prometheus.io:8999',
                            'job': 'random'
                        },
                        'scrapePool': 'random',
                        'scrapeUrl': 'http://demo.do.prometheus.io:8999/metrics',
                        'globalUrl': 'http://demo.do.prometheus.io:8999/metrics',
                        'lastError': '',
                        'lastScrape': '2021-11-29T11:26:15.080292611Z',
                        'lastScrapeDuration': 0.003717954,
                        'health': 'up'
                    },
                    matched: [
                        {
                            intervals: [{from: 0, to: 3}],
                            path: ['labels', 'instance'],
                            value: 'demo.do.prometheus.io:8999'
                        }
                    ],
                    score: 16,
                },
                {
                    index: 7,
                    original: {
                        'discoveredLabels': {
                            '__address__': 'demo.do.prometheus.io:8998',
                            '__meta_filepath': '/etc/prometheus/file_sd/random.yml',
                            '__metrics_path__': '/metrics',
                            '__scheme__': 'http',
                            'job': 'random'
                        },
                        'labels': {
                            'instance': 'demo.do.prometheus.io:8998',
                            'job': 'random'
                        },
                        'scrapePool': 'random',
                        'scrapeUrl': 'http://demo.do.prometheus.io:8998/metrics',
                        'globalUrl': 'http://demo.do.prometheus.io:8998/metrics',
                        'lastError': '',
                        'lastScrape': '2021-11-29T11:26:19.863430121Z',
                        'lastScrapeDuration': 0.003379551,
                        'health': 'up'
                    },
                    rendered: {
                        'discoveredLabels': {
                            '__address__': 'demo.do.prometheus.io:8998',
                            '__meta_filepath': '/etc/prometheus/file_sd/random.yml',
                            '__metrics_path__': '/metrics',
                            '__scheme__': 'http',
                            'job': 'random'
                        },
                        'labels': {
                            'instance': 'demo.do.prometheus.io:8998',
                            'job': 'random'
                        },
                        'scrapePool': 'random',
                        'scrapeUrl': 'http://demo.do.prometheus.io:8998/metrics',
                        'globalUrl': 'http://demo.do.prometheus.io:8998/metrics',
                        'lastError': '',
                        'lastScrape': '2021-11-29T11:26:19.863430121Z',
                        'lastScrapeDuration': 0.003379551,
                        'health': 'up'
                    },
                    matched: [
                        {
                            intervals: [{from: 0, to: 3}],
                            path: ['labels', 'instance'],
                            value: 'demo.do.prometheus.io:8998'
                        }
                    ],
                    score: 16,
                },
                {
                    index: 8,
                    original: {
                        'discoveredLabels': {
                            '__address__': 'demo.do.prometheus.io:8997',
                            '__meta_filepath': '/etc/prometheus/file_sd/random.yml',
                            '__metrics_path__': '/metrics',
                            '__scheme__': 'http',
                            'job': 'random'
                        },
                        'labels': {
                            'instance': 'demo.do.prometheus.io:8997',
                            'job': 'random'
                        },
                        'scrapePool': 'random',
                        'scrapeUrl': 'http://demo.do.prometheus.io:8997/metrics',
                        'globalUrl': 'http://demo.do.prometheus.io:8997/metrics',
                        'lastError': '',
                        'lastScrape': '2021-11-29T11:26:15.221692269Z',
                        'lastScrapeDuration': 0.00294093,
                        'health': 'up'
                    },
                    rendered: {
                        'discoveredLabels': {
                            '__address__': 'demo.do.prometheus.io:8997',
                            '__meta_filepath': '/etc/prometheus/file_sd/random.yml',
                            '__metrics_path__': '/metrics',
                            '__scheme__': 'http',
                            'job': 'random'
                        },
                        'labels': {
                            'instance': 'demo.do.prometheus.io:8997',
                            'job': 'random'
                        },
                        'scrapePool': 'random',
                        'scrapeUrl': 'http://demo.do.prometheus.io:8997/metrics',
                        'globalUrl': 'http://demo.do.prometheus.io:8997/metrics',
                        'lastError': '',
                        'lastScrape': '2021-11-29T11:26:15.221692269Z',
                        'lastScrapeDuration': 0.00294093,
                        'health': 'up'
                    },
                    matched: [
                        {
                            intervals: [{from: 0, to: 3}],
                            path: ['labels', 'instance'],
                            value: 'demo.do.prometheus.io:8997'
                        }
                    ],
                    score: 16,
                },
                {
                    index: 9,
                    original: {
                        'discoveredLabels': {
                            '__address__': 'demo.do.prometheus.io:8996',
                            '__meta_filepath': '/etc/prometheus/file_sd/random.yml',
                            '__metrics_path__': '/metrics',
                            '__scheme__': 'http',
                            'job': 'random'
                        },
                        'labels': {
                            'instance': 'demo.do.prometheus.io:8996',
                            'job': 'random'
                        },
                        'scrapePool': 'random',
                        'scrapeUrl': 'http://demo.do.prometheus.io:8996/metrics',
                        'globalUrl': 'http://demo.do.prometheus.io:8996/metrics',
                        'lastError': '',
                        'lastScrape': '2021-11-29T11:26:10.533656426Z',
                        'lastScrapeDuration': 0.004148609,
                        'health': 'up'
                    },
                    rendered: {
                        'discoveredLabels': {
                            '__address__': 'demo.do.prometheus.io:8996',
                            '__meta_filepath': '/etc/prometheus/file_sd/random.yml',
                            '__metrics_path__': '/metrics',
                            '__scheme__': 'http',
                            'job': 'random'
                        },
                        'labels': {
                            'instance': 'demo.do.prometheus.io:8996',
                            'job': 'random'
                        },
                        'scrapePool': 'random',
                        'scrapeUrl': 'http://demo.do.prometheus.io:8996/metrics',
                        'globalUrl': 'http://demo.do.prometheus.io:8996/metrics',
                        'lastError': '',
                        'lastScrape': '2021-11-29T11:26:10.533656426Z',
                        'lastScrapeDuration': 0.004148609,
                        'health': 'up'
                    },
                    matched: [
                        {
                            intervals: [{from: 0, to: 3}],
                            path: ['labels', 'instance'],
                            value: 'demo.do.prometheus.io:8996'
                        }
                    ],
                    score: 16,
                },
            ]

        },
    ]
    for (const test of testSuite) {
        it(test.title, () => {
            const search = new KVSearch()
            chai.expect(search.filterWithQuery(test.query, test.list, test.conf)).to.deep.equal(test.result)
        })
    }
})

describe('filter test', () => {
    const testSuite = [
        {
            title: 'search on labels key',
            list: objectList,
            pattern: 'env',
            conf: {includeMatches: true},
            result: [
                {
                    index: 0,
                    original: {
                        discoveredLabels: {
                            __address__: 'demo.do.prometheus.io:9093',
                            __meta_filepath: '/etc/prometheus/file_sd/alertmanager.yml',
                            __metrics_path__: '/metrics',
                            __scheme__: 'http',
                            env: 'demo',
                            job: 'alertmanager',
                        },
                        globalUrl: 'http://demo.do.prometheus.io:9093/metrics',
                        health: 'up',
                        labels: {
                            'env': 'demo',
                            'instance': 'demo.do.prometheus.io:9093',
                            'job': 'alertmanager',
                        },
                        'lastError': '',
                        'lastScrape': '2021-11-29T11:26:19.338578796Z',
                        'lastScrapeDuration': 0.005635169,
                        'scrapePool': 'alertmanager',
                        'scrapeUrl': 'http://demo.do.prometheus.io:9093/metrics',
                    },
                    rendered: {
                        discoveredLabels: {
                            __address__: 'demo.do.prometheus.io:9093',
                            __meta_filepath: '/etc/prometheus/file_sd/alertmanager.yml',
                            __metrics_path__: '/metrics',
                            __scheme__: 'http',
                            env: 'demo',
                            job: 'alertmanager',
                        },
                        globalUrl: 'http://demo.do.prometheus.io:9093/metrics',
                        health: 'up',
                        labels: {
                            '<strong>env</strong>': 'demo',
                            'instance': 'demo.do.prometheus.io:9093',
                            'job': 'alertmanager',
                        },
                        'lastError': '',
                        'lastScrape': '2021-11-29T11:26:19.338578796Z',
                        'lastScrapeDuration': 0.005635169,
                        'scrapePool': 'alertmanager',
                        'scrapeUrl': 'http://demo.do.prometheus.io:9093/metrics',
                    },
                    matched: [
                        {
                            intervals: [{from: 0, to: 2}],
                            path: ['labels'],
                            value: 'env'
                        },
                    ],
                    score: Infinity,
                },
                {
                    index: 4,
                    original: {
                        discoveredLabels: {
                            __address__: 'demo.do.prometheus.io:9100',
                            __meta_filepath: '/etc/prometheus/file_sd/node.yml',
                            __metrics_path__: '/metrics',
                            __scheme__: 'http',
                            env: 'demo',
                            job: 'node',
                        },
                        globalUrl: 'http://demo.do.prometheus.io:9100/metrics',
                        health: 'up',
                        labels: {
                            env: 'demo',
                            instance: 'demo.do.prometheus.io:9100',
                            job: 'node',
                        },
                        lastError: '',
                        lastScrape: '2021-11-29T11:26:13.434412959Z',
                        lastScrapeDuration: 0.121943025,
                        scrapePool: 'node',
                        scrapeUrl: 'http://demo.do.prometheus.io:9100/metrics',
                    },
                    rendered: {
                        discoveredLabels: {
                            __address__: 'demo.do.prometheus.io:9100',
                            __meta_filepath: '/etc/prometheus/file_sd/node.yml',
                            __metrics_path__: '/metrics',
                            __scheme__: 'http',
                            env: 'demo',
                            job: 'node',
                        },
                        globalUrl: 'http://demo.do.prometheus.io:9100/metrics',
                        health: 'up',
                        labels: {
                            '<strong>env</strong>': 'demo',
                            instance: 'demo.do.prometheus.io:9100',
                            job: 'node',
                        },
                        lastError: '',
                        lastScrape: '2021-11-29T11:26:13.434412959Z',
                        lastScrapeDuration: 0.121943025,
                        scrapePool: 'node',
                        scrapeUrl: 'http://demo.do.prometheus.io:9100/metrics',
                    },
                    matched: [
                        {
                            intervals: [{from: 0, to: 2}],
                            path: ['labels'],
                            value: 'env'
                        }
                    ],
                    score: Infinity,
                }
            ]
        },
        {
            title: 'search with excluded char',
            list: objectList,
            pattern: 'demo prometheus 9100',
            conf: {includeMatches: true, excludedChars: [' ']},
            result: [
                {
                    index: 4,
                    original: {
                        discoveredLabels: {
                            '__address__': 'demo.do.prometheus.io:9100',
                            '__meta_filepath': '/etc/prometheus/file_sd/node.yml',
                            '__metrics_path__': '/metrics',
                            '__scheme__': 'http',
                            'env': 'demo',
                            'job': 'node'
                        },
                        labels: {
                            'env': 'demo',
                            'instance': 'demo.do.prometheus.io:9100',
                            'job': 'node'
                        },
                        scrapePool: 'node',
                        scrapeUrl: 'http://demo.do.prometheus.io:9100/metrics',
                        globalUrl: 'http://demo.do.prometheus.io:9100/metrics',
                        lastError: '',
                        lastScrape: '2021-11-29T11:26:13.434412959Z',
                        lastScrapeDuration: 0.121943025,
                        health: 'up'
                    },
                    rendered: {
                        discoveredLabels: {
                            '__address__': 'demo.do.prometheus.io:9100',
                            '__meta_filepath': '/etc/prometheus/file_sd/node.yml',
                            '__metrics_path__': '/metrics',
                            '__scheme__': 'http',
                            'env': 'demo',
                            'job': 'node'
                        },
                        labels: {
                            'env': 'demo',
                            'instance': '<strong>demo</strong>.do.<strong>prometheus</strong>.io:<strong>9100</strong>',
                            'job': 'node'
                        },
                        scrapePool: 'node',
                        scrapeUrl: 'http://demo.do.prometheus.io:9100/metrics',
                        globalUrl: 'http://demo.do.prometheus.io:9100/metrics',
                        lastError: '',
                        lastScrape: '2021-11-29T11:26:13.434412959Z',
                        lastScrapeDuration: 0.121943025,
                        health: 'up'
                    },
                    matched:
                        [
                            {
                                intervals: [{from: 0, to: 3}, {from: 8, to: 17}, {from: 22, to: 25}],
                                path: ['labels', 'instance'],
                                value: 'demo.do.prometheus.io:9100'
                            },
                        ],
                    score: 131.69230769230768,
                },
            ],
        }
    ]
    for (const test of testSuite) {
        it(test.title, () => {
            const search = new KVSearch({
                shouldSort: true,
                pre: '<strong>',
                post: '</strong>',
                indexedKeys: [
                    'labels',
                    'scrapePool',
                    ['labels', /.*/]
                ]
            })
            chai.expect(search.filter(test.pattern, test.list, test.conf)).to.deep.equal(test.result)
        })
    }
})
