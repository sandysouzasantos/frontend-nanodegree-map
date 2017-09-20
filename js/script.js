var markers = ko.observableArray();

var myViewModel = function () {
    var self = this;
    self.lastInterest = ko.observable();

    self.move = function () {
        $('.portfolio').toggleClass('portfolio-move');
    };

    self.logMouseOver = function(place) {
        self.lastInterest(place);
    };
};

ko.applyBindings(new myViewModel());


