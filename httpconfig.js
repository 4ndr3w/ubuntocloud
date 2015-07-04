var fs = require("fs"),
    execSync = require("child_process").execSync;

function template(server, ip)
{
  var out = "server {\n";
  out +=    " server_name "+host+".cloud.ubunto.me;\n";
  out +=    " location / { proxy_pass http://"+ip+"/; }\n";
  out +=    "}\n";
  return out;
}

module.exports = {
  createVhost: function(server, ip)
  {
    console.log("adding vhost for "+server+".cloud.ubunto.me");
    fs.writeFileSync("/etc/nginx/sites-enabled/"+server+".cloud", template(server, ip));
    execSync("/etc/init.d/nginx reload");
  },

  removeVhost: function(server)
  {
    fs.unlink("/etc/nginx/sites-enabled/"+server+".cloud", function(err)
    {
      if (err)
        console.log("remove vhost error - /etc/nginx/sites-enabled/"+server+".cloud");
      else
        execSync("/etc/init.d/nginx reload");
    })
  }
};
