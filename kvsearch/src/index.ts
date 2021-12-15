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

import { walk } from './walk';
import { match } from '@nexucis/fuzzy';

export interface MatchingInterval {
    from: number;
    to: number;
}

export interface MatchingResult {
    path: string[];
    value: string;
    intervals: MatchingInterval[];
}

export interface KVSearchResult {
    original: Record<string, unknown>;
    score: number;
    index: number;
    matched?: MatchingResult[]
}

export interface Query {
    keyPath: string[];
    match: 'exact' | 'fuzzy' | 'negative';
    pattern: string;
}

export interface QueryNode {
    operator: 'or' | 'and';
    left: QueryNode | Query;
    right: QueryNode | Query;
}

function isQueryNode(q: Query | QueryNode | 'or' | 'and'): q is QueryNode {
    return (q as QueryNode).right !== undefined;
}

function isQuery(q: Query | QueryNode | 'or' | 'and'): q is Query {
    return (q as Query).keyPath !== undefined;
}

type ObjectIsEqualFn = (a: Record<string, unknown>, b: Record<string, unknown>) => boolean;

const defaultIsEqual: ObjectIsEqualFn = (a: Record<string, unknown>, b: Record<string, unknown>) => JSON.stringify(a) === JSON.stringify(b);

export interface KVSearchConfiguration {
    caseSensitive?: boolean;
    includeMatches?: boolean;
    shouldSort?: boolean;
    escapeHTML?: boolean;
    pre?: string;
    post?: string;
    isEqual?: ObjectIsEqualFn;
}


// merge is called only when a.original and b.original are equal, and so the result must be merged
function merge(a: KVSearchResult, b: KVSearchResult): KVSearchResult {
    const result = {
        original: a.original,
        score: a.score + b.score,
        index: a.index,
    } as KVSearchResult
    let matching: MatchingResult[] | undefined;
    if (a.matched && b.matched) {
        matching = a.matched.concat(b.matched)
    } else if (a.matched) {
        matching = a.matched
    } else if (b.matched) {
        matching = b.matched
    }
    if (matching) {
        result.matched = matching
    }
    return result;
}

// union will concat 'a' with 'b' and removes the duplicated result
// Note: this function is exported only for testing purpose.
export function union(a: KVSearchResult[], b: KVSearchResult[], isEqual: ObjectIsEqualFn = defaultIsEqual): KVSearchResult[] {
    const result = [...a]
    for (let i = 0; i < b.length; i++) {
        let shouldInsert = true
        const left = b[i];
        if (left === undefined) {
            continue
        }
        for (let j = 0; j < a.length; j++) {
            const right = result[j];
            if (right !== undefined && isEqual(left.original, right.original)) {
                result[j] = merge(left, right)
                shouldInsert = false
                break
            }
        }
        if (shouldInsert) {
            result.push(left)
        }
    }
    return result
}

// intersect will keep only the results that are present in 'a' and 'b'
// Note: this function is exported only for testing purpose.
export function intersect(a: KVSearchResult[], b: KVSearchResult[], isEqual: ObjectIsEqualFn = defaultIsEqual): KVSearchResult[] {
    const result: KVSearchResult[] = []
    const searchList = [...b]
    for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < searchList.length; j++) {
            const left = a[i];
            const right = searchList[j];
            if (left === undefined || right === undefined || !isEqual(left.original, right.original)) {
                continue
            }
            result.push(merge(right, left))
            searchList.splice(j, 1)
            break
        }
    }
    return result
}

function exactMatch(pattern: string, text: string, caseSensitive: boolean | undefined): boolean {
    let localPattern = pattern
    let localText = text
    if (!caseSensitive) {
        localPattern = localPattern.toLowerCase()
        localText = localText.toLowerCase()
    }
    return localPattern === localText
}

function negativeMatch(pattern: string, text: string, caseSensitive: boolean | undefined): boolean {
    let localPattern = pattern
    let localText = text
    if (!caseSensitive) {
        localPattern = localPattern.toLowerCase()
        localText = localText.toLowerCase()
    }
    return localPattern !== localText
}


export class KVSearch {
    private readonly conf: KVSearchConfiguration;

    constructor(conf?: KVSearchConfiguration) {
        this.conf = {
            caseSensitive: conf?.caseSensitive === undefined ? false : conf.caseSensitive,
            includeMatches: conf?.includeMatches === undefined ? false : conf.includeMatches,
            shouldSort: conf?.shouldSort === undefined ? false : conf.shouldSort,
            escapeHTML: conf?.escapeHTML === undefined ? false : conf.escapeHTML,
            pre: conf?.pre === undefined ? '' : conf.pre,
            post: conf?.post === undefined ? '' : conf.post,
            isEqual: conf?.isEqual === undefined ? defaultIsEqual : conf.isEqual,
        }
    }

    filter(query: Query | QueryNode, list: Record<string, unknown>[], conf?: KVSearchConfiguration): KVSearchResult[] {
        const shouldSort = conf?.shouldSort !== undefined ? conf.shouldSort : this.conf.shouldSort
        const isEqual = conf?.isEqual !== undefined ? conf.isEqual : this.conf.isEqual;
        const queryNodes: (Query | QueryNode | 'or' | 'and')[] = [query]
        // `results` is a double array because it will contain the result of each branches. Each branches returns an array.
        // For example, you have the following tree :
        //            OR
        //           /  \
        //          /    \
        //   Query "left"  Query "right"
        //
        // So Each query, "Query "left"" and "Query "right"" are returning an array KVSearchResult that are stored in results.
        // Once we arrived at the node "OR", we pop the result from both queries and we merged them.
        const results: KVSearchResult[][] = []
        while (queryNodes.length > 0) {
            const currentQuery = queryNodes.shift()
            if (!currentQuery) {
                break
            }
            if (isQueryNode(currentQuery)) {
                // As we are doing a DFS (deep first searching, pre-order), we inject first the left node, then the right.
                // And as we need to merge the result coming from the left and right node according to the current node operator, we add as well the operator.
                queryNodes.unshift(currentQuery.left, currentQuery.right, currentQuery.operator)
                continue
            }
            if (isQuery(currentQuery)) {
                // time to execute the actual query
                results.push(this.executeQuery(currentQuery, list, conf))
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
                results.push(union(a, b, isEqual))
            } else {
                results.push(intersect(a, b, isEqual))
            }
        }
        let finalResult = results[0]
        if (shouldSort && finalResult) {
            finalResult = finalResult.sort((a, b) => {
                return b.score - a.score
            })
        }
        return finalResult ? finalResult : [];
    }

    match(query: Query, obj: Record<string, unknown>, conf?: KVSearchConfiguration): KVSearchResult | null {
        // walking through the object until finding the final key used to perform the query
        const endPath = walk(query.keyPath, obj)
        return this.recursiveMatch(endPath, query, conf)
    }

    private executeQuery(query: Query, list: Record<string, unknown>[], conf?: KVSearchConfiguration): KVSearchResult[] {
        const result = [];
        for (let i = 0; i < list.length; i++) {
            const el = list[i];
            if (el === undefined) {
                continue
            }
            const matched = this.match(query, el, conf);
            if (matched !== null) {
                matched.index = i;
                matched.original = el;
                result.push(matched)
            }
        }
        return result;
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    private recursiveMatch(endPath: any, query: Query, conf?: KVSearchConfiguration): KVSearchResult | null {
        if (endPath === undefined || endPath === null) {
            return null;
        }
        let result = null
        if (typeof endPath === 'string') {
            result = this.matchSingleString(endPath, query, conf)
        } else if (Array.isArray(endPath)) {
            for (const t of endPath) {
                const tmp = this.recursiveMatch(t, query, conf)
                if (tmp !== null) {
                    if (result !== null) {
                        result = merge(tmp, result)
                    } else {
                        result = tmp;
                    }
                }
            }
        } else if (typeof endPath === 'object') {
            for (const key of Object.keys(endPath)) {
                result = this.matchSingleString(key, query, conf)
                if (result !== null) {
                    // stop to search through the different keys at the first match.
                    break
                }
            }
        }
        return result
    }

    private matchSingleString(text: string, query: Query, conf?: KVSearchConfiguration): KVSearchResult | null {
        const includeMatches = conf?.includeMatches !== undefined ? conf.includeMatches : this.conf.includeMatches
        const caseSensitive = conf?.caseSensitive !== undefined ? conf.caseSensitive : this.conf.caseSensitive
        switch (query.match) {
            case 'exact': {
                if (exactMatch(query.pattern, text, caseSensitive)) {
                    const result = {
                        // for scoring here, let's use the same value than the one used for the fuzzy search.
                        // It will be coherent when you are mixing query with fuzzy and exact match.
                        score: Infinity
                    } as KVSearchResult

                    if (includeMatches) {
                        result.matched = [{
                            path: query.keyPath,
                            value: text,
                            intervals: [{ from: 0, to: text.length - 1 }]
                        }]
                    }
                    return result
                } else {
                    return null
                }
            }
            case 'negative': {
                if (negativeMatch(query.pattern, text, caseSensitive)) {
                    return {
                        // TODO probably determinate how far pattern and text are different.
                        score: 1,
                    } as KVSearchResult
                } else {
                    return null
                }
            }
            case 'fuzzy': {
                const fuzzyResult = match(query.pattern, text, {
                    includeMatches: includeMatches,
                    caseSensitive: caseSensitive
                })
                if (fuzzyResult === null) {
                    return null
                }
                const result = {
                    score: fuzzyResult.score,
                } as KVSearchResult
                if (includeMatches) {
                    result.matched = [
                        {
                            path: query.keyPath,
                            value: text,
                            intervals: fuzzyResult.intervals ? fuzzyResult.intervals : [],
                        }
                    ]
                }
                return result
            }
        }
    }
}
