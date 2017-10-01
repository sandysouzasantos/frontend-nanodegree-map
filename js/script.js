var markers = ko.observableArray();

var myViewModel = function () {
    var self = this;

    self.move = function () {
        $('.map').toggleClass('map-move');
    };
};

ko.applyBindings(new myViewModel());