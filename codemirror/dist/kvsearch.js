import { LRLanguage } from '@codemirror/language';
import { parser } from './grammar/parser';
import { styleTags, tags } from '@codemirror/highlight';
import { Complete } from './complete/complete';
export var kvSearchLanguage = LRLanguage.define({
    parser: parser.configure({
        top: 'KVSearch',
        props: [
            styleTags({
                'And Or': tags.logicOperator,
                'Neq EqlRegex EqlSingle': tags.arithmeticOperator
            })
        ]
    }),
    languageData: {
        closeBrackets: { brackets: ['('] }
    }
});
var KVSearchExtension = /** @class */ (function () {
    function KVSearchExtension() {
        this.complete = new Complete();
        this.enableCompletion = true;
    }
    KVSearchExtension.prototype.asExtension = function () {
        var _this = this;
        var language = kvSearchLanguage;
        var extension = [language];
        if (this.enableCompletion) {
            var completion = language.data.of({
                autocomplete: function (context) {
                    return _this.complete.kvSearch(context);
                }
            });
            extension = extension.concat(completion);
        }
        return extension;
    };
    return KVSearchExtension;
}());
export { KVSearchExtension };
