import { FuzzyConfiguration, FuzzyResult, match } from '@nexucis/fuzzy';

export interface Query {
    // keyPath is a list of key used to find the nested key in the object to perform query.
    // in case you want to search only on the key, use the special word 'kvsearch_key'.
    // in case you want to search only on the value, use the special word 'kvsearch_value'.
    // These two special words can be useful when you want to filter data in a map for example.
    keyPath: string[] | 'kvsearch_key' | 'kvsearch_value'
    match: 'exact' | 'fuzzy' | 'negative'
}

export interface QueryNode {
    operator: 'or' | 'and'
    left: QueryNode | Query
    right: QueryNode | Query
}

export interface MapSearchResult {
    score: number
    key: string
    value: string
    fuzzyResult?: FuzzyResult
}

function isQueryNode(q: Query | QueryNode | 'or' | 'and'): q is QueryNode {
    return (q as QueryNode).right !== undefined;
}

function isQuery(q: Query | QueryNode | 'or' | 'and'): q is Query {
    return (q as Query).keyPath !== undefined;
}

// union will concat 'a' with 'b' and removes the duplicated result
function union(a: MapSearchResult[], b: MapSearchResult[]): MapSearchResult[] {
    const result = [...a]
    for (let i = 0; i < b.length; i++) {
        let shouldInsert = true
        for (let j = 0; j < a.length; j++) {
            if (b[i].key === result[j].key) {
                if (b[i].score > result[j].score) {
                    // in case b as a higher score than a, then we should save it
                    result[j].score = b[i].score
                }
                if (b[i].fuzzyResult && !result[j].fuzzyResult) {
                    result[j].fuzzyResult = b[i].fuzzyResult
                }
                shouldInsert = false
                break
            }
        }
        if (shouldInsert) {
            result.push(b[i])
        }
    }
    return result
}

// intersect will keep only the results that are present in 'a' and 'b'
function intersect(a: MapSearchResult[], b: MapSearchResult[]): MapSearchResult[] {
    const result: MapSearchResult[] = []
    let searchList = [...b]
    for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < searchList.length; j++) {
            if (a[i].key !== searchList[j].key) {
                continue
            }
            const object = a[i]
            if (searchList[j].score > object.score) {
                object.score = searchList[j].score
            }
            if (searchList[j].fuzzyResult && object.fuzzyResult) {
                object.fuzzyResult = b[i].fuzzyResult
            }
            result.push(object)
            searchList = searchList.splice(j, 1)
            break
        }
    }
    return result
}

export class KVSearch {
    private readonly fuzzyConf?: FuzzyConfiguration

    constructor(fuzzyConf?: FuzzyConfiguration) {
        this.fuzzyConf = fuzzyConf
    }

    filterMap(pattern: string, query: Query | QueryNode, list: Record<string, string> | Map<string, string>): MapSearchResult[] {
        const queryNodes: (Query | QueryNode | 'or' | 'and')[] = [query]
        const results: MapSearchResult[][] = []
        while (queryNodes.length > 0) {
            const currentQuery = queryNodes.shift()
            if (!currentQuery) {
                break
            }
            if (isQueryNode(currentQuery)) {
                // As we are doing a DFS (deep first searching), we inject first the left node, then the right.
                // And as we need to merge the result coming from the left and right node according to the current node operator, we add as well the operator.
                queryNodes.unshift(currentQuery.left, currentQuery.right, currentQuery.operator)
                continue
            }
            if (isQuery(currentQuery)) {
                // time to execute the actual query
                results.push(this.execute(pattern, currentQuery, list))
                continue
            }
            // At this point the currentQuery is actually the operator coming from a previous QueryNode.
            // So we just have to merge the result from both branch.
            const a = results.pop()
            const b = results.pop()
            if (!a || !b) {
                // That would be weird since each branch of the queryNode should have provided a result
                break
            }
            if (currentQuery === 'or') {
                results.push(union(a, b))
            } else {
                results.push(intersect(a, b))
            }
        }
        return results[0]
    }

    match(pattern: string, text: string, matcherType: 'exact' | 'fuzzy' | 'negative'): MapSearchResult | null {
        switch (matcherType) {
            case 'exact': {
                if (pattern == text) {
                    return {
                        score: 1,
                    } as MapSearchResult
                }
                return null
            }
            case 'negative': {
                if (pattern != text) {
                    return {
                        score: 1,
                    } as MapSearchResult
                }
                return null
            }
            case 'fuzzy': {
                const fuzzyResult = match(pattern, text, this.fuzzyConf)
                if (fuzzyResult === null) {
                    return null
                }
                return {
                    score: fuzzyResult.score,
                    fuzzyResult: fuzzyResult
                } as MapSearchResult
            }
        }
    }

    private execute(pattern: string, query: Query, list: Record<string, string> | Map<string, string>): MapSearchResult[] {
        const result: MapSearchResult[] = []
        if (query.keyPath === 'kvsearch_key' || query.keyPath === 'kvsearch_value') {
            for (const [key, value] of Object.entries(list)) {
                let text = key
                if (query.keyPath === 'kvsearch_value') {
                    text = value
                }
                const matchedText = this.match(pattern, text, query.match)
                if (matchedText) {
                    matchedText.key = key
                    matchedText.value = value
                    result.push(matchedText)
                }
            }
        }
        return result
    }

}
