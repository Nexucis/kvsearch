import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { basicSetup } from '@codemirror/basic-setup';
import { KVSearchExtension } from '@nexucis/kvsearch-codemirror';
import { objectList } from '@nexucis/kvsearch-codemirror/dist/test/objectlist';

// TODO A virer quand on passe à un monorepo

const kvSearchExtension = new KVSearchExtension(objectList);

function createEditor() {
    const doc = '';
    new EditorView({
        state: EditorState.create({
            extensions: [basicSetup, kvSearchExtension.asExtension()],
            doc: doc,
        }),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        parent: document.querySelector('#editor')!,
    });
}

createEditor();
