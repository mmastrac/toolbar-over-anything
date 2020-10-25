import { Frame } from './frame';

export enum DockPosition {
    NORTH,
    EAST,
    SOUTH,
    WEST,
}

export class Dock {
    /// Our docked bar that holds the frame and overlay
    private _div: HTMLDivElement;
    /// Overlay sized to frame content to capture mouse/touch events
    private _overlay: HTMLDivElement;
    /// The frame itself
    private _frame: Frame;
    private _style: HTMLStyleElement;

    private _overlayEntered: boolean = false;
    private _frameEntered: boolean = false;

    private _dockPosition: DockPosition = DockPosition.NORTH;
    private _uniquifier;

    constructor(private _document: HTMLDocument, private _loadCallback: () => void) {
        // This is overkill for a unique ID
        const array = new Uint8Array(8);
        window.crypto.getRandomValues(array);
        this._uniquifier = `tb${new Date().valueOf().toString(16)}${array.toString().replace(/,/g, '')}`;

        this._div = _document.createElement('div');
        this._div.id = `dock_${this._uniquifier}`;
        this.updatePosition();

        this._overlay = _document.createElement('div');
        this._overlay.id = `overlay_${this._uniquifier}`;

        this._style = _document.createElement('style');
        this._style.textContent = Dock._baseDockStyle(this._uniquifier);

        this._div.append(this._overlay, this._style);
        document.body.appendChild(this._div);

        this._frame = new Frame(this._div, this._loadCallback, (r) => {
            console.log("Rect = ", r);
            this._overlay.style.top = `${r.top}px`;
            this._overlay.style.left = `${r.left}px`;
            this._overlay.style.width = `${r.width}px`;
            this._overlay.style.height = `${r.height}px`;

            this._div.style.height = `${r.bottom}px`;
        });
        this._frame.frameElement.id = `iframe_${this._uniquifier}`;

        this._overlay.addEventListener('mouseenter', () => { console.log("+overlay"); this._overlayEntered = true; this.updatePointers(); });
        this._overlay.addEventListener('mouseleave', () => { console.log("-overlay"); this._overlayEntered = false; this.updatePointers(); });
        this._frame.frameElement.addEventListener('mouseenter', () => { console.log("+frame"); this._frameEntered = true; this.updatePointers(); });
        this._frame.frameElement.addEventListener('mouseleave', () => { console.log("-frame"); this._frameEntered = false; this.updatePointers(); });

        this.updatePointers();
    }

    private static _baseDockStyle(id: string) {
        return `
        html > body > div#dock_${id} {
            position: fixed;
            pointer-events: none;
            transition: background 1s;
        }
        html > body > div#dock_${id}::before {
            background: linear-gradient(180deg, rgba(2,0,36,0.2) 0%, rgba(0,212,255,0) 100%);
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            display: block;
            transition: opacity 0.2s;
        }
        html > body > div#dock_${id}.outside_${id}::before {
            opacity: 0;
        }
        html > body > div#dock_${id}.inside_${id}::before {
            opacity: 1;
        }

        html > body > div#dock_${id} > iframe#iframe_${id} { 
            position: absolute;
            user-select: none;
        }
        html > body > div#dock_${id}.outside_${id} > iframe#iframe_${id} { 
            pointer-events: none;
            opacity: 0.8;
            filter: drop-shadow(0px 5px 5px rgba(2,0,36,0.2));
        }
        html > body > div#dock_${id}.inside_${id} > iframe#iframe_${id} { 
            pointer-events: all;
            opacity: inherit;
            filter: drop-shadow(0px 5px 5px rgba(2,0,36,0.8));
        }

        html > body > div#dock_${id} > div#overlay_${id} {
            position: absolute;
            user-select: none;
        }
        html > body > div#dock_${id}.outside_${id} > div#overlay_${id} {
            pointer-events: all;
        }
        html > body > div#dock_${id}.inside_${id} > div#overlay_${id} {
            pointer-events: none;
        }
        `;
    }

    private updatePointers() {
        const inside = this._overlayEntered || this._frameEntered;
        this._div.className = inside ? `inside_${this._uniquifier}` : `outside_${this._uniquifier}`;
        console.log("inside = ", inside);
    }

    private updatePosition() {
        if (this._dockPosition != DockPosition.SOUTH)
            this._div.style.top = '0px';
        else
            this._div.style.top = 'auto';

        if (this._dockPosition != DockPosition.WEST)
            this._div.style.left = '0px';
        else
            this._div.style.left = 'auto';

        if (this._dockPosition != DockPosition.EAST)
            this._div.style.right = '0px';
        else
            this._div.style.right = 'auto';

        if (this._dockPosition != DockPosition.NORTH)
            this._div.style.bottom = '0px';
        else
            this._div.style.bottom = 'auto';
    }

    get frame() {
        return this._frame;
    }
}
