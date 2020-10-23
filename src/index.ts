import { Frame } from './frame';
import { Dock, DockPosition } from './dock';

export { DockPosition } from './dock';

export class Toolbar {
    private _frame: Frame;
    private _dock: Dock;

    constructor(private _position: DockPosition) {
        this._dock = new Dock(document);
        this._frame = this._dock.frame;
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
