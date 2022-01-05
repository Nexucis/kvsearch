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

import { SyntaxNode } from '@lezer/common';
import { Query, QueryNode } from '@nexucis/kvsearch';
import {
    And,
    EqlRegex,
    EqlSingle,
    Expression,
    Identifier,
    KVSearch,
    Neq,
    Pattern,
    Query as LezerQuery,
    QueryNode as LezerQueryNode,
    QueryPath
} from '../grammar/parser.terms';
import { retrieveAllRecursiveNodes } from '../parser/path-finder';
import { EditorState } from '@codemirror/state';
import { syntaxTree } from '@codemirror/language';


function buildQuery(state: EditorState, query: SyntaxNode): Query | null {
    // first let's calculate the queryPath
    const keyPath: string[] = []
    const terms = retrieveAllRecursiveNodes(query, QueryPath, Identifier)
    for (const term of terms) {
        keyPath.push(state.sliceDoc(term.from, term.to))
    }
    let match: 'exact' | 'fuzzy' | 'negative';
    if (query.getChild(Neq) !== null) {
        match = 'negative'
    } else if (query.getChild(EqlSingle) !== null) {
        match = 'exact'
    } else if (query.getChild(EqlRegex) !== null) {
        match = 'fuzzy'
    } else {
        return null
    }
    let pattern = ''
    const patternNode = query.getChild(Pattern);
    if (patternNode !== null) {
        pattern = state.sliceDoc(patternNode.from, patternNode.to)
    } else {
        return null
    }
    return {
        keyPath: keyPath,
        match: match,
        pattern: pattern,
    }
}

function buildQueryOperator(queryNode: SyntaxNode): 'or' | 'and' {
    if (queryNode.getChild(And)) {
        return 'and'
    } else {
        return 'or'
    }
}

// TODO to be improved by transforming it with an iteration or with a better recursive function
function translateRec(state: EditorState, node: SyntaxNode | null): QueryNode | Query | null {
    if (node === null) {
        return null
    }
    switch (node.type.id) {
        case KVSearch:
        case Expression:
            return translateRec(state, node.firstChild)
        case LezerQuery:
            return buildQuery(state, node);
        case LezerQueryNode:
            // eslint-disable-next-line no-case-declarations
            const left = translateRec(state, node.firstChild);
            // eslint-disable-next-line no-case-declarations
            const right = translateRec(state, node.lastChild);
            // eslint-disable-next-line no-case-declarations
            const operator = buildQueryOperator(node)
            return {
                operator: operator,
                left: left,
                right: right,
            } as QueryNode
    }
    return null
}

export function translate(state: EditorState): QueryNode | Query | null {
    const root = syntaxTree(state).topNode
    return translateRec(state, root)
}
