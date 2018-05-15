// Figure out which language we need to write the labels in.
// Default is French, available is also German.
var lang = 'fr';
var supportedLangs = {fr:'fr', de:'de'};
var href = window.location.href.split('?');
if (href.length > 1) {
  lang = supportedLangs[href[1]] || lang; 
}

var baseLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
  }),
  opacity: 1
});

var col = function(reg){
  var c = {
    BONV: '#ff9c5c',
    ORBE: '#8ba2ff',
    COTM: '#b0ff45',
    CHAB: '#ff735c',
    COTN: '#2effc1',
    VULL: '#2eff41',
    LAVU: '#d773ff',
    LAVR: '#ff73ae',
  }[reg];
  return (c || '#fff');
}
var regViticFillStyle = function(feature, resolution){
  return new ol.style.Style({
    fill: new ol.style.Fill({ color: col(feature.getProperties().regstat) }),
  })
};
var regViticStrokeStyle = function(feature, resolution){
  var fontsize = resolution > 200 ? '14px' : '16px';
  var lbl = lang == 'de' ? 'nom_de' : 'nom';
  return new ol.style.Style({
    stroke: new ol.style.Stroke({ color: '#fff', width: 1 }),
    text: new ol.style.Text({
      textAlign: 'center',
      font: fontsize+'/1.2 Verdana, sans-serif',
      text: resolution > 400 ? '' : feature.getProperties()[lbl].replace(' (', "\n("),
      fill: new ol.style.Fill({color: '#000'}),
      stroke: new ol.style.Stroke({ color: 'rgba(255, 255, 255, 0.5)', width: 4 })
    })
  })
};

var overlayFill = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'data/reg-vitic-stats-wgs84.geojson',
    format: new ol.format.GeoJSON()
  }),
  style: regViticFillStyle
});

var overlayStroke = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'data/reg-vitic-stats-wgs84.geojson',
    format: new ol.format.GeoJSON()
  }),
  style: regViticStrokeStyle
});

var blendModeMultiply = function(evt) {
  evt.context.globalCompositeOperation = 'multiply';
};
var blendModeNormal = function(evt) {
  evt.context.globalCompositeOperation = 'normal';
};
overlayFill.on('precompose', blendModeMultiply);
overlayStroke.on('precompose', blendModeNormal)

var map = new ol.Map({
  target: 'map',
  layers: [baseLayer, overlayFill, overlayStroke],
  view: new ol.View({
    center: ol.proj.fromLonLat([6.703, 46.6]),
    zoom: 9,
    extent: [682500, 5810300, 801200, 5939700],
    maxZoom: 14,
    minZoom: 8
  })
});

map.getView().fit([682500, 5810300, 801200, 5939700]);

