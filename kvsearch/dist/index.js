var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { walk } from './walk';
import { match } from '@nexucis/fuzzy';
function isQueryNode(q) {
    return q.right !== undefined;
}
function isQuery(q) {
    return q.keyPath !== undefined;
}
var defaultIsEqual = function (a, b) { return JSON.stringify(a) === JSON.stringify(b); };
// merge is called only when a.original and b.original are equal, and so the result must be merged
function merge(a, b) {
    var result = {
        original: a.original,
        score: a.score + b.score,
        index: a.index
    };
    var matching;
    if (a.matched && b.matched) {
        matching = a.matched.concat(b.matched);
    }
    else if (a.matched) {
        matching = a.matched;
    }
    else if (b.matched) {
        matching = b.matched;
    }
    if (matching) {
        result.matched = matching;
    }
    return result;
}
// union will concat 'a' with 'b' and removes the duplicated result
// Note: this function is exported only for testing purpose.
export function union(a, b, isEqual) {
    if (isEqual === void 0) { isEqual = defaultIsEqual; }
    var result = __spreadArray([], a, true);
    for (var i = 0; i < b.length; i++) {
        var shouldInsert = true;
        var left = b[i];
        if (left === undefined) {
            continue;
        }
        for (var j = 0; j < a.length; j++) {
            var right = result[j];
            if (right !== undefined && isEqual(left.original, right.original)) {
                result[j] = merge(left, right);
                shouldInsert = false;
                break;
            }
        }
        if (shouldInsert) {
            result.push(left);
        }
    }
    return result;
}
// intersect will keep only the results that are present in 'a' and 'b'
// Note: this function is exported only for testing purpose.
export function intersect(a, b, isEqual) {
    if (isEqual === void 0) { isEqual = defaultIsEqual; }
    var result = [];
    var searchList = __spreadArray([], b, true);
    for (var i = 0; i < a.length; i++) {
        for (var j = 0; j < searchList.length; j++) {
            var left = a[i];
            var right = searchList[j];
            if (left === undefined || right === undefined || !isEqual(left.original, right.original)) {
                continue;
            }
            result.push(merge(right, left));
            searchList.splice(j, 1);
            break;
        }
    }
    return result;
}
function exactMatch(pattern, text, caseSensitive) {
    var localPattern = pattern;
    var localText = text;
    if (!caseSensitive) {
        localPattern = localPattern.toLowerCase();
        localText = localText.toLowerCase();
    }
    return localPattern === localText;
}
function negativeMatch(pattern, text, caseSensitive) {
    var localPattern = pattern;
    var localText = text;
    if (!caseSensitive) {
        localPattern = localPattern.toLowerCase();
        localText = localText.toLowerCase();
    }
    return localPattern !== localText;
}
var KVSearch = /** @class */ (function () {
    function KVSearch(conf) {
        this.conf = {
            caseSensitive: (conf === null || conf === void 0 ? void 0 : conf.caseSensitive) === undefined ? false : conf.caseSensitive,
            includeMatches: (conf === null || conf === void 0 ? void 0 : conf.includeMatches) === undefined ? false : conf.includeMatches,
            shouldSort: (conf === null || conf === void 0 ? void 0 : conf.shouldSort) === undefined ? false : conf.shouldSort,
            escapeHTML: (conf === null || conf === void 0 ? void 0 : conf.escapeHTML) === undefined ? false : conf.escapeHTML,
            pre: (conf === null || conf === void 0 ? void 0 : conf.pre) === undefined ? '' : conf.pre,
            post: (conf === null || conf === void 0 ? void 0 : conf.post) === undefined ? '' : conf.post,
            isEqual: (conf === null || conf === void 0 ? void 0 : conf.isEqual) === undefined ? defaultIsEqual : conf.isEqual
        };
    }
    KVSearch.prototype.filter = function (query, list, conf) {
        var shouldSort = (conf === null || conf === void 0 ? void 0 : conf.shouldSort) !== undefined ? conf.shouldSort : this.conf.shouldSort;
        var isEqual = (conf === null || conf === void 0 ? void 0 : conf.isEqual) !== undefined ? conf.isEqual : this.conf.isEqual;
        var queryNodes = [query];
        // `results` is a double array because it will contain the result of each branches. Each branches returns an array.
        // For example, you have the following tree :
        //            OR
        //           /  \
        //          /    \
        //   Query "left"  Query "right"
        //
        // So Each query, "Query "left"" and "Query "right"" are returning an array KVSearchResult that are stored in results.
        // Once we arrived at the node "OR", we pop the result from both queries and we merged them.
        var results = [];
        while (queryNodes.length > 0) {
            var currentQuery = queryNodes.shift();
            if (!currentQuery) {
                break;
            }
            if (isQueryNode(currentQuery)) {
                // As we are doing a DFS (deep first searching), we inject first the left node, then the right.
                // And as we need to merge the result coming from the left and right node according to the current node operator, we add as well the operator.
                queryNodes.unshift(currentQuery.left, currentQuery.right, currentQuery.operator);
                continue;
            }
            if (isQuery(currentQuery)) {
                // time to execute the actual query
                results.push(this.executeQuery(currentQuery, list, conf));
                continue;
            }
            // At this point the currentQuery is actually the operator coming from a previous QueryNode.
            // So we just have to merge the result from both branch.
            var a = results.pop();
            var b = results.pop();
            if (!a || !b) {
                // That would be weird since each branch of the queryNode should have provided a result
                break;
            }
            if (currentQuery === 'or') {
                results.push(union(a, b, isEqual));
            }
            else {
                results.push(intersect(a, b, isEqual));
            }
        }
        var finalResult = results[0];
        if (shouldSort && finalResult) {
            finalResult = finalResult.sort(function (a, b) {
                return b.score - a.score;
            });
        }
        return finalResult ? finalResult : [];
    };
    KVSearch.prototype.match = function (query, obj, conf) {
        // walking through the object until finding the final key used to perform the query
        var endPath = walk(query.keyPath, obj);
        return this.recursiveMatch(endPath, query, conf);
    };
    KVSearch.prototype.executeQuery = function (query, list, conf) {
        var result = [];
        for (var i = 0; i < list.length; i++) {
            var el = list[i];
            if (el === undefined) {
                continue;
            }
            var matched = this.match(query, el, conf);
            if (matched !== null) {
                matched.index = i;
                matched.original = el;
                result.push(matched);
            }
        }
        return result;
    };
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    KVSearch.prototype.recursiveMatch = function (endPath, query, conf) {
        if (endPath === undefined || endPath === null) {
            return null;
        }
        var result = null;
        if (typeof endPath === 'string') {
            result = this.matchSingleString(endPath, query, conf);
        }
        else if (Array.isArray(endPath)) {
            for (var _i = 0, endPath_1 = endPath; _i < endPath_1.length; _i++) {
                var t = endPath_1[_i];
                var tmp = this.recursiveMatch(t, query, conf);
                if (tmp !== null) {
                    if (result !== null) {
                        result = merge(tmp, result);
                    }
                    else {
                        result = tmp;
                    }
                }
            }
        }
        else if (typeof endPath === 'object') {
            for (var _a = 0, _b = Object.keys(endPath); _a < _b.length; _a++) {
                var key = _b[_a];
                result = this.matchSingleString(key, query, conf);
                if (result !== null) {
                    // stop to search through the different keys at the first match.
                    break;
                }
            }
        }
        return result;
    };
    KVSearch.prototype.matchSingleString = function (text, query, conf) {
        var includeMatches = (conf === null || conf === void 0 ? void 0 : conf.includeMatches) !== undefined ? conf.includeMatches : this.conf.includeMatches;
        var caseSensitive = (conf === null || conf === void 0 ? void 0 : conf.caseSensitive) !== undefined ? conf.caseSensitive : this.conf.caseSensitive;
        switch (query.match) {
            case 'exact': {
                if (exactMatch(query.pattern, text, caseSensitive)) {
                    var result = {
                        // for scoring here, let's use the same value than the one used for the fuzzy search.
                        // It will be coherent when you are mixing query with fuzzy and exact match.
                        score: Infinity
                    };
                    if (includeMatches) {
                        result.matched = [{
                                path: query.keyPath,
                                value: text,
                                intervals: [{ from: 0, to: text.length - 1 }]
                            }];
                    }
                    return result;
                }
                else {
                    return null;
                }
            }
            case 'negative': {
                if (negativeMatch(query.pattern, text, caseSensitive)) {
                    return {
                        // TODO probably determinate how far pattern and text are different.
                        score: 1
                    };
                }
                else {
                    return null;
                }
            }
            case 'fuzzy': {
                var fuzzyResult = match(query.pattern, text, {
                    includeMatches: includeMatches,
                    caseSensitive: caseSensitive
                });
                if (fuzzyResult === null) {
                    return null;
                }
                var result = {
                    score: fuzzyResult.score
                };
                if (includeMatches) {
                    result.matched = [
                        {
                            path: query.keyPath,
                            value: text,
                            intervals: fuzzyResult.intervals ? fuzzyResult.intervals : []
                        }
                    ];
                }
                return result;
            }
        }
    };
    return KVSearch;
}());
export { KVSearch };
