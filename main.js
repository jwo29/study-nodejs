const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');
const template = require('./lib/template.js');
const path = require('path');
const sanitizeHtml = require('sanitize-html');

const mysql = require('mysql');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'dlwldn0313',
  database: 'ex'
});

db.connect();

var app = http.createServer(function(request,response){
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  if(pathname === '/'){
    if(queryData.id === undefined){
      db.query('SELECT * FROM topic', function(err, topics){
        var title = 'Welcome';
        var description = 'Hello, Node.js';

        var list = template.list(topics);
        var html = template.html(title, list,
          `<h2>${title}</h2><p>${description}</p>`,
          `<a href="/create">Create</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
    }else{
      db.query('SELECT * FROM topic', function(err, topics){
        if(err){
          throw err; // 에러 발생 시 콘솔에 출력 및 앱 중지
        }
        db.query('SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?', [queryData.id], function(err, topic){
          if(err){
            throw err;
          }
          // console.log(topic[0].title); // topic은 배열이기 때문에 인데스 값을 통해 접근해야 함
          var title = topic[0].title;
          var description = topic[0].description;
          
          var list = template.list(topics);
          var html = template.html(title, list,
            `<div>
              <h2>${title}</h2>
              <p>Created at ${topic[0].created}</p>
            </div>
            <div>
              <p>${description}</p>
              <p>By ${topic[0].name}</p>
            </div>`,
            `<a href="/create">Create</a>
             <a href="/update?id=${queryData.id}">Update</a>
            <form action="/delete_process" method="post">
              <input type="hidden" name="id" value="${queryData.id}">
              <input type="submit" value="Delete">
            </form>`
          );
          response.writeHead(200);
          response.end(html);
        });
      });
    }
  } else if(pathname === '/create'){
    db.query('SELECT * FROM topic', function(err, topics){
      if(err){
        throw err;
      }
      db.query('SELECT * FROM author', function(err, authors){
        if(err){
          throw err;
        }
        var authorSelect = template.authorSelect(authors, '');
        var title = 'Web - create';
      
        var list = template.list(topics);
        var html = template.html(title, list, `
        <form action="/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p>
            <textarea name="description" placeholder="description"></textarea>
          </p>
          <p>
            ${authorSelect}
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `, '');
      response.writeHead(200);
      response.end(html);
      });
      
    });
  } else if(pathname === '/create_process') {
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(){
      var post = qs.parse(body); // parse메소드를 통해 정보를 객체화할 수 있음
      db.query(`
      INSERT INTO topic (title, description, created, author_id)
       VALUES (?, ?, NOW(), ?)`,
        [post.title, post.description, post.author],
        function(err, result){
          if(err){
            throw err;
          }
          response.writeHead(302, {Location: `./?id=${result.insertId}`});
          response.end();
        });
    });
  } else if(pathname === '/update'){
    db.query('SELECT * FROM topic', function(err, topics){
      if(err){
        throw err;
      }
      db.query('SELECT * FROM topic WHERE id=?', [queryData.id], function(err, topic){
        if(err){
          throw err;
        }
        db.query('SELECT * FROM author', function(err, authors){
          if(err){
            throw err;
          }
          var authorSelect = template.authorSelect(authors, topic[0].author_id);

          var list = template.list(topics);
          var html = template.html(topic[0].title, list,
          `
          <form action="/update_process" method="post">
            <input type="hidden" name="id" value="${topic[0].id}">
            <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
            <p>
              <textarea name="description" placeholder="description">${topic[0].description}</textarea>
            </p>
            <p>
              ${authorSelect}
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
    });
  } else if(pathname === '/update_process'){
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      db.query('UPDATE topic SET title=?, description=?, author_id=? WHERE id=?',
      [post.title, post.description, post.author, post.id],
      function(err, result){
        if(err){
          throw err;
        }
        response.writeHead(302, {Location: `./?id=${post.id}`});
        response.end();
      });
    });
  } else if(pathname === '/delete_process'){
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(){
      var post = qs.parse(body); // parse메소드를 통해 정보를 객체화할 수 있음
      db.query('DELETE FROM topic WHERE id=?', [post.id],
      function(err, result){
        if(err){
          throw err;
        }
        response.writeHead(302, {Location: `/`});
        response.end();
      });
    });
  } else {
    response.writeHead(404);
    response.end('Not found');
  }
});
app.listen(2000);