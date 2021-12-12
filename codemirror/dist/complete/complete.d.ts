import { CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { EditorState } from '@codemirror/state';
import { SyntaxNode } from '@lezer/common';
export declare enum ContextKind {
    KeyPath = 0,
    Pattern = 1,
    QueryOperator = 2
}
interface TreeTerms {
    terms: string[];
    depth: number;
}
export interface Context {
    kind: ContextKind;
    treeTerms: TreeTerms;
}
export declare function analyzeCompletion(state: EditorState, node: SyntaxNode, pos: number): Context[];
export declare class Complete {
    private tree;
    private objectList;
    kvSearch(context: CompletionContext): CompletionResult | null;
    private autocompleteQueryPath;
    private autocompleteQueryPattern;
}
export {};
//# sourceMappingURL=complete.d.ts.map