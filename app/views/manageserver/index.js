module.exports = Ractive.extend({
    template: require("./template.html"),
    oninit: function()
    {
        this.on("delete", function(e, model)
        {
            model = this.get('servers').models[model];
            this.get('servers').remove(model);
            model.destroy();
            this.fire("done");
        });

        this.on("reboot", function(e, model)
        {
            model = this.get('servers').models[model];
            $.ajax({
                url: model.url()+"/reboot",
                method:"GET"
            });
        });
    }
});