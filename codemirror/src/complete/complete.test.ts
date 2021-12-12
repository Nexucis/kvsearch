import chai from 'chai';
import { CompletionContext } from '@codemirror/autocomplete';
import { createEditorState } from '../test/utils.test';
import { Complete } from './complete';

describe('autocomplete kvsearch test', () => {
    const testCases = [
        {
            title: 'autocomplete pattern',
            expr: 'labels.instance != dem',
            pos: 22,
            expectedResult: {
                options: [
                    {
                        env: 'test',
                        type: 'text',
                    }
                ],
                from: 19,
                to: 22,
                span: /^[a-zA-Z0-9_:]+$/,
            },
        }
    ];
    testCases.forEach((value) => {
        it(value.title, () => {
            const state = createEditorState(value.expr);
            const context = new CompletionContext(state, value.pos, true);
            const completion = new Complete();
            const result = completion.kvSearch(context);
            chai.expect(value.expectedResult).to.deep.equal(result);
        })
    })
})
