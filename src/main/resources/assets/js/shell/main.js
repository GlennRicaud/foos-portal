class FoosMain extends RcdMainElement {
    constructor() {
        super();
    }

    init() {
        return super.init()
            .addClass('foos-main');
    }

    static getInstance() {
        if (!FoosMain.instance) {
            FoosMain.instance = new FoosMain().init();
        }
        return FoosMain.instance;
    }
    
    static clear() {
        FoosMain.getInstance().clear();
        return FoosMain;
    }

    static addChild(child) {
        FoosMain.getInstance().addChild(child);
        return FoosMain;
    }
}