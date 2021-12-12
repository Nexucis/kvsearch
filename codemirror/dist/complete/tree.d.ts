export interface AutocompleteNode {
    name: string;
    keys: string[];
    values: string[];
    path: string[];
    children: AutocompleteNode[];
    indices: number[];
}
export declare function newRootNode(objects: Record<string, unknown>[]): AutocompleteNode;
export declare function iterateAndCreateMissingChild(depth: number, keyPath: string[], objects: Record<string, unknown>[], root: AutocompleteNode): AutocompleteNode | null;
//# sourceMappingURL=tree.d.ts.map