var ssh = require("ssh2").Client,
    fs = require("fs");

module.exports = {
    privateKey: fs.readFileSync("cloud_rsa"),
    createVM: function(server, cb)
    {
        var conn = new ssh();
        conn.on('error', function(err)
        {
            cb(err);
        });
        conn.on('ready', function() {
            conn.exec('echo "#cloud-config\npassword: ubuntu\nssh_pwauth: True\nchpasswd: { expire: False }\n\nwrite_files: \n- content: | \n        auto eth0\n        iface eth0 inet static\n                address '+server.ip+'\n                netmask 255.240.0.0\n                gateway 172.16.1.253\n                dns-nameservers 8.8.8.8\n  path: /etc/network/interfaces.d/eth0.cfg\n\npower_state:\n mode: reboot\n message: cloudinit\n timeout: 30" > '+server.host+'.cloudinit', function(err, stream)
            {
                stream.on("close", function(code, sig)
                {
                    conn.exec("lxc-create -n "+server.host+" -t ubuntu-cloud -- --userdata "+server.host+".cloudinit", function(err,stream)
                    {
                        stream.on("close", function(code,sig)
                        {
                            conn.exec("lxc-start -n "+server.host, function(err,stream)
                            {
                                stream.on("close", function(code,sig)
                                {
                                    cb(null);
                                })
                            })
                        })
                    });

                });
            })
        }).connect({
            host: server.datacenter.node,
            port: 22,
            username: 'root',
            privateKey: this.privateKey
        });
    },

    deleteVM: function(server, cb)
    {
        var conn = new ssh();
        conn.on('error', function(err)
        {
            cb(err);
        });
        conn.on('ready', function() {
            conn.exec('lxc-stop -n '+server.host+'', function(err, stream)
            {
                stream.on("close", function(code, sig)
                {
                    conn.exec("lxc-destroy -n "+server.host, function(err,stream)
                    {
                        stream.on("close", function(code,sig)
                        {
                            cb(null);
                        })
                    });
                });
            })
        }).connect({
            host: server.datacenter.node,
            port: 22,
            username: 'root',
            privateKey: this.privateKey
        });
    },


    rebootVM: function(server, cb)
    {
        var conn = new ssh();
        conn.on('error', function(err)
        {
            cb(err);
        });
        conn.on('ready', function() {
            conn.exec('lxc-stop -n '+server.host+'', function(err, stream)
            {
                stream.on("close", function(code, sig)
                {
                    conn.exec("lxc-start -n "+server.host, function(err,stream)
                    {
                        stream.on("close", function(code,sig)
                        {
                            cb(null);
                        })
                    });
                });
            })
        }).connect({
            host: server.datacenter.node,
            port: 22,
            username: 'root',
            privateKey: this.privateKey
        });
    }
};