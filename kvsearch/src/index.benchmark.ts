import { add, complete, cycle, suite } from 'benny';
import { KVSearch } from './index';

function generateTargetList(n: number) {
    const list = []
    for (let i = 0; i < n; i++) {
        list.push({
            'discoveredLabels': {
                '__address__': `foobar-host:${i}`,
                '__metrics_path__': '/metrics',
                '__scheme__': 'http',
                'job': 'demo'
            },
            'labels': {
                'instance': `foobar-host:${i}`,
                'job': 'demo'
            },
            'scrapePool': 'demo',
            'scrapeUrl': `http://foobar-host:${i}/metrics`,
            'globalUrl': `http://foobar-host:${i}/metrics`,
            'lastError': '',
            'lastScrape': '0001-01-01T00:00:00Z',
            'lastScrapeDuration': 0,
            'health': 'unknown'
        })
    }
    return list
}

const suiteCases = (pattern: string, withRendering = false) => {
    const search = new KVSearch({
        indexedKeys: [
            'labels',
            'scrapePool',
            ['labels', /.*/]
        ],
        shouldSort: true,
        pre: withRendering ? '<strong>' : undefined,
        post: withRendering ? '</strong>' : undefined
    })
    const testSuite = [
        {
            numberOfElement: 5
        },
        {
            numberOfElement: 50,
        },
        {
            numberOfElement: 500,
        },
    ];
    return testSuite.map((test) => {
        return add(`test with ${test.numberOfElement} elements`, () => {
            const list = generateTargetList(test.numberOfElement)
            search.filter(pattern, list)
        })
    })
}

suite(
    'benchmark filter method with pattern: "demo"',
    ...suiteCases('demo'),
    cycle(),
    complete(),
)

suite(
    'benchmark filter method with pattern: "demo" and rendering activated',
    ...suiteCases('demo', true),
    cycle(),
    complete(),
)

suite(
    'benchmark filter method with pattern: "host"',
    ...suiteCases('host'),
    cycle(),
    complete(),
)

suite(
    'benchmark filter method with pattern: "host" and rendering activated',
    ...suiteCases('host', true),
    cycle(),
    complete(),
)

suite(
    'benchmark filter method with pattern: "instance"',
    ...suiteCases('instance'),
    cycle(),
    complete(),
)

suite(
    'benchmark filter method with pattern: "instance" and rendering activated',
    ...suiteCases('instance', true),
    cycle(),
    complete(),
)
