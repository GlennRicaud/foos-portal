class FoosIcon extends RcdImgElement {
    constructor(path) {
        super(config.officeLeagueAppUrl + path);
    }

    init() {
        return super.init()
            .addClass('foos-icon');
    }
}