import { AutocompleteNode, iterateAndCreateMissingChild, newRootNode } from './tree';
import { Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { EditorState } from '@codemirror/state';
import { NodeType, SyntaxNode } from '@lezer/common';
import { syntaxTree } from '@codemirror/language';
import {
    EqlRegex,
    EqlSingle,
    Expression,
    Identifier,
    KVSearch,
    Neq,
    Pattern,
    Query,
    QueryPath
} from '../grammar/parser.terms';
import { containsAtLeastOneChild, retrieveAllRecursiveNodes, walkBackward } from '../parser/path-finder';

export const matcherTerms = [{ label: '!=' }, { label: '=~' }, { label: '=' }];

// ContextKind is the different possible value determinate by the autocompletion
export enum ContextKind {
    KeyPath,
    Pattern,
    QueryMatcher,
    QueryOperator
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
    } else if (node.type.id === KVSearch || node.type.id === Expression) {
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

function getCloserErrorNodeFromPosition(node: SyntaxNode, pos: number): SyntaxNode | null {
    const cursor = node.cursor;
    const candidates = []
    while (cursor.next()) {
        // Note: 0 is the id of the error node.
        if (cursor.from === cursor.to && cursor.node.type.id === 0) {
            candidates.push(cursor.node)
        }
    }
    // let's loop other the candidates and let's find the closest node from our position.
    let result: SyntaxNode | null = null
    for (const candidate of candidates) {
        if (result === null || candidate.to - pos < result.to - pos) {
            result = candidate
        }
    }
    return result
}

function analyzeRootNode(state: EditorState, node: SyntaxNode, pos: number): Context[] {
    const result: Context[] = [];
    const nodeAtPosition = getCloserErrorNodeFromPosition(node, pos);
    if (nodeAtPosition === null) {
        return result;
    }
    const parent = nodeAtPosition.parent
    if (parent === null) {
        return result;
    }
    switch (parent.type.id) {
        case Expression:
        case KVSearch:
            // we are likely at the beginning of a new expression so we can safely autocomplete the QueryPath.
            result.push({ kind: ContextKind.KeyPath, treeTerms: { terms: [], depth: 0 } })
            break;
        case Query:
            if (containsAtLeastOneChild(parent, Neq, EqlRegex, EqlSingle)) {
                // we likely have this expression:
                // labels.env !=
                // So we should autocomplete the QueryPattern
                // eslint-disable-next-line no-case-declarations
                const treeTerms = calculateQueryPath(state, nodeAtPosition, pos);
                result.push({
                    kind: ContextKind.Pattern,
                    treeTerms: { terms: treeTerms.terms, depth: treeTerms.terms.length }
                })
                break
            } else {
                result.push({ kind: ContextKind.QueryMatcher, treeTerms: { terms: [], depth: 0 } });
            }
    }
    return result;
}

export function analyzeCompletion(state: EditorState, node: SyntaxNode, pos: number): Context[] {
    let result: Context[] = [];
    switch (node.type.id) {
        case Expression:
        case KVSearch:
            result = result.concat(analyzeRootNode(state, node, pos))
            break;
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

        syntaxTree(state).iterate({
            enter(type: NodeType, from: number, to: number): false | void {
                console.log(`${type.name} from ${from} to ${to}`)
            }
        })
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
                case ContextKind.QueryMatcher:
                    result = result.concat(matcherTerms)
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
