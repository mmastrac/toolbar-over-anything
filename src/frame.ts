const BASE_FRAME_STYLE = `
html, body { padding: 0; margin: 0; border: 0; }
`;

export class Frame {
    private _iframe: HTMLIFrameElement;
    
    constructor(private _document: HTMLDocument) {
        this._iframe = _document.createElement('iframe');
        this._iframe.src = "javascript:;";
        this._iframe.style.position = 'fixed';
        this._iframe.style.visibility = 'hidden';
        this._iframe.style.border = '0px';
        this._iframe.style.display = 'block';
        this.acceptPointer = false;
        _document.body.appendChild(this._iframe);

        if (!this.contentDocument.head) {
            this.contentDocument.appendChild(this.contentDocument.createElement('head'));
        }
        const style = this.contentDocument.createElement('style');
        style.innerText = BASE_FRAME_STYLE;
        this.head.appendChild(style);
    }

    get contentDocument(): Document {
        const doc = this._iframe.contentDocument;
        if (!doc) {
            throw "contentDocument was unexpectedly null";
        }
        return doc;
    }

    get head(): HTMLHeadElement {
        const head = this.contentDocument.head;
        if (!head) {
            throw "<head> was unexpectedly missing";
        }
        return head;
    }

    get body(): HTMLBodyElement {
        const tags = this.contentDocument.getElementsByTagName('body');
        if (!tags || tags?.length == 0) {
            const body = this.contentDocument.createElement('body');
            if (!body) {
                throw "Unable to create a <body> element";
            }
            this.contentDocument.appendChild(body);
            return body;
        }
        return tags[0];
    }

    get visible() {
        return (this._iframe.style.visibility != 'hidden');
    }

    set visible(visible) {
        this._iframe.style.visibility = visible ? '' : 'hidden';
    }

    set acceptPointer(acceptPointer: boolean) {
        this._iframe.style.pointerEvents = acceptPointer ? 'auto' : 'none';
    }
}
