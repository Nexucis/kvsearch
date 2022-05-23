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

import {AutocompleteNode, iterateAndCreateMissingChild, newRootNode} from './tree';
import {Completion, CompletionContext, CompletionResult} from '@codemirror/autocomplete';
import {EditorState} from '@codemirror/state';
import {SyntaxNode} from '@lezer/common';
import {syntaxTree} from '@codemirror/language';
import {
    EqlRegex,
    EqlSingle,
    Expression,
    Identifier,
    KVSearch,
    Neq,
    Pattern,
    Query,
    QueryNode,
    QueryPath,
    Regexp as LezerRegexp
} from '../grammar/parser.terms';
import {containsAtLeastOneChild, retrieveAllRecursiveNodes, walkBackward} from '../parser/path-finder';

export const matcherTerms = [{label: '!='}, {label: '=~'}, {label: '='}, {label: '>'}, {label: '>='}, {label: '<'}, {label: '<='}];
export const operatorTerms = [{label: 'OR'}, {label: 'AND'}]

// ContextKind is the different possible value determinate by the autocompletion
export enum ContextKind {
    KeyPath,
    Pattern,
    QueryMatcher,
    QueryOperator
}

interface TreeTerms {
    terms: (string | RegExp)[];
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
    } else if (node.type.id === KVSearch || node.type.id === Expression || node.type.id === QueryNode) {
        start = pos
    }
    return start;
}

function calculateQueryPath(state: EditorState, node: SyntaxNode, pos: number): TreeTerms | null {
    const terms = retrieveAllRecursiveNodes(walkBackward(node, Query), QueryPath, Identifier, LezerRegexp)
    const decodedTerms: (string | RegExp)[] = []
    let depth = 0
    let i = 0
    for (const term of terms) {
        if (term.type.id === Identifier) {
            decodedTerms.push(state.sliceDoc(term.from, term.to))
        } else {
            decodedTerms.push(new RegExp(state.sliceDoc(term.from, term.to)))
        }
        if (node.type.id === Identifier && term.from === node.from && term.to === node.to) {
            depth = i;
        } else if (node.type.id === QueryPath && (
            (term.type.id === Identifier && term.to === pos - 1) ||
            // it's pos -2 when it's a Regexp, because a Regexp is identified between `//` so it required one more char to access to the end of the Regexp expression.
            (term.type.id === LezerRegexp && term.to === pos - 2)
        )) {
            // This case is quite particular. We are in this situation:
            // `labels.` where the cursor is after the dot.
            // The current node is a `QueryPath` and the tree looks like this: KVSearch(Expression(Query(QueryPath(Identifier,⚠),⚠))).
            // In this case there is basically no node that is matching the position of the cursor.
            // So an idea is to actually matched the first Identifier that is one position before (so in this case the Identifier matching `labels`).
            // And since we are at the next level in the tree we need to increase the depth to one point.
            depth = i + 1;
        } else if (node.type.id === QueryPath && term.type.id === LezerRegexp && term.to === pos - 1) {
            // this is a special case when typically you finished to write your regexp but you didn't start to type the next path.
            // For example : labels./e.*/ where the cursor is after the second '/'. It shouldn't autocomplete anything.
            return null
        }
        i++
    }
    return {terms: decodedTerms, depth: depth}
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
    const errorNode = getCloserErrorNodeFromPosition(node, pos);
    if (errorNode === null) {
        // in this case, it means we have a correct expression and so the only thing that can be completed are the query operators
        result.push({kind: ContextKind.QueryOperator, treeTerms: {terms: [], depth: 0}})
        return result;
    }
    const parent = errorNode.parent
    if (parent === null) {
        return result;
    }
    switch (parent.type.id) {
        case QueryNode:
        case Expression:
        case KVSearch:
            // we are likely at the beginning of a new expression so we can safely autocomplete the QueryPath.
            result.push({kind: ContextKind.KeyPath, treeTerms: {terms: [], depth: 0}})
            break;
        case Query:
            if (containsAtLeastOneChild(parent, Neq, EqlRegex, EqlSingle)) {
                // we likely have this expression:
                // labels.env !=
                // So we should autocomplete the QueryPattern
                // eslint-disable-next-line no-case-declarations
                const treeTerms = calculateQueryPath(state, errorNode, pos);
                if (treeTerms !== null) {
                    result.push({
                        kind: ContextKind.Pattern,
                        treeTerms: {terms: treeTerms.terms, depth: treeTerms.terms.length}
                    })
                }
                break
            } else {
                result.push({kind: ContextKind.QueryMatcher, treeTerms: {terms: [], depth: 0}});
            }
    }
    return result;
}

function analyzeQueryPattern(state: EditorState, node: SyntaxNode, pos: number, result: Context[]) {
    const treeTerms = calculateQueryPath(state, node, pos);
    if (treeTerms !== null) {
        // here we are autocompleting the pattern that should be associated to the query path. So we want the value of the last node in the tree.
        // That's why we are changing the depth here instead of using the one calculated.
        result.push({
            kind: ContextKind.Pattern,
            treeTerms: {terms: treeTerms.terms, depth: treeTerms.terms.length}
        })
    }
}

function analyzeQueryPath(state: EditorState, node: SyntaxNode, pos: number, result: Context[]) {
    const treeTerms = calculateQueryPath(state, node, pos);
    if (treeTerms !== null) {
        result.push({
            kind: ContextKind.KeyPath,
            treeTerms: treeTerms
        })
    }
}

export function analyzeCompletion(state: EditorState, node: SyntaxNode, pos: number): Context[] {
    let result: Context[] = [];
    switch (node.type.id) {
        case Expression:
        case KVSearch:
            result = result.concat(analyzeRootNode(state, node, pos))
            break;
        case Pattern:
            analyzeQueryPattern(state, node, pos, result)
            break
        case Identifier:
        case QueryPath:
            // this is the usual case when user is typing the path/list of key that should be used for the search.
            // Like `labels.instance`.
            // Here we have to know what is currently requested to be autocompleted (with the example above: labels or instance).
            // In a later stage it will be used to give the position in the tres and change the list to complete.
            analyzeQueryPath(state, node, pos, result)
            break;
    }
    return result;
}

export class Complete {
    private readonly tree?: AutocompleteNode;
    private readonly objectList?: Record<string, unknown>[];

    constructor(objects?: Record<string, unknown>[]) {
        if (objects !== undefined) {
            this.tree = newRootNode(objects)
            this.objectList = objects
        }
    }

    kvSearch(context: CompletionContext): CompletionResult | null {
        const {state, pos} = context;
        const tree = syntaxTree(state).resolve(pos, -1);
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
                    break;
                case ContextKind.QueryOperator:
                    result = result.concat(operatorTerms)
                    break;
            }
        }
        return arrayToCompletionResult(result, computeStartCompletePosition(tree, pos), pos)
    }

    private autocompleteQueryPath(result: Completion[], context: Context): Completion[] {
        if (this.objectList === undefined || this.tree === undefined) {
            return result
        }
        const node = iterateAndCreateMissingChild(context.treeTerms.depth, context.treeTerms.terms, this.objectList, this.tree)
        if (node !== null) {
            return result.concat(node.keys.map((value) => ({label: value, type: 'text'})));
        } else {
            return result
        }
    }

    private autocompleteQueryPattern(result: Completion[], context: Context): Completion[] {
        if (this.objectList === undefined || this.tree === undefined) {
            return result
        }
        const node = iterateAndCreateMissingChild(context.treeTerms.depth, context.treeTerms.terms, this.objectList, this.tree)
        if (node !== null) {
            return result.concat(node.values.map((value) => ({label: value, type: 'text'})));
        } else {
            return result
        }
    }
}
