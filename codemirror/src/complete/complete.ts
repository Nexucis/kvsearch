import { AutocompleteNode, iterateAndCreateMissingChild, newRootNode } from './tree';
import { Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { EditorState } from '@codemirror/state';
import { SyntaxNode } from '@lezer/common';
import { syntaxTree } from '@codemirror/language';
import { Identifier, Pattern, Query, QueryPath } from '../grammar/parser.terms';
import { retrieveAllRecursiveNodes, walkBackward } from '../parser/path-finder';

// ContextKind is the different possible value determinate by the autocompletion
export enum ContextKind {
    KeyPath,
    Pattern,
    QueryOperator,
}

interface TreeTerms {
    terms: string[];
    depth: number;
}

export interface Context {
    kind: ContextKind;
    treeTerms: TreeTerms;
}

function arrayToCompletionResult(data: Completion[], from: number, to: number, span = true): CompletionResult {
    return {
        from: from,
        to: to,
        options: data,
        span: span ? /^[a-zA-Z0-9_:]+$/ : undefined,
    } as CompletionResult;
}

function computeStartCompletePosition(node: SyntaxNode, pos: number): number {
    let start = node.from;
    if (node.type.id === QueryPath) {
        start = pos
    }
    return start;
}

function calculateQueryPath(state: EditorState, node: SyntaxNode, pos: number): TreeTerms {
    const terms = retrieveAllRecursiveNodes(walkBackward(node, Query), QueryPath, Identifier)
    const decodedTerms: string[] = []
    let depth = 0
    let i = 0
    for (const term of terms) {
        decodedTerms.push(state.sliceDoc(term.from, term.to))
        if (node.type.id === Identifier && term.from === node.from && term.to === node.to) {
            depth = i;
        } else if (node.type.id === QueryPath && term.to === pos - 1) {
            // This case is quite particular. We are in this situation:
            // `labels.` where the cursor is after the dot.
            // The current node is a `QueryPath` and the tree looks like this: KVSearch(Expression(Query(QueryPath(Identifier,⚠),⚠))).
            // In this case there is basically no node that is matching the position of the cursor.
            // So an idea is to actually matched the first Identifier that is one position before (so in this case the Identifier matching `labels`).
            // And since we are at the next level in the tree we need to increase the depth to one point.
            depth = i + 1;
        }
        i++
    }
    return { terms: decodedTerms, depth: depth }
}


export function analyzeCompletion(state: EditorState, node: SyntaxNode, pos: number): Context[] {
    const result: Context[] = [];
    switch (node.type.id) {
        case Pattern:
            // eslint-disable-next-line no-case-declarations
            const treeTerms = calculateQueryPath(state, node, pos);
            result.push({
                kind: ContextKind.Pattern,
                treeTerms: { terms: treeTerms.terms, depth: treeTerms.terms.length }
            })
            break
        case Identifier:
        case QueryPath:
            // this is the usual case when user is typing the path/list of key that should be used for the search.
            // Like `labels.instance`.
            // Here we have to know what is currently requested to be autocompleted (with the example above: labels or instance).
            // In a later stage it will be used to give the position in the tres and change the list to complete.
            result.push({ kind: ContextKind.KeyPath, treeTerms: calculateQueryPath(state, node, pos) })
            break;
    }
    return result;
}

export class Complete {
    private readonly tree: AutocompleteNode;
    private readonly objectList: Record<string, unknown>[];

    constructor(objects: Record<string, unknown>[]) {
        this.tree = newRootNode(objects)
        this.objectList = objects
    }

    kvSearch(context: CompletionContext): CompletionResult | null {
        const { state, pos } = context;
        const tree = syntaxTree(state).resolve(pos, -1);

        /*        syntaxTree(state).iterate({
                    enter(type: NodeType, from: number, to: number, get: () => SyntaxNode): false | void {
                        console.log(`${type.name} from ${from} to ${to}`)
                    }
                })*/
        const contexts = analyzeCompletion(state, tree, pos)
        let result: Completion[] = []
        for (const context of contexts) {
            switch (context.kind) {
                case ContextKind.KeyPath:
                    result = this.autocompleteQueryPath(result, context)
                    break;
                case ContextKind.Pattern:
                    result = this.autocompleteQueryPattern(result, context)
                    break;
            }
        }
        console.log(`current node: ${tree.name}`)
        console.log(`current tree: ${syntaxTree(state)}`)
        console.log(`from ${tree.from} pos ${pos}`)
        return arrayToCompletionResult(result, computeStartCompletePosition(tree, pos), pos)
    }

    private autocompleteQueryPath(result: Completion[], context: Context): Completion[] {
        const node = iterateAndCreateMissingChild(context.treeTerms.depth, context.treeTerms.terms, this.objectList, this.tree)
        if (node !== null) {
            return result.concat(node.keys.map((value) => ({ label: value, type: 'text' })));
        } else {
            return result
        }
    }

    private autocompleteQueryPattern(result: Completion[], context: Context): Completion[] {
        const node = iterateAndCreateMissingChild(context.treeTerms.depth, context.treeTerms.terms, this.objectList, this.tree)
        if (node !== null) {
            return result.concat(node.values.map((value) => ({ label: value, type: 'text' })));
        } else {
            return result
        }
    }
}
