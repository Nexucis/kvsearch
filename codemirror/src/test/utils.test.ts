import { parser } from '../grammar/parser';
import { LRLanguage } from '@codemirror/language';
import { EditorState } from '@codemirror/state';

const lightKVSearchSyntax = LRLanguage.define({ parser: parser });

export function createEditorState(expr: string): EditorState {
    return EditorState.create({
        doc: expr,
        extensions: lightKVSearchSyntax,
    });
}
