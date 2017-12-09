class FoosApplication extends RcdObject {
    constructor() {
        super();
        this.header = new FoosHeader().init();
    }

    start() {
        this.header.setParent(document.body);
    }
}