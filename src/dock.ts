import { Frame } from './frame';

export enum DockPosition {
    NW_H = 0,
    NNW, N, NNE, NE_H,

    NE_V = 5,
    ENE, E, ESE, SE_V,

    SE_H = 10,
    SSE, S, SSW, SW_H,

    SW_V = 15,
    WSW, W, WNW, NW_V,
}

export enum ScreenEdge {
    NORTH = "screen-edge-north",
    EAST = "screen-edge-east",
    SOUTH = "screen-edge-south",
    WEST = "screen-edge-west",
}

export enum Orientation {
    H = "orientation-horizontal",
    V = "orientation-vertical",
}

export enum JustificationH {
    EAST = "justify-horizontal-east",
    CENTER = "justify-horizontal-center",
    WEST = "justify-horizontal-west",
}

export enum JustificationV {
    NORTH = "justify-vertical-north",
    MIDDLE = "justify-vertical-middle",
    SOUTH = "justify-vertical-south",
}

function screenEdge(pos: DockPosition): ScreenEdge {
    switch (~~(pos / 5)) {
        case 0: return ScreenEdge.NORTH;
        case 1: return ScreenEdge.EAST;
        case 2: return ScreenEdge.SOUTH;
        case 3: return ScreenEdge.WEST;
    }

    throw "Unexpected value";
}

function orientation(pos: DockPosition): Orientation {
    switch (screenEdge(pos)) {
        case ScreenEdge.NORTH:
        case ScreenEdge.SOUTH:
            return Orientation.H;
        default:
            return Orientation.V;
    }
}

function justificationH(pos: DockPosition): JustificationH {
    switch (pos) {
        case DockPosition.NE_H:
            return JustificationH.EAST;
        case DockPosition.NW_H:
            return JustificationH.WEST;
        case DockPosition.SE_H:
            return JustificationH.EAST;
        case DockPosition.SW_H:
            return JustificationH.WEST;
    }

    const edge = screenEdge(pos);
    switch (edge) {
        case ScreenEdge.EAST:
            return JustificationH.EAST;
        case ScreenEdge.WEST:
            return JustificationH.WEST;
        case ScreenEdge.NORTH:
            return JustificationH.CENTER;            
        case ScreenEdge.SOUTH:
            return JustificationH.CENTER;            
        }
}

function justificationV(pos: DockPosition): JustificationV {
    switch (pos) {
        case DockPosition.NE_V:
            return JustificationV.NORTH;
        case DockPosition.NW_V:
            return JustificationV.NORTH;
        case DockPosition.SE_V:
            return JustificationV.SOUTH;
        case DockPosition.SW_V:
            return JustificationV.SOUTH;
    }

    const edge = screenEdge(pos);
    switch (edge) {
        case ScreenEdge.EAST:
            return JustificationV.MIDDLE;
        case ScreenEdge.WEST:
            return JustificationV.MIDDLE;
        case ScreenEdge.NORTH:
            return JustificationV.NORTH;            
        case ScreenEdge.SOUTH:
            return JustificationV.SOUTH;            
    }
}

function metrics(position: DockPosition) {
    return {
        position,
        edge: screenEdge(position),
        justification: {
            h: justificationH(position),
            v: justificationV(position),
        },
        orientation: orientation(position),
    };
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

    private _dockPosition;
    private _uniquifier;

    constructor(private _document: HTMLDocument, position: DockPosition, private _loadCallback: () => void) {
        // This is overkill for a unique ID
        const array = new Uint8Array(8);
        window.crypto.getRandomValues(array);
        this._uniquifier = `tb${new Date().valueOf().toString(16)}${array.toString().replace(/,/g, '')}`;

        this._div = _document.createElement('div');
        this._div.id = `dock_${this._uniquifier}`;
        this._dockPosition = position;
        this.updatePosition();

        this._overlay = _document.createElement('div');
        this._overlay.id = `overlay_${this._uniquifier}`;

        this._style = _document.createElement('style');
        this._style.textContent = Dock._baseDockStyle(this._uniquifier);

        this._div.append(this._overlay, this._style);
        document.body.appendChild(this._div);

        this._frame = new Frame(this._div, () => { this._loadCallback(); this.updatePosition(); }, (r) => {
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
        // High selectivity base selector
        const base = `html > body > div#dock_${id}`;

        return `
        ${base} {
            position: fixed;
            pointer-events: none;
            transition: background 1s;
            inset: 0 0 0 0;
        }
        ${base}::before {
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
        ${base}.outside_${id}::before {
            opacity: 0;
        }
        ${base}.inside_${id}::before {
            opacity: 1;
        }

        ${base} > iframe#iframe_${id} { 
            position: absolute;
            user-select: none;
        }
        ${base}.outside_${id} > iframe#iframe_${id} { 
            pointer-events: none;
            opacity: 0.8;
            filter: drop-shadow(0px 5px 5px rgba(2,0,36,0.2));
        }
        ${base}.inside_${id} > iframe#iframe_${id} { 
            pointer-events: all;
            opacity: inherit;
            filter: drop-shadow(0px 5px 5px rgba(2,0,36,0.8));
        }

        ${base} > div#overlay_${id} {
            position: absolute;
            user-select: none;
        }
        ${base}.outside_${id} > div#overlay_${id} {
            pointer-events: all;
        }
        ${base}.inside_${id} > div#overlay_${id} {
            pointer-events: none;
        }
        ${base}.${ScreenEdge.NORTH}_${id} {
            bottom: auto;
        }
        ${base}.${ScreenEdge.SOUTH}_${id} {
            top: auto;
        }
        ${base}.${ScreenEdge.EAST}_${id} {
            right: auto;
        }
        ${base}.${ScreenEdge.WEST}_${id} {
            left: auto;
        }
        `;
    }

    private c(...s: string[]): string[] {
        return s.map((s) => `${s}_${this._uniquifier}`);
    }

    private isInside() {
        return this._overlayEntered || this._frameEntered;
    }

    private updatePointers() {
        const inside = this.isInside();
        if (inside) {
            this._div.classList.remove(...this.c('outside'));
            this._div.classList.add(...this.c('inside'));
        } else {
            this._div.classList.add(...this.c('outside'));
            this._div.classList.remove(...this.c('inside'));
        }
        console.log("inside = ", inside);
    }

    private updatePosition() {
        const m = metrics(this._dockPosition);
        const classes = [];
        
        classes.push(
            this.isInside() ? 'inside' : 'outside', 
            m.edge,
            m.justification.h,
            m.justification.v,
            m.orientation);
        
        // Update both the div and the iframe body with the new class list
        this._div.className = this.c(...classes).join(' ');
        if (this._frame && this._frame.loaded) {
            this._frame.body.className = classes.join(' ');
        }
    }

    get dockPosition() {
        return this._dockPosition;
    }

    set dockPosition(value) {
        this._dockPosition = value;
        this.updatePosition();
    }

    get frame() {
        return this._frame;
    }
}
