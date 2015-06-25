window.Ractive = Ractive = require("ractive");
window.Backbone = Backbone = require("backbone");
window.$ = $ = require("jquery");
window.backboneAdaptor = backboneAdaptor = require("ractive-adaptors-backbone");

window.backboneAdaptor.Backbone = Backbone;

window.App = App = {
  views: require("./views")
};

