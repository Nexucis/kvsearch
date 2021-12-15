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

    constructor(objects?: Record<string, unknown>[]) {
        this.complete = new Complete(objects);
    }

    asExtension(): Extension {
        const language = kvSearchLanguage;
        let extension: Extension = [language];
        const completion = language.data.of({
            autocomplete: (context: CompletionContext) => {
                return this.complete.kvSearch(context);
            },
        });
        extension = extension.concat(completion);
        return extension;
    }
}
