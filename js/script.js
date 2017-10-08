var markers = ko.observableArray();

var map;
var infowindow;
var allMarkers;

//A whitelist -- places não informados aqui serão filtrados do resultado.
var whitelist = {
    "Munganga Bistro": "4b80220ef964a5203d5530e3",
    "Rei do Pastel": "4d99232a744f3704a1140158",
    "La Tratoria": "4cbfa516020d4688bce26338",
    "Domingos Restaurante.": "4c0aed697e3fc928778bf482",
    "MARANGATU Restaurante": "4cfb052c20fe37046a8d51f8",
    "Temakeria do Porto": "4cdf19463644a093e060509f",
    "La Crêperie": "4c4b6ac05609c9b6c71b1791",
    "Pizzaria Paulista": "4e69739f483bf2d9e5cdff36",
    "Espetinhos Comedoria": "4f7f86bbe4b00dcb6a93b77d",
    "Mardioca RESTAURANTE Y PIZZERIA": "567dc607498eab68b71f5a11",
    "Soparia Lumiar": "4e67f9fa7d8b084ac7918582"
};

// Filtra o observable makers de acordo com a string digitada pelo usuário
function search(a, event) {
    searchString = event.target.value;
    tmpMarkers = [];
    // Se a string estiver vazia, exibe todos os resultados.
    // Caso contrário, exibe somente resultados que contenham este resultado.
    if (searchString) {
        for (var i = 0; i < allMarkers.length; i++) {
            if (allMarkers[i].text.toLowerCase().indexOf(searchString.toLowerCase()) >= 0) {
                tmpMarkers.push(allMarkers[i]);
            }
        }
        for (var i = 0; i < markers().length; i++) {
            markers()[i].marker.setMap(null);
        }
    } else {
        tmpMarkers = allMarkers;
    }
    markers(tmpMarkers);

    // Por alguma razão, o click() do marker é disparado quando chamamos o .setMap.
    // Ao chamar o click, o bounce de todos os elementos é iniciado.
    // Aqui, o desligamos.
    if (infowindow) {
        infowindow.close();
    }

    for (var i = 0; i < markers().length; i++) {
        markers()[i].marker.setMap(map);
        markers()[i].marker.setAnimation(null);

        if (infowindow) {
            infowindow.close();
        }
    }
}

// Classe com as propriedades que iremos utilizar.
var MarkerObject = function (text, marker) {
    this.text = text;
    this.marker = marker;
    this.selected = ko.observable(false);
    this.rating = 0;
};

// Função a ser disparada sempre que um objeto for selecionado, na lista ou no mapa.
function selectObject(obj) {
    if (infowindow) {
        infowindow.close();
    }

    for (var i = 0; i < markers().length; i++) {
        if (obj.text === markers()[i].text) {
            var description = obj.text + (obj.rating > 0 ? " (Foursquare rating: " + obj.rating + ")" : "");
            infowindow.setContent(description);
            infowindow.open(map, obj.marker);
            obj.marker.setAnimation(google.maps.Animation.BOUNCE);
            markers()[i].selected(true);
        } else {
            markers()[i].marker.setAnimation(null);
            markers()[i].selected(false);
        }
    }
}

// Inicializa o mapa com os markers padrão.
function initMap() {
    var centerPortoGalinhas = {lat: -8.5056828, lng: -35.0024702};

    try {
        // Constructor creates a new map.
        map = new google.maps.Map(document.getElementById('map'), {
            center: centerPortoGalinhas,
            zoom: 16
        });

        if (infowindow) {
            infowindow.close();
        }

        infowindow = new google.maps.InfoWindow();


        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
            location: centerPortoGalinhas,
            radius: 500,
            type: ['restaurant']
        }, callback);
    } catch (error) {
        alert('Oops! Parece que algo deu errado :(');
    }
    infowindow.close();
}

function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            if (typeof(whitelist[results[i].name]) !== 'undefined') {
                createMarker(results[i]);
            }
        }
        allMarkers = markers();
    }
}

function createMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
        position: placeLoc
    });

    var markerObj = new MarkerObject(place.name, marker);
    markers.push(markerObj);
    getInformation(markerObj);

    google.maps.event.addListener(marker, 'click', function () {
        selectObject(markerObj);
    });

    infowindow.close();
    marker.setAnimation(null);
    return marker;
}

// Pega informações adicionais sobre o place no foursquare.
var getInformation = function (obj) {
    var clientId = "HU0JQS0JT04OIZAV5KVZKY2F3DGBLDMQPZTSTH3D5TYOUTP5";
    var clientSecret = "CBGK5FVLZWKFPGKWBIPBLJATXYS40HJT13HWQCHAQ5KZQDE5";

    var url = "https://api.foursquare.com/v2/venues/" + whitelist[obj.text] + "?" +
        "client_id=" + clientId + "&client_secret=" + clientSecret + "&v=20161016" +
        "&near=Porto de Galinhas, PE, Brazil&query=" + obj.text + "&callback=venueInformation";

    $.ajax({
        method: 'GET',
        url: url,
        jsonp: "venueInformation",
        dataType: "jsonp"
    });
};

venueInformation = function (response) {
    var result = response.response.venue;
    var name = '';
    for (var i in whitelist) {
        if (whitelist[i] === response.response.venue.id) {
            name = i;
            break;
        }
    }
    for (var j = 0; j < allMarkers.length; j++) {
        if (allMarkers[j].text === name) {
            allMarkers[j].contacts = result.contact;
            allMarkers[j].checkins = result.stats.checkinsCount;
            allMarkers[j].rating = result.rating;
            break;
        }
    }
};

function googleError() {
    alert('Ocorreu um erro ao carregar o google maps! Por favor, recarregue a página!');
}

var myViewModel = function () {
    var self = this;

    self.move = function () {
        $('.map').toggleClass('map-move');
    };
};

ko.applyBindings(new myViewModel());