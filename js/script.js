var markers = ko.observableArray();

var myViewModel = function () {
    var self = this;

    self.move = function () {
        $('.portfolio').toggleClass('portfolio-move');
    }
};

ko.applyBindings(new myViewModel());