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

    private _overlayEntered: boolean = false;
    private _frameEntered: boolean = false;

    private _dockPosition: DockPosition = DockPosition.NORTH;

    constructor(private _document: HTMLDocument) {
        this._div = _document.createElement('div');
        this._div.style.position = 'absolute';
        this._div.style.userSelect = 'none';

        this._overlay = _document.createElement('div');
        this._overlay.style.position = 'absolute';
        this._overlay.style.userSelect = 'none';

        this.updatePosition();
        document.body.appendChild(this._div);
        this._frame = new Frame(this._div, (r) => {
            console.log("Rect = ", r);
            this._overlay.style.top = `${r.top}px`;
            this._overlay.style.left = `${r.left}px`;
            this._overlay.style.width = `${r.width}px`;
            this._overlay.style.height = `${r.height}px`;

            this._div.style.height = `${r.bottom}px`;
        });
        this._div.appendChild(this._overlay);

        this._overlay.addEventListener('mouseenter', () => { this._overlayEntered = true; this.updatePointers(); });
        this._overlay.addEventListener('mouseleave', () => { this._overlayEntered = false; this.updatePointers(); });
        this._frame.frameElement.addEventListener('mouseenter', () => { this._frameEntered = true; this.updatePointers(); });
        this._frame.frameElement.addEventListener('mouseleave', () => { this._frameEntered = false; this.updatePointers(); });

        this.updatePointers();
    }

    private updatePointers() {
        const inside = this._overlayEntered || this._frameEntered;
        this._div.style.pointerEvents = 'none';
        if (inside) {
            this._overlay.style.pointerEvents = 'none';
            this._frame.frameElement.style.pointerEvents = 'all';
            this._frame.frameElement.style.opacity = 'inherit';
            this._frame.frameElement.style.filter = "drop-shadow(0px 5px 5px rgba(2,0,36,0.8))";
            this._div.style.background = 'linear-gradient(180deg, rgba(2,0,36,0.2) 0%, rgba(0,212,255,0) 100%)';
        } else {
            this._overlay.style.pointerEvents = 'all';
            this._frame.frameElement.style.pointerEvents = 'none';
            this._frame.frameElement.style.opacity = '0.8';
            this._frame.frameElement.style.filter = "drop-shadow(0px 5px 5px rgba(2,0,36,0.2))";
            this._div.style.background = 'transparent';
        }

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
