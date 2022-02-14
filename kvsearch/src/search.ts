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

import { walk, WalkingPath } from './walk';
import { match, render } from '@nexucis/fuzzy';

export interface MatchingInterval {
    from: number;
    to: number;
}

export interface MatchingResult {
    path: string[];
    value: string;
    intervals: MatchingInterval[];
}

export interface KVSearchResult<T> {
    original: T;
    rendered: T;
    score: number;
    index: number;
    matched?: MatchingResult[]
}

export interface Query {
    keyPath: (string | RegExp)[];
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

export interface KVSearchConfiguration {
    caseSensitive?: boolean;
    includeMatches?: boolean;
    shouldSort?: boolean;
    escapeHTML?: boolean;
    findAllMatches?: boolean;
    pre?: string;
    post?: string;
    indexedKeys?: (string | RegExp | (string | RegExp)[])[]
}

// merge is called only when a.original and b.original are equal, and so the result must be merged
function merge<T>(a: KVSearchResult<T>, b: KVSearchResult<T>): KVSearchResult<T> {
    const result = {
        original: a.original,
        rendered: a.rendered,
        score: a.score + b.score,
        index: a.index,
    } as KVSearchResult<T>
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

// union will concat 'a' with 'b'.
// Note: this function is exported only for testing purpose.
export function union<T>(a: Record<number, KVSearchResult<T>>, b: Record<number, KVSearchResult<T>>): void {
    // here we don't copy a because it cost (a lot) to do it.
    const result = a
    for (const [k, v] of Object.entries(b)) {
        const index = (k as unknown as number)
        if (result[index] !== undefined) {
            result[index] = merge(result[index], v)
        } else {
            result[index] = v
        }
    }
}

// intersect will keep only the results that are present in 'a' and 'b'
// Note: this function is exported only for testing purpose.
export function intersect<T>(a: Record<number, KVSearchResult<T>>, b: Record<number, KVSearchResult<T>>): Record<number, KVSearchResult<T>> {
    const result: Record<number, KVSearchResult<T>> = {}
    for (const [k, v] of Object.entries(b)) {
        const index = (k as unknown as number)
        if (a[index] !== undefined) {
            result[index] = merge(a[index], v)
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

function buildQuery(pattern: string, key: string | RegExp | (string | RegExp)[]): Query {
    const query: Query = { match: 'fuzzy', pattern: pattern, keyPath: [] }
    if (Array.isArray(key)) {
        query.keyPath = query.keyPath.concat(key)
    } else {
        query.keyPath = [key]
    }
    return query
}


export class KVSearch<T> {
    private readonly conf: KVSearchConfiguration;

    constructor(conf?: KVSearchConfiguration) {
        this.conf = {
            caseSensitive: conf?.caseSensitive === undefined ? false : conf.caseSensitive,
            includeMatches: conf?.includeMatches === undefined ? false : conf.includeMatches,
            shouldSort: conf?.shouldSort === undefined ? false : conf.shouldSort,
            escapeHTML: conf?.escapeHTML === undefined ? false : conf.escapeHTML,
            findAllMatches: conf?.findAllMatches == undefined ? false : conf.findAllMatches,
            pre: conf?.pre,
            post: conf?.post,
            indexedKeys: conf?.indexedKeys,
        }
    }

    filter(pattern: string, list: T[], conf?: KVSearchConfiguration): KVSearchResult<T>[] {
        const indexedKeys = conf?.indexedKeys ? conf.indexedKeys : this.conf.indexedKeys;
        if (indexedKeys === undefined) {
            return []
        }
        // build the query according to the pattern and the indexedKeys.
        const indexedKeysLength = indexedKeys.length;
        const firstQuery = buildQuery(pattern, indexedKeys[0]);
        if (indexedKeysLength === 1) {
            return this.filterWithQuery(firstQuery, list, conf)
        }
        const firstElement: QueryNode = {
            operator: 'or',
            left: firstQuery,
            right: firstQuery
        }
        let lastElement = firstElement;
        for (let i = 1; i < indexedKeysLength; i++) {
            const query = buildQuery(pattern, indexedKeys[i]);
            if (i + 1 < indexedKeysLength) {
                // here we have to create a new QueryNode
                const node: QueryNode = { operator: 'or', left: query, right: query }
                lastElement.right = node;
                lastElement = node;
            } else {
                lastElement.right = query
            }
        }
        return this.filterWithQuery(firstElement, list, conf)
    }

    filterWithQuery(query: Query | QueryNode, list: T[], conf?: KVSearchConfiguration): KVSearchResult<T>[] {
        const shouldSort = conf?.shouldSort !== undefined ? conf.shouldSort : this.conf.shouldSort
        const includeMatches = conf?.includeMatches !== undefined ? conf.includeMatches : this.conf.includeMatches
        const findAllMatches = conf?.findAllMatches !== undefined ? conf.findAllMatches : this.conf.findAllMatches
        const queryNodes: ({ current: Query | QueryNode | 'or' | 'and', parent?: 'or' | 'and', depth: number })[] = [{
            current: query,
            depth: 0
        }]
        // For example, you have the following tree :
        //            OR
        //           /  \
        //          /    \
        //   Query "left"  Query "right"
        //
        // So Each query, "Query "left"" and "Query "right"" are returning a map of KVSearchResult that are stored in results.
        // Once we arrived at the node "OR", we pop the result from both queries and we merged them.
        const results: { result: Record<number, KVSearchResult<T>>, depth: number }[] = []
        while (queryNodes.length > 0) {
            const currentNode = queryNodes.shift()
            if (!currentNode) {
                break
            }
            const currentQuery = currentNode.current
            if (isQueryNode(currentQuery)) {
                // As we are doing a DFS (deep first searching, pre-order), we inject first the left node, then the right.
                // And as we need to merge the result coming from the left and right node according to the current node operator, we add as well the operator.
                queryNodes.unshift(
                    {
                        current: currentQuery.left,
                        parent: currentQuery.operator,
                        depth: currentNode.depth + 1
                    },
                    {
                        current: currentQuery.right,
                        parent: currentQuery.operator,
                        depth: currentNode.depth + 1
                    },
                    {
                        current: currentQuery.operator,
                        parent: currentNode.parent,
                        depth: currentNode.depth,
                    }
                )
                continue
            }
            if (isQuery(currentQuery)) {
                // time to execute the actual query
                // In case we have a previous result at the same depth as the current query and we don't have to find all matches,
                // we should use the previous result and reduce the number of object to look at it. It will depend of the parent node is a "or" or a "and".
                // In case it's a "or", we are interesting to search/match every node not already present in the previous result.
                // In case it's a "and", we are interesting to search/match every node already present in the previous result.
                let previousResult: { result: Record<number, KVSearchResult<T>>, parent: 'or' | 'and' } | undefined = undefined
                if (!findAllMatches && results.length > 1 && results[results.length - 1].depth === currentNode.depth && currentNode.parent !== undefined) {
                    previousResult = { result: results[results.length - 1].result, parent: currentNode.parent }
                }
                results.push({
                    result: this.executeQuery(currentQuery, list, previousResult, conf),
                    depth: currentNode.depth
                })
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
                union(a.result, b.result)
                results.push({ result: a.result, depth: currentNode.depth })
            } else {
                results.push({ result: intersect(a.result, b.result), depth: currentNode.depth })
            }
        }
        let finalResult = Object.values(results[0].result)
        for (let i = 0; i < finalResult.length; i++) {
            finalResult[i].rendered = this.render(finalResult[i].original, finalResult[i].matched, conf)
            if (!includeMatches) {
                finalResult[i].matched = undefined
            }
        }
        if (shouldSort) {
            finalResult = finalResult.sort((a, b) => {
                return b.score - a.score
            })
        }
        return finalResult ? finalResult : [];
    }

    match(query: Query, obj: T, conf?: KVSearchConfiguration): KVSearchResult<T> | null {
        const includeMatches = conf?.includeMatches !== undefined ? conf.includeMatches : this.conf.includeMatches
        const matched = this.internalMatch(query, obj, conf);
        if (matched !== null) {
            matched.original = obj;
            matched.rendered = this.render(obj, matched.matched, conf)
            if (!includeMatches) {
                matched.matched = undefined
            }
        }
        return matched
    }

    render(obj: T, matchingResults?: MatchingResult[], conf?: KVSearchConfiguration): T {
        const pre = conf?.pre ? conf.pre : this.conf.pre
        const post = conf?.post ? conf.post : this.conf.post
        if ((pre === undefined && post === undefined) || matchingResults === undefined) {
            return obj
        }
        // copy the object to get a different reference
        // TODO find a more efficient way to deep copy an object
        const rendered = JSON.parse(JSON.stringify(obj))
        const associatePeer: Record<string, string> = {}
        for (const matchingResult of matchingResults) {
            this.renderingWalk(matchingResult, rendered, associatePeer, conf)
        }
        return rendered
    }

    private renderingWalk(matchingResult: MatchingResult, obj: T, associatedPeer: Record<string, string>, conf?: KVSearchConfiguration) {
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        let currentObj: any = obj
        let i = 0
        const path = matchingResult.path
        while (i < path.length - 1) {
            //TODO manage array
            const tmp = currentObj[path[i]]
            if (tmp !== undefined) {
                currentObj = currentObj[path[i]]
            } else {
                currentObj = currentObj[associatedPeer[path.slice(0, i).toString()]]
            }

            i++;
        }
        const fuzzyConf = {
            pre: conf?.pre ? conf.pre : this.conf.pre,
            post: conf?.post ? conf.post : this.conf.post,
            escapeHTML: conf?.escapeHTML ? conf.escapeHTML : this.conf.escapeHTML
        }
        let lastKey = path[i]
        if (typeof currentObj[lastKey] === 'object') {
            currentObj = currentObj[lastKey]
            // in that case, the value is a key of object.
            // So we need to render this key, to add it to the object and then remove the previous one
            const renderedKey = render(matchingResult.value, matchingResult.intervals, fuzzyConf)
            currentObj[renderedKey] = currentObj[matchingResult.value]
            // Save the association between the old key and the new one.
            // It will be used in case we have other matching that are passing with this key.
            associatedPeer[path.concat(matchingResult.value).toString()] = renderedKey
            delete (currentObj[matchingResult.value])
        } else {
            if (currentObj[lastKey] === undefined) {
                // It means the key changed (aka rendered) in a previous iteration, so we need to get the new key
                lastKey = associatedPeer[path.toString()]
            }
            currentObj[lastKey] = render(currentObj[lastKey], matchingResult.intervals, fuzzyConf)
        }
    }

    private executeQuery(query: Query, list: T[], previousResult: { result: Record<number, KVSearchResult<T>>, parent: 'or' | 'and' } | undefined, conf?: KVSearchConfiguration): Record<number, KVSearchResult<T>> {
        const result: Record<number, KVSearchResult<T>> = {};
        for (let i = 0; i < list.length; i++) {
            const el = list[i];
            if (previousResult) {
                if (previousResult.parent === 'or') {
                    if (previousResult.result[i]) {
                        // in that case this object already matched and we don't need to check again
                        continue
                    }
                } else {
                    if (!previousResult.result[i]) {
                        // In that case this object hasn't been matched by the previous query, so it's impossible with an "and" operator to have this object in the final result".
                        continue
                    }
                }
            }
            const matched = this.internalMatch(query, el, conf);
            if (matched !== null) {
                matched.index = i;
                matched.original = el;
                result[i] = matched
            }
        }
        return result;
    }

    private internalMatch(query: Query, obj: T, conf?: KVSearchConfiguration) {
        // walking through the object until finding the final key used to perform the query
        const endPath = walk(query.keyPath, obj)
        return this.processWalkingPath(endPath, query, conf)
    }

    private processWalkingPath(walkingPath: WalkingPath | WalkingPath[] | null, query: Query, conf?: KVSearchConfiguration): KVSearchResult<T> | null {
        let result = null
        if (walkingPath === null) {
            return null
        }
        if (Array.isArray(walkingPath)) {
            for (const existingPath of walkingPath) {
                const tmp = this.recursiveMatch(existingPath.value, existingPath.path, query, conf)
                if (tmp !== null) {
                    if (result != null) {
                        result = merge(tmp, result)
                    } else {
                        result = tmp
                    }
                }
            }
        } else {
            result = this.recursiveMatch(walkingPath.value, walkingPath.path, query, conf)
        }
        return result
    }

    private recursiveMatch(value: Record<string, unknown> | Record<string, unknown>[] | string, path: string[], query: Query, conf?: KVSearchConfiguration): KVSearchResult<T> | null {
        let result = null
        if (typeof value === 'string') {
            result = this.matchSingleString(value, path, query, conf)
        } else if (Array.isArray(value)) {
            for (const r of value) {
                const tmp = this.recursiveMatch(r, path, query, conf)
                if (tmp !== null) {
                    if (result != null) {
                        result = merge(tmp, result)
                    } else {
                        result = tmp
                    }
                }
            }
        } else {
            for (const key of Object.keys(value)) {
                result = this.matchSingleString(key, path, query, conf)
                if (result !== null) {
                    // TODO by configuration decide if we should continue furthermore to grab all result.
                    break
                }
            }
        }
        return result
    }

    private matchSingleString(text: string, path: string[], query: Query, conf?: KVSearchConfiguration): KVSearchResult<T> | null {
        const caseSensitive = conf?.caseSensitive !== undefined ? conf.caseSensitive : this.conf.caseSensitive
        switch (query.match) {
            case 'exact': {
                if (exactMatch(query.pattern, text, caseSensitive)) {
                    return {
                        // for scoring here, let's use the same value than the one used for the fuzzy search.
                        // It will be coherent when you are mixing query with fuzzy and exact match.
                        score: Infinity,
                        matched: [{
                            path: path,
                            value: text,
                            intervals: [{ from: 0, to: text.length - 1 }]
                        }]
                    } as KVSearchResult<T>
                } else {
                    return null
                }
            }
            case 'negative': {
                if (negativeMatch(query.pattern, text, caseSensitive)) {
                    return {
                        score: 1,
                    } as KVSearchResult<T>
                } else {
                    return null
                }
            }
            case 'fuzzy': {
                const fuzzyResult = match(query.pattern, text, {
                    includeMatches: true,
                    caseSensitive: caseSensitive
                })
                if (fuzzyResult === null) {
                    return null
                }
                return {
                    score: fuzzyResult.score,
                    matched: [
                        {
                            path: path,
                            value: text,
                            intervals: fuzzyResult.intervals ? fuzzyResult.intervals : [],
                        }
                    ]
                } as KVSearchResult<T>
            }
        }
    }
}
