const BASE_FRAME_STYLE = `
html, body { padding: 0; margin: 0; border: 0; overflow: hidden; }
body { display: flex; justify-content: center; }
body > div { display: inline-block; }
`;

export class Frame {
    private _iframe: HTMLIFrameElement;
    private _resizeObserver?: ResizeObserver;
    private _isLoaded: boolean = false;
    
    constructor(private _parent: HTMLDivElement, 
        private _loadCallback: () => void,
        private _resizeCallback: (r: DOMRectReadOnly) => void) {
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
        this._iframe.src = "about:blank";

        _parent.appendChild(this._iframe);

        // Wait for load to happen async on Firefox
        this._iframe.onload = () => {
            setTimeout(() => this._loaded(), 1);
        };

        this._iframe.src = "javascript:;";
 
        // This can happen synchronously in Chrome
        if (this._iframe.contentDocument?.readyState == "complete") {
            setTimeout(() => this._loaded(), 1);
        }
    }

    private _loaded() {
        if (this._isLoaded) {
            // Once only
            return;
        }
        this._isLoaded = true;
        console.log("Loaded", this._iframe.src);

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
                    console.log("Resized", holder.getBoundingClientRect());
                    this._resizeCallback(holder.getBoundingClientRect());
                }
            }
        });
        this._resizeObserver.observe(holder);
        this._loadCallback();

        // Trigger an initial resize based on the content added in loadCallback
        this._resizeCallback(holder.getBoundingClientRect());
    }

    private _ensureLoaded() {
        if (!this._isLoaded) {
            throw "Premature access to unloaded frame";
        }
    }

    get frameElement(): HTMLIFrameElement {
        return this._iframe;
    }

    get contentDocument(): Document {
        this._ensureLoaded();
        const doc = this._iframe.contentDocument;
        if (!doc) {
            throw "contentDocument was unexpectedly null";
        }
        return doc;
    }

    get head(): HTMLHeadElement {
        this._ensureLoaded();
        const head = this.contentDocument.head;
        if (!head) {
            throw "<head> was unexpectedly missing";
        }
        return head;
    }

    get body(): HTMLBodyElement {
        this._ensureLoaded();
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
}
