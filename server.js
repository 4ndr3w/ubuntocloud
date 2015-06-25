var express = require("express"),
    app = express(),
    models = require("./models"),
    redis = require("redis"),
    redisConn = redis.createClient(),
    async = require("async"),
    lxc = require("./lxc"),
    ActiveDirectory = require("activedirectory");

var ad=require("activedirectory")({url:"ldap://172.16.1.3", baseDN: 'dc=ubunto, dc=me'});

app.use(require("body-parser").json({}));
app.use(require("body-parser").urlencoded({extended:false}));

app.use(require('cookie-parser')("ubuntosekret"));
app.use(require('express-session')({secret:"ubuntosekret",resave:true,saveUninitialized:false}));

app.use(express.static("static"));

app.post("/", function(req,res)
{
    ad.authenticate(req.body.username+"@ubunto.me", req.body.password, function(err, valid) {
        if ( valid && !err )
        {
            req.session.user = req.body.username;
            req.session.save(function()
            {
                res.redirect("/app.html");
            });

        }
        else
            res.redirect("/");
    });
});

app.use(function(req,res,next)
{
    if (!req.session.user)
        res.sendStatus(401);
    else
        next();
});

function getBestDatacenter(cb)
{
    models.datacenter.find({}).exec(function(err,datacenters)
    {
        async.sortBy(datacenters, function(item, cb)
        {
            models.server.find({datacenter: item.id}).count(cb);
        },
        function(err, res)
        {
            if ( res.length > 0 )
                cb(res[0]);
            else cb(null);
        });

    });
}

app.post("/servers", function(req,res)
{
    if ( !req.body.host ) {
        res.sendStatus(404);
        return;
    }
    redisConn.lpop("ipPool", function(err, ip)
    {
        if ( err || !ip )
            res.sendStatus(500);
        else
        {
            getBestDatacenter(function(datacenter) {
                var newServer = new models.server(
                    {
                        host: req.body.host,
                        ip: ip,
                        datacenter: datacenter,
                        owner: req.session.user
                    }
                );

                newServer.save(function (err) {
                    if (err) {
                        if (ip) // return IP to pool if we failed to create
                            redisConn.lpush("ipPool", ip, function (err) {
                            });
                        res.sendStatus(500);
                    }
                    else {
                        console.log("create server " + newServer.host + " IP: " + ip +" at DC "+newServer.datacenter.node+" for "+req.session.user);
                        lxc.createVM(newServer, function(err)
                        {
                            if ( err )
                                res.sendStatus(500);
                            else
                                res.json(newServer);
                        });
                    }
                });
            });
        }
    })
});

app.get("/servers", function(req,res)
{
    models.server.find({owner: req.session.user}).exec(function(err, servers)
    {
        if ( err )
            res.sendStatus(500);
        else
            res.json(servers);
    });
});

app.get("/servers/:id", function(req,res)
{
    models.server.findById(req.param("id")).exec(function(err, server)
    {
        if ( err || !server || server.owner != req.session.user )
            res.sendStatus(404);
        else
            res.json(server);
    });
});

app.get("/servers/:id/reboot", function(req,res)
{
    models.server.findById(req.params.id).populate("datacenter").exec(function(err, server)
    {
        if ( err || !server || server.owner != req.session.user )
            res.sendStatus(404);
        else
        {
            lxc.rebootVM(server, function(err)
            {
                if ( err )
                    res.sendStatus(500);
                else
                    res.sendStatus(200);
            });
        }
    });
});

app.delete("/servers/:id", function(req,res)
{
    models.server.findById(req.params.id).populate("datacenter").exec(function(err, server)
    {
        if ( err || !server || server.owner != req.session.user )
            res.sendStatus(404);
        else
        {
            server.remove(function(err)
            {
                lxc.deleteVM(server, function(err)
                {
                    if ( !err ) {
                        redisConn.lpush("ipPool", server.ip, function(err) {});
                        res.sendStatus(200);
                    }
                    else
                        res.send(500);
                });
            });
        }
    });
});



app.listen(8080);