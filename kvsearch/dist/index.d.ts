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
    matched?: MatchingResult[];
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
declare type ObjectIsEqualFn = (a: Record<string, unknown>, b: Record<string, unknown>) => boolean;
export interface KVSearchConfiguration {
    caseSensitive?: boolean;
    includeMatches?: boolean;
    shouldSort?: boolean;
    escapeHTML?: boolean;
    pre?: string;
    post?: string;
    isEqual?: ObjectIsEqualFn;
}
export declare function union(a: KVSearchResult[], b: KVSearchResult[], isEqual?: ObjectIsEqualFn): KVSearchResult[];
export declare function intersect(a: KVSearchResult[], b: KVSearchResult[], isEqual?: ObjectIsEqualFn): KVSearchResult[];
export declare class KVSearch {
    private readonly conf;
    constructor(conf?: KVSearchConfiguration);
    filter(query: Query | QueryNode, list: Record<string, unknown>[], conf?: KVSearchConfiguration): KVSearchResult[];
    match(query: Query, obj: Record<string, unknown>, conf?: KVSearchConfiguration): KVSearchResult | null;
    private executeQuery;
    private recursiveMatch;
    private matchSingleString;
}
export {};
//# sourceMappingURL=index.d.ts.map