var global = {};
var gconfig = null;
var repo = null;
var editor = null;
var contentpattern = /<!-- content -->\n([\s\S]*)\n<!-- content end -->\n/m;
var pathpattern = /\/\/path\nvar path=\"(.*)\";\n\/\/path end\n/m;
var mdpattern = /<!-- markdown -->\n([\s\S]*)\n<!-- markdown end -->\n/m;
Date.prototype.yyyymmdd = function() {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString();
    var dd  = this.getDate().toString();
    return yyyy + "-" + (mm[1]?mm:"0"+mm[0]) + "-" + (dd[1]?dd:"0"+dd[0]);
};
function reescape(data) {
    return data.replace(/>/g, "&gt;").replace(/</g, "&lt;");
}
function mdupdate() {
    var converter = new Showdown.converter();
    var tmp = $("#editmd").val();
    sessionStorage.setItem("editmd", tmp);
    tmp = tmp.replace(/~~~~\{(.*)\}\n([\s\S]*?)~~~~\n/mg, function(a1, a2, a3) {return "<pre><code class=\"language-"+a2+"\">"+reescape(a3)+"</code></pre>";});
    tmp = tmp.replace(/~~~~\n([\s\S]*?)~~~~\n/mg, function(a1, a2) {return "<pre><code>"+reescape(a2)+"</code></pre>"});
    tmp = converter.makeHtml(tmp);
    $("#edithtml").html(tmp);
    Prism.highlightAll();
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, "edithtml"]);
}
function curry(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function() {
        var innerArgs = Array.prototype.slice.call(arguments);
        var finalArgs = args.concat(innerArgs);
        return fn.apply(null, finalArgs);
    };
}
function asyncFinish(total, success) {
    var cnt = 0;
    $("#loading").show();
    return function() {
        cnt++;
        if (cnt == total) {
            $("#loading").hide();
            if (typeof success == "function")
                success();
        }
    }
}
function asyncSeq(success) {
    var args = Array.prototype.slice.call(arguments, 1);
    var finish = asyncFinish(args.length, success);
    for (var i = 0; i < args.length; ++i) {
        args[i](finish);
    }
}
function syncSeq(success) {
    var args = Array.prototype.slice.call(arguments, 1);
    var finish = asyncFinish(1, success);
    var l = args.length;
    var tmp = curry(args[l-1], finish);
    for (var i = l-2; i >= 0; --i)
        tmp = curry(args[i], tmp);
    tmp();
}
function errShow(item, err) {
    if (typeof err != "undefined" && err != null) {
        console.log(err);
        $("#loading").hide();
        item.show();
        return true;
    }
    return false;
}
function asyncWrite(data, target, err, finish) {
    if (!repo)
        Spine.Route.navigate("");
    repo.write("master", target, data, "simple",
               function(e) {
                   var ret = err(e);
                   if (ret == false)
                       finish();
                });
}
function asyncWriteFile(source, target, err, finish) {
    if (!repo)
        Spine.Route.navigate("");
    $.ajax({
        url: source, 
        type: "GET",
        success: function(data) {asyncWrite(data, target, err, finish)},
        error: function(e) {err(e);}
    });
}
function checkpass(user, pass, cbsuccess, cberror) {
    var github = new Github({
        username: user,
        password: pass,
        auth: "basic"
    });
    var u = github.getUser();
    u.show(user, function(err, ret){
        $("#loading").hide()
        if (!cberror(err)) {
            global.github = github;
            global.user = user;
            repo = github.getRepo(user, user+".github.io");
            cbsuccess();
        }
    });
}
$(document).ready(function() {
    var Logins = Spine.Controller.sub({
        el: $("#login"),
        elements: {
            "form": "form",
            "#loginuser": "user",
            "#loginpass": "pass",
            "#loginerror": "err",
        },
        events: {
            "submit form": "check",
        },
        check: function(e) {
            $("#loading").show();
            e.preventDefault();
            checkpass(this.user.val(), this.pass.val(),
                      function(){Spine.Route.navigate("/main");},
                      curry(errShow, this.err));
        },
        init: function() {
            this.user.val("");
            this.pass.val("");
            $("#loading").hide();
            this.err.hide();
        }
    });
    var Mains = Spine.Controller.sub({
        el: $("#main"),
        elements: {
            "#initerror": "err",
            "#initok": "ok",
        },
        events: {
            "click #init": "initRepo",
            "click #go": "go",
        },
        initRepo: function(e) {
            e.preventDefault();
            var error = curry(errShow, this.err);
            var a1 = curry(asyncWriteFile, "template/index.html", "index.html", error);
            var a2 = curry(asyncWriteFile, "template/main.css", "main.css", error);
            var a3 = curry(asyncWriteFile, "template/main.js", "main.js", error);
            var config = {"name": global.user, "number_of_posts_per_page": 7, "disqus_shortname": "", "posts": [], "pages": []};
            var a4 = curry(asyncWrite, JSON.stringify(config), "main.json", error);
            var a5 = curry(asyncWrite, "", "CNAME", error);
            var ad1 = curry(asyncWriteFile, "index.html", "login/index.html", error);
            var ad2 = curry(asyncWriteFile, "editor.html", "login/editor.html", error);			
            var ad3 = curry(asyncWriteFile, "app.js", "login/app.js", error);				
            var lib1 = curry(asyncWriteFile, "lib/ajax.js", "login/lib/ajax.js", error);			
            var lib2 = curry(asyncWriteFile, "lib/base64.js", "login/lib/base64.js", error);			
            var lib3 = curry(asyncWriteFile, "lib/github.js", "login/lib/github.js", error);			
            var lib4 = curry(asyncWriteFile, "lib/jquery.js", "login/lib/jquery.js", error);			
            var lib5 = curry(asyncWriteFile, "lib/local.js", "login/lib/local.js", error);			
            var lib6 = curry(asyncWriteFile, "lib/manager.js", "login/lib/manager.js", error);			
            var lib7 = curry(asyncWriteFile, "lib/route.js", "login/lib/route.js", error);			
            var lib8 = curry(asyncWriteFile, "lib/showdown.js", "login/lib/showdown.js", error);			
            var lib9 = curry(asyncWriteFile, "lib/spine.js", "login/lib/spine.js", error);			
            var lib10 = curry(asyncWriteFile, "lib/underscore.js", "login/lib/underscore.js", error);			
            var t1 = curry(asyncWriteFile, "template/index.html", "login/template/index.html", error);		
            var t2 = curry(asyncWriteFile, "template/main.css", "login/template/main.css", error);			
            var t3 = curry(asyncWriteFile, "template/main.js", "login/template/main.js", error);			
            var t4 = curry(asyncWriteFile, "template/main.json", "login/template/main.json", error);			
            var t5 = curry(asyncWriteFile, "template/page.html", "login/template/page.html", error);			
            var t6 = curry(asyncWriteFile, "template/post.html", "login/template/post.html", error);
            var tc1 = curry(asyncWriteFile, "template/css/entry.css", "login/template/css/entry.css", error);			
            var tc2 = curry(asyncWriteFile, "template/css/prism.css", "login/template/css/prism.css", error);			
            var tc3 = curry(asyncWriteFile, "template/css/style.css", "login/template/css/style.css", error);			
            var tj1 = curry(asyncWriteFile, "template/js/hogan.min.js", "login/template/js/hogan.min.js", error);				
            var tj2 = curry(asyncWriteFile, "template/js/prism.js", "login/template/js/prism.js", error);			
            syncSeq(function() {$("#initok").show()}, a1, a2, a3, a4, a5, ad1, ad2, ad3, lib1, lib2, lib3, lib4, lib5, lib6, lib7, lib8, lib9, lib10, t1, t2, t3, t4, t5, t6, tc1, tc2, tc3, tj1, tj2);
        },
        go: function(e) {
            this.navigate("/posts");
        },
        init: function() {
            $("#loading").hide();
            this.err.hide();
        }
    });
    var Posts = Spine.Controller.sub({
        el: $("#posts"),
        init: function(param) {
            $("#loading").hide();
            if (editor != null)
                editor.destroy();
            var type = null;
            var num = null;
            var now = null;
            if (typeof param != "undefined" && param.hasOwnProperty("type"))
                type = param.type;
            if (typeof param != "undefined" && param.hasOwnProperty("num"))
                num = param.num;
            if (repo != null) {
                $("#loading").show();
                repo.read("master", "main.json", function(err, data) {
                    $("#loading").hide();
                    $("#posttitle").val("");
                    $("#postpath").val("");
                    $("#postdate").val("");
                    $("#posttags").val("");
                    $("#editmd").val(sessionStorage.getItem("editmd") || "before begin to write please click 'new post' or 'new page' first");
                    $("#edithtml").html("");
                    var config = JSON.parse(data);
                    config.posts.sort(function(a, b){
                        if (a.date > b.date)
                            return -1;
                        if (a.date < b.date)
                            return 1;
                        return 0;
                    });
                    gconfig = config;
                    var posts = config.posts;
                    var pages = config.pages;
                    for (var i = 0; i < posts.length; ++i) {
                        posts[i].num = i;
                        posts[i].type = "post";
                        posts[i].active = false;
                        if (type == "post" && num != "null" && Math.floor(num) == i) {
                            posts[i].active = true;
                            now = posts[i];
                            $("#postSave").attr("href", "#/posts/savepost");
                            $("#postDelete").attr("href", "#/posts/deletepost/"+i);
                        }
                    }
                    for (var i = 0; i < pages.length; ++i) {
                        pages[i].num = i;
                        pages[i].type = "page";
                        pages[i].active = false;
                        if (type == "page" && num != "null" && Math.floor(num) == i) {
                            pages[i].active = true;
                            now = pages[i];
                            $("#postSave").attr("href", "#/posts/savepage");
                            $("#postDelete").attr("href", "#/posts/deletepage/"+i);
                        }
                    }
                    var itemTemplate = Hogan.compile($("#postsItem").html());
                    var postsItemHtml = itemTemplate.render({items: posts});
                    var pagesItemHtml = itemTemplate.render({items: pages});
                    $("#postItems").html(postsItemHtml);
                    $("#pageItems").html(pagesItemHtml);
                    if (type != null && type.slice(0, 3) == "new") {
                        if (type.slice(3) == "post") {
                            $("#postSave").attr("href", "#/posts/savepost");
                            $("#postDelete").attr("href", "#/posts");
                        }
                        if (type.slice(3) == "page") {
                            $("#postSave").attr("href", "#/posts/savepage");
                            $("#postDelete").attr("href", "#/posts");
                        }
                        $("#postdate").val((new Date()).yyyymmdd());
                    }
                    if (now != null) {
                        $("#posttitle").val(now.title);
                        $("#postpath").val(now.path);
                        $("#postdate").val(now.date);
                        $("#posttags").val(now.tags);
                        $("#loading").show();
                        repo.read("master", now.path, function(err, data) {
                            $("#loading").hide();
                            var content = data.match(contentpattern)[1];
                            var md = data.match(mdpattern)[1];
                            $("#editmd").val(md);
                            $("#edithtml").html(content);
                        });
                    }
                });
            }
        }
    });
    var SimpleApp = Spine.Controller.sub({
        el: $("body"),
        init: function() {
            this.logins = new Logins();
            this.mains = new Mains();
            this.posts = new Posts();
            $("#postDelete").click(function(){return confirm("Are you sure you want to delete?");});
            this.routes({
                "": function() {this.logins.init();this.logins.active();},
                "/main": function() {this.mains.init();this.mains.active();},
                "/posts/:type/:num": function(param) {
                    var type = param.type;
                    var num = Math.floor(param.num);
                    var temp = this;
                    if (type.slice(0, 6) == "delete") {
                        $("#loading").show();
                        var posts = [];
                        if (type == "deletepost") {
                            var now = gconfig.posts[num];
                            for (var i = 0; i < gconfig.posts.length; ++i) {
                                if (i != num)
                                    posts.push(gconfig.posts[i]);
                            }
                            gconfig.posts = posts;
                        }
                        if (type == "deletepage") {
                            var now = gconfig.pages[num];
                            for (var i = 0; i < gconfig.pages.length; ++i) {
                                if (i != num)
                                    posts.push(gconfig.pages[i]);
                            }
                            gconfig.pages = posts;
                        }
                        repo.write("master", "main.json", JSON.stringify(gconfig), "remove", function(err) {
                            repo.delete("master", now.path, function(err) {
                                temp.posts.init(param);
                                temp.posts.active();
                            });
                        });
                    }
                    else {
                        temp.posts.init(param);
                        temp.posts.active();
                    }
                },
                "/posts/:type": function(param) {
                    var type = param.type;
                    var temp = this;
                    if (type.slice(0, 4) == "save") {
                        $("#loading").show();
                        if (type == "savepost") {
                            var template = "template/post.html";
                            var posts = gconfig.posts;
                        }
                        if (type == "savepage") {
                            var template = "template/page.html";
                            var posts = gconfig.pages;
                        }
                        var now = {"title": $("#posttitle").val(),
                                   "date": $("#postdate").val(),
                                   "tags": $("#posttags").val(),
                                   "path": $("#postpath").val()};
                        var mark = null;
                        for (var i = 0; i < posts.length; ++i)
                            if (posts[i].path == now.path)
                                mark = i;
                        if (mark != null)
                            posts[mark] = now;
                        else
                            posts.unshift(now);
                        var content = $("#edithtml").html().replace(/\$/mg, "$$$$");
                        var md = $("#editmd").val().replace(/\$/mg, "$$$$");
                        $.ajax({
                            url: template, 
                            type: "GET",
                            success: function(data) {
                                $("#saveerror").hide();
                                data = data.replace(contentpattern, "<!-- content -->\n"+content+"\n<!-- content end -->\n");
                                data = data.replace("//path//", now.path);
                                data = data.replace(mdpattern, "<!-- markdown -->\n"+md+"\n<!-- markdown end -->\n");
                                repo.write("master", now.path, data, "save", function(err) {
                                    repo.write("master", "main.json", JSON.stringify(gconfig), "save", function(err) {
                                        if (!errShow($("saveerror", err))) {
                                            temp.posts.init(param);
                                            temp.posts.active();
                                        }
                                    });    
                                });
                            },
                            error: function(e) {err(e);}
                        });
                    }
                    else {
                        temp.posts.init(param);
                        temp.posts.active();
                    }
                },
                "/posts": function() {this.posts.init();this.posts.active();}
            });
            this.manager = new Spine.Manager(this.logins, this.mains, this.posts);
            Spine.Route.setup();
        }
    });
    new SimpleApp();
    $("#editmd").on("keyup", function() {
        mdupdate();
    });
    $("#editmd").on("dragenter", function(e) {
        e.stopPropagation();
        e.preventDefault();
    });
    $("#editmd").on("dragover", function(e) {
        e.stopPropagation();
        e.preventDefault();
    });
    $("#editmd").on("drop", function(e) {
        e.stopPropagation();
        e.preventDefault();
        var a = e.originalEvent;
        var files = a.target.files || a.dataTransfer && a.dataTransfer.files;
        var tmp = null;
        for (var i = 0; i < files.length; i++) {
            if (files[i].type.match("image.*")) {
                tmp = files[i];
                break;
            }
        }
        if (tmp != null) {
            var reader = new FileReader();
            reader.onload = function() {
                var name = tmp.name;
                var data = reader.result;
                var cursor = $("#editmd")[0].selectionStart;
                var content = $("#editmd").val();
                var l = content.length;
                var head = content.substring(0, cursor);
                var tail = content.substring(cursor, l);
                var url = " ![](http://"+global.user+".github.io/img/"+name+")";
                $("#editmd").val(head+"<span class=\"loading\">upload image now!</span>"+tail);
                mdupdate();
                repo.write("master", "img/"+name, data, "upload image",
                           function(e) {
                               if (typeof err != "undefined" && err != null) {
                                   console.log(err);
                                   $("#editmd").val(head+"upload image failed"+tail);
                               }
                               else {
                                   $("#editmd").val(head+url+tail);
                               }
                               mdupdate();
                });
            };
            reader.readAsArrayBuffer(tmp);
        }
    });
});
