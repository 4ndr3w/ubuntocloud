module.exports = Ractive.extend({
    template: require("./template.html"),
    data: {
        hostname: ""
    },
    oninit: function()
    {
        this.on("doCreateServer", function(e)
        {
            e.original.preventDefault();
            this.fire("createServerModel", {host:this.get("hostname")});
            this.set("hostname", "");
            this.fire("done");
        });
    }
});