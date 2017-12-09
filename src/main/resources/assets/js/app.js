class FoosApplication extends RcdObject {
    constructor() {
        super();
        this.header = new FoosHeader().init();
    }

    start() {
        this.header.setParent(document.body);
        FoosMain.getInstance().setParent(document.body);


        new FoosLeaguesView().init();
        
        RcdHistoryRouter.refresh();
       
    }
}