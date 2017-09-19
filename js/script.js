var markers;

var myViewModel = function () {
    var self = this;

    markers = ko.observableArray();




    self.move = function () {
        $('.portfolio').toggleClass('portfolio-only');
    }
};

ko.applyBindings(new myViewModel());


