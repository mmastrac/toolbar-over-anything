import { Frame } from './frame';

export enum ToolbarPosition {
    HIDDEN,
    NORTH,
    EAST,
    SOUTH,
    WEST,
}

export class Toolbar {
    private _frame: Frame;

    constructor(private _position: ToolbarPosition) {
        this._frame = new Frame(document);
        this._frame.body.innerHTML = "<div></div>";
    }

    get rootNode() {
        const root = this._frame.body.firstChild;
        if (!root) {
            throw "Root was unexpectedly null";
        }
        return this._frame.body.firstChild;
    }

    get visible() {
        return this._frame.visible;
    }

    set visible(visible) {
        this._frame.visible = visible;
    }
}
