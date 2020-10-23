const BASE_FRAME_STYLE = `
html, body { padding: 0; margin: 0; border: 0; overflow: hidden; }
body { display: flex; justify-content: center; }
body > div { display: inline-block; }
`;

export class Frame {
    private _iframe: HTMLIFrameElement;
    private _resizeObserver: ResizeObserver;
    
    constructor(private _parent: HTMLDivElement, private _resizeCallback: (r: DOMRectReadOnly) => void) {
        if (!_parent.ownerDocument.contains(_parent)) {
            throw "The parent element must be part of the document";
        }

        this._iframe = _parent.ownerDocument.createElement('iframe');
        this._iframe.style.position = 'relative';
        this._iframe.style.visibility = 'hidden';
        this._iframe.style.border = '0px';
        this._iframe.style.display = 'block';
        this._iframe.style.width = '100%';
        this._iframe.style.height = '100%';
        this._iframe.src = "javascript:;";
        this.acceptPointer = false;

        _parent.appendChild(this._iframe);

        if (!this.contentDocument.head) {
            this.contentDocument.appendChild(this.contentDocument.createElement('head'));
        }

        const style = this.contentDocument.createElement('style');
        style.innerText = BASE_FRAME_STYLE;
        this.head.appendChild(style);

        const body = this.body;
        const holder = this.contentDocument.createElement('div');
        body.appendChild(holder);

        this._resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.target === holder) {
                    _resizeCallback(holder.getBoundingClientRect());
                }
            }
        });
        this._resizeObserver.observe(holder);
    }

    get frameElement(): HTMLIFrameElement {
        return this._iframe;
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
