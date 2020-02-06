var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

var app = http.createServer(function(request,response){
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  if(pathname === '/'){
    if(queryData.id === undefined){
      fs.readdir('./data', function(err, fileList){
        var title = 'Welcome';
        var description = 'Hello, Node.js';

        var list = template.list(fileList);
        var html = template.html(title, list,
          `<h2>${title}</h2><p>${description}</p>`,
          `<a href="/create">Create</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
    }else{
      fs.readdir('./data', function(err, fileList){
        var filteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
          var title = queryData.id;
          var sanitizedTitle = sanitizeHtml(title);
          var sanitizedDescription = sanitizeHtml(description, {
            allowedTags: ['h1']
          });
          var list = template.list(fileList);
          var html = template.html(title, list,
            `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p>`,
            `<a href="/create">Create</a>
             <a href="/update?id=${sanitizedTitle}">Update</a>
            <form action="/delete_process" method="post">
              <input type="hidden" name="id" value="${sanitizedTitle}">
              <input type="submit" value="Delete">
            </form>`
          );
          response.writeHead(200);
          response.end(html);
        });
      });
    }
  } else if(pathname === '/create'){
    fs.readdir('./data', function(err, fileList){
      var title = 'Web - create';
      var list = template.list(fileList);
      var html = template.html(title, list, `
      <form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
      `, '');
      response.writeHead(200);
      response.end(html);
    });
  } else if(pathname === '/create_process') {
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(){
      var post = qs.parse(body); // parse메소드를 통해 정보를 객체화할 수 있음
      var title = post.title;
      var description = post.description;
      fs.writeFile(`./data/${title}`, description, 'utf8', function(err){
        response.writeHead(302, {Location: `./?id=${title}`});
        response.end();
      })
    });
  } else if(pathname === '/update'){
    fs.readdir('./data', function(err, fileList){
      var filteredId = path.parse(queryData.id).base;
      fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
        var title = queryData.id;
        var list = template.list(fileList);
        var html = template.html(title, list,
          `
          <form action="/update_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <p><input type="text" name="title" placeholder="title" value="${title}"></p>
            <p>
              <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>
              <input type="submit", value="modify">
            </p>
          </form>
          `, '');
        response.writeHead(200);
        response.end(html);
      });
    });
  } else if(pathname === '/update_process'){
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(){
      var post = qs.parse(body); // parse메소드를 통해 정보를 객체화할 수 있음
      var id = post.id;
      var title = post.title;
      var description = post.description;
      fs.rename(`./data/${id}`, `./data/${title}`, function(err){
        fs.writeFile(`./data/${title}`, description, 'utf8', function(err){
          response.writeHead(302, {Location: `./?id=${title}`});
          response.end();
        })
      });
    });
  } else if(pathname === '/delete_process'){
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(){
      var post = qs.parse(body); // parse메소드를 통해 정보를 객체화할 수 있음
      var id = post.id;
      console.log(id);
      var filteredId = path.parse(id).base;
      console.log(filteredId);
      fs.unlink(`./data/${filteredId}`, function(err){
        response.writeHead(302, {Location: `/`});
        response.end();
      })
    });
  } else {
    response.writeHead(404);
    response.end('Not found');
  }
});
app.listen(2000);