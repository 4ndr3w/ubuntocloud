var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/ubuntocloud");

module.exports = {
    server: mongoose.model("Server", {
        host: {
            type: String,
            unique: true,
            match: /^\b[a-zA-Z0-9_]+\b$/
        },
        ip: String,
        owner: String,
        datacenter: {type:mongoose.Schema.Types.ObjectId, ref:"Datacenter"}
    }),

    datacenter: mongoose.model("Datacenter", {
        name: String,
        node: String
    })
};