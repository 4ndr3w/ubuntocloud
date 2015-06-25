main = new Ractive({
    el:"#main",
    template: require("./template.html"),
    components: {
        serverlist: require("./server_list"),
        createserver: require("./createServer"),
        manageserver: require("./manageserver")
    },
    data: {
        state: "main",
        servers: new (Backbone.Collection.extend({
            url:"/servers",
            model: Backbone.Model.extend({
                urlRoot: "/servers",
                idAttribute: "_id"
            })
        }))(),
        selectedBox: 0
    },

    oninit: function()
    {
        this.on("createServer", function() {
            this.set("state", "createServer");
        });

        this.on("createserver.createServerModel", function(model)
        {
            this.get("servers").create(model);
        });

        this.on("createserver.done", function()
        {
            this.set("state", "main");
        });

        this.on("manageserver.done", function()
        {
            this.set("state", "main");
        });

        this.on("serverlist.selectBox", function(e, index)
        {
            this.set("selectedBox", index);
            this.set("state", "manageServer");
        });

        this.get("servers").fetch();
    },

    adapt: [backboneAdaptor]
});


module.exports = main;
