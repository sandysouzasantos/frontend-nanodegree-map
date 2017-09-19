var myViewModel = function () {

    this.move = function () {
        $('.portfolio').toggleClass('portfolio-only');
    }
};

ko.applyBindings(new myViewModel());


