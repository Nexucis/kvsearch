import { LRLanguage } from '@codemirror/language';
import { parser } from './grammar/parser';
import { styleTags, tags } from '@codemirror/highlight';
import { Extension } from '@codemirror/state';
import { Complete } from './complete/complete';
import { CompletionContext } from '@codemirror/autocomplete';

export const kvSearchLanguage: LRLanguage = LRLanguage.define({
    parser: parser.configure({
        top: 'KVSearch',
        props: [
            styleTags(
                {
                    'And Or': tags.logicOperator,
                    'Neq EqlRegex EqlSingle': tags.arithmeticOperator,
                }
            )
        ]
    }),
    languageData: {
        closeBrackets: { brackets: ['('] },
    }
})

export class KVSearchExtension {
    private complete: Complete;
    private enableCompletion: boolean;

    constructor() {
        this.complete = new Complete();
        this.enableCompletion = true;
    }

    asExtension(): Extension {
        const language = kvSearchLanguage;
        let extension: Extension = [language];
        if (this.enableCompletion) {
            const completion = language.data.of({
                autocomplete: (context: CompletionContext) => {
                    return this.complete.kvSearch(context);
                },
            });
            extension = extension.concat(completion);
        }
        return extension;
    }
}
