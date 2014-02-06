      var MarkerSets = [];
      var map;
      var globalInfoWindow;
      google.maps.event.addDomListener(window, 'load', initialize);
      function initialize() {
        map = new google.maps.Map(document.getElementById("map-canvas"), {
          center: new google.maps.LatLng(35.626450, 140.101471),
          zoom: 15
        });
        var hash = location.hash.replace(/^#/, '');
        if (!hash.match(/^https:\/\/maps.google.(co\.jp|com)\/maps\/ms/)) {
          hash = 'https://maps.google.com/maps/ms?ie=UTF8&authuser=0&msa=0&output=kml&msid=202958072521216836182.0004ee161960470ed77f4';
        }
        var msids = hash.match(/msid=([\w\.]+)/);
        $.get('http://allow-any-origin.appspot.com/https://maps.google.com/maps/ms?ie=UTF8&authuser=0&msa=0&output=kml&msid=' + msids[1], loadkml);
      }
      function loadkml (xml) {
        MarkerSets = $(xml).find('Placemark').map(function () {
          var position = $(this).find('coordinates').text().split(',', 2).reverse();
          var icon = $(xml).find($(this).find('styleUrl').text()).find('href').text();
          if (icon === 'http://maps.gstatic.com/mapfiles/ms2/micons/webcam.png') {
            icon = 'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABHNCSVQICAgIfAhkiAAAAA1JREFUCJljYGBgYAAAAAUAAYehTtQAAAAASUVORK5CYII=';
          }
          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(position[0],position[1]),
            map: map,
            icon: icon,
            title: $(this).find('name').text()
          });
          var div = $('<div>').append($(this).find('description').text()).get(0);
          var infowindow = new google.maps.InfoWindow({
            content: div
          });
          $(div).on('click', 'a', quizResult).find('img').each(function () {
            (new Image).src = $(this).attr('src');
          });
          return {
            'infowindow' : infowindow,
            'name' : $(this).find('name').text(),
            'marker' : marker
          };
        });
        windowOpen(MarkerSets[0]);
      }
      function quizResult (event) {
        var href = $(event.target).attr('href');
        if (href.match('goal.html')) {
          event.preventDefault();
          location.href = 'goal.html';
          return;
        }
        if (!href.match('#')) {
          return;
        }
        event.preventDefault();
        var name = href.split('#').pop();
        MarkerSets.each(function (markerSet) {
          if (decodeURIComponent(name) !== this.name) {
            return;
          }
          windowOpen(this)
        });
      }
      function windowOpen (markerSet) {
        globalInfoWindow && globalInfoWindow.close();
        markerSet['infowindow'].open(map, markerSet['marker']);
        globalInfoWindow = markerSet['infowindow'];
        map.panTo(markerSet['marker'].getPosition());
        map.panBy(0, -150);
      }
      $(function () {
        $('audio').each(function () {
          this.volume = 0.1;
        });
      });
