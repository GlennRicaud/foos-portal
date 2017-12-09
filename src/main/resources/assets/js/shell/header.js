class FoosHeader extends RcdHeaderElement {
    constructor() {
        super();
        this.title = new RcdTextElement('Foos Portal').init();
    }

    init() {
        return super.init()
            .addClass('foos-header')
            .addChild(this.title);
    }
}