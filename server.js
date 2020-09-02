//import http module
const http = require("http");
const fs = require("fs");
const resource = require("./resource");
const { SlowBuffer } = require("buffer");

const PORT = process.env.port || 8000;

const baseUrl = `http://localhost:${PORT}`;

//create server
const server = http.createServer((req, res) => {
  const url = req.url;

  const method = req.method;
  //set content type header
  res.setHeader("Content-Type", "text/html");

  let isAuth = resource.checkIfAuth(req);
  switch (url) {
    case "/":
      if (isAuth === true) {
        resource.renderLogout(req, res);
        res.write(`
        <h2 style="font-size: 2rem; text-align:center; display:block; margin:auto; width:30rem; margin-top:5rem; border:5px solid #ccc; border-radius:10px; padding:3rem;">
          Welcome to our API   
        </h2>
        <h2 style="font-size: 2rem; text-align:center; display:block; margin:auto; width:30rem; margin-top:5rem; border:5px solid #ccc; border-radius:10px; padding:3rem;">
          Go to to <a href="http://localhost:8000/resources" target="_blank">http://localhost:8000/resources</a>  to view all current
          resources in a pretty format
        </h2>
        <h2 style="font-size: 2rem; text-align:center; display:block; margin:auto; width:30rem; margin-top:5rem; border:5px solid #ccc; border-radius:10px; padding:3rem;">
          Go to to <a href="http://localhost:8000/resources/json" target="_blank">http://localhost:8000/resources/json</a>  to view all current
          resources in a JSON-like format
        </h2>
  
        <h2 style="font-size: 2rem; text-align:center; display:block; margin:auto; width:30rem; margin-top:5rem; border:5px solid #ccc; border-radius:10px; padding:3rem;">
          Go to to <a href="http://localhost:8000/resource/add" target="_blank">http://localhost:8000/resource/add</a>  to add
          a new resource. Be careful! The ID you submit must not already exist, or the API won't let you add the resource.
        </h2>
  
        <h2 style="font-size: 2rem; text-align:center; display:block; margin:auto; width:30rem; margin-top:5rem; border:5px solid #ccc; border-radius:10px; padding:3rem;">
          Go to to <a href="#">http://localhost:8000/resource/:id</a>  (e.g. <a href="#">http://localhost:8000/resource/5</a> to access the resource with id 5)
          to edit or delete a specific resource. Be careful! The id you access via the url must exist.
        </h2>
  
        <h2 style="font-size: 2rem; text-align:center; display:block; margin:auto; width:30rem; margin-top:5rem; border:5px solid #ccc; border-radius:10px; padding:3rem;">
          Your 'database' is <a href="#">db.json</a>
          that's where all the resources data is being persisted so the API 'remembers' it.
        </h2>
        `);
        res.end();
      } else {
        res.write(`
        Please log in by going to <br>
        <a href="http://localhost:8000/login">The login page</a> or
        <br>
        sign up on the <a href="http://localhost:8000/register">The register page<a/>
      `);
        res.end();
      }

      break;
    case "/resources":
      if (isAuth === true) {
        resource.renderLogout(req, res);
        resource.getAll(res);
      } else {
        res.write(`
        Please log in by going to <br>
        <a href="http://localhost:8000/login">The login page</a> or
        <br>
        sign up on the <a href="http://localhost:8000/register">The register page<a/>
      `);
        res.end();
      }
      break;
    case "/resources/json":
      if (isAuth === true) {
        resource.renderLogout(req, res);
        resource.getJson(res);
      } else {
        res.write(`
          Please log in by going to <br>
          <a href="http://localhost:8000/login">The login page</a> or
          <br>
          sign up on the <a href="http://localhost:8000/register">The register page<a/>
        `);
        res.end();
      }
      break;
    case "/resource/add":
      if (method === "GET") {
        if (isAuth === true) {
          resource.renderLogout(req, res);
          res.write(`
          <h1 style="text-align:center; margin:3rem;">Add a new resource</h1>
          <form style="display:block; margin:auto; border: 2px solid #ccc; text-align:center; width:30rem; margin-bottom:1rem; padding:2rem!important; font-size:1.5rem!important;" action="/resource/add" method="POST"  >
            <label for="text">Resource Text</label>
            <input name="text" type="text"/>
            <br> <br> 
            <label for="id">Resource id</label>
            <input name="id" type="number"/>
            <br> <br>
            <label for="date">Submission Date</label>
            <input name="date" type="date"/>
            <br> <br>
            <input style="display:block; margin:auto!important; width:20rem; font-size:2rem;" type="submit" value="Add Resource"> 
          </form>
          `);
          res.end();
        } else {
          res.write(`
          Please log in by going to <br>
          <a href="http://localhost:8000/login">The login page</a> or
          <br>
          sign up on the <a href="http://localhost:8000/register">The register page<a/>
        `);
          res.end();
        }
      } else if (method === "POST") {
        resource.addResource(req, res);
      }

      break;

    case "/resource/delete":
      if (isAuth === true) {
        if (method === "POST") {
          const body = [];
          req.on("data", (chunk) => {
            body.push(chunk);
          });
          req.on("end", () => {
            const parsedBody = Buffer.concat(body).toString();
            let idToDelete = parsedBody.split("=")[1];

            fs.readFile("db.json", "utf8", function (err, data) {
              if (err) throw err;
              if (data !== "") {
                let resources = JSON.parse(data).resources;
                resources.map((r, index) => {
                  if (r.id === idToDelete) {
                    resources.splice(index, 1);
                  }
                });
                let obj = {};
                obj.resources = resources;
                fs.writeFile("db.json", JSON.stringify(obj), (err) => {});
              }
            });

            res.write(
              `RESOURCE with the id ${idToDelete} deleted successfully`
            );
            res.end();
          });
        } else {
          res.write("404 error page not found!");
          res.end();
        }
      } else {
        res.write(`
        Please log in by going to <br>
        <a href="http://localhost:8000/login">The login page</a> or
        <br>
        sign up on the <a href="http://localhost:8000/register">The register page<a/>
      `);
        res.end();
      }

      break;

    case "/resource/edit":
      if (isAuth === true) {
        if (method === "POST") {
          const body = [];
          req.on("data", (chunk) => {
            body.push(chunk);
          });
          req.on("end", () => {
            const parsedBody = Buffer.concat(body).toString();
            let idToUpdate = parsedBody.split("&")[1].split("=")[1];
            let textToUpdate = parsedBody.split("&")[0].split("=")[1];
            let dateToUpdate = parsedBody.split("&")[2].split("=")[1];
            console.log(parsedBody);
            console.log(idToUpdate);
            console.log(textToUpdate);
            console.log(dateToUpdate);

            fs.readFile("db.json", "utf8", function (err, data) {
              if (err) throw err;
              if (data !== "") {
                let resources = JSON.parse(data).resources;
                resources.map((r, index) => {
                  if (r.id === idToUpdate) {
                    r.text = textToUpdate.split("+").join(" ");
                    r.id = idToUpdate;
                    r.date = dateToUpdate;
                  }
                });

                let obj = {};
                obj.resources = resources;
                fs.writeFile("db.json", JSON.stringify(obj), (err) => {});
              }
            });
            res.write(`
             
              RESOURCE with the id ${idToUpdate} was edited successfully
            `);
            res.end();
          });
        } else if (method === "GET") {
          res.write("404 error page not found!");
          res.end();
        }
      } else {
        res.write(`
          Please log in by going to <br>
          <a href="http://localhost:8000/login">The login page</a> or
          <br>
          sign up on the <a href="http://localhost:8000/register">The register page<a/>
        `);
        res.end();
      }

      break;
    case "/register":
      if (method === "GET") {
        res.write(`
      <h1 
        style="text-align:center; margin:3rem;"
      >
        Sign Up so you can see resources 
      </h1>
      <form 
        style="display:block; margin:auto; border: 2px solid #ccc; text-align:center; width:30rem; margin-bottom:1rem; padding:2rem!important; font-size:1.5rem!important;" 
        action="/register" 
        method="POST"  
      >
        <label for="username">Username</label>
        <input name="username" type="text"/>
        <br> <br> 
        <label for="password">Password</label>
        <input name="password" type="password"/> 
        <br> <br>
        <input style="display:block; margin:auto!important; width:20rem; font-size:2rem;" type="submit" value="Sign Up"> 
      </form>
      `);
        res.end();
      } else if (method === "POST") {
        const body = [];
        req.on("data", (chunk) => {
          body.push(chunk);
        });
        req.on("end", () => {
          const parsedBody = Buffer.concat(body).toString();
          let userName = parsedBody.split("&")[0].split("=")[1];
          let pass = parsedBody.split("&")[1].split("=")[1];
          let newUser = {
            username: userName,
            pw: pass,
          };

          fs.readFile("users.json", "utf8", function (err, data) {
            if (err) throw err;
            if (data !== "") {
              let users = JSON.parse(data).users;
              let obj = {};
              obj.users = users;
              users.push(newUser);
              fs.writeFile("users.json", JSON.stringify(obj), (err) => {});
            } else {
              //file empty no user
              let obj = {};
              let users = [];
              obj.users = users;
              users.push(newUser);
              fs.writeFile("users.json", JSON.stringify(obj), (err) => {});
            }
          });
          res.write("USER REGISTERED SUCCESSFULLY");
          res.end();
        });
      }
      break;
    case "/login":
      if (method === "GET") {
        res.write(`
      <h1 
        style="text-align:center; margin:3rem;"
      >
      Sign In so you can see resources 
    </h1>
    <form 
      style="display:block; margin:auto; border: 2px solid #ccc; text-align:center; width:30rem; margin-bottom:1rem; padding:2rem!important; font-size:1.5rem!important;" 
      action="/login" 
      method="POST"  
    >
      <label for="username">Username</label>
      <input name="username" type="text"/>
      <br> <br> 
      <label for="password">Password</label>
      <input name="password" type="password"/> 
      <br> <br>
      <input style="display:block; margin:auto!important; width:20rem; font-size:2rem;" type="submit" value="Login"> 
    </form>
      `);
        res.end();
      } else if (method === "POST") {
        const body = [];
        req.on("data", (chunk) => {
          body.push(chunk);
        });
        req.on("end", () => {
          const parsedBody = Buffer.concat(body).toString();
          let userName = parsedBody.split("&")[0].split("=")[1];
          let pass = parsedBody.split("&")[1].split("=")[1];
          let authUser = {
            username: userName,
            pw: pass,
          };
          //read auth users file

          fs.readFile("users.json", "utf8", function (err, data) {
            if (err) throw err;
            if (data !== "") {
              let users = JSON.parse(data).users;
              users.map((u) => {
                if (u.username === userName && u.pw === pass) {
                  fs.readFile("auth.json", "utf8", function (err, data) {
                    if (err) throw err;
                    if (data !== "") {
                      let authUsers = JSON.parse(data).authUsers;
                      let obj = {};
                      obj.authUsers = authUsers;
                      authUsers.push(authUser);
                      fs.writeFile(
                        "auth.json",
                        JSON.stringify(obj),
                        (err) => {}
                      );
                    } else {
                      //file empty no user
                      let obj = {};
                      let authUsers = [];
                      obj.authUsers = authUsers;
                      authUsers.push(authUser);
                      fs.writeFile(
                        "auth.json",
                        JSON.stringify(obj),
                        (err) => {}
                      );
                    }
                    resource.saveCookie(res, userName);

                    res.write(`
                      Welcome to our api ${userName},
                      go to <a href="http://localhost:8000/resources" target="_blank">http://localhost:8000/resources</a>
                      to view all resources
                    `);

                    res.end();
                  });
                } else {
                  res.write("WRONG CREDENTIALS");
                  res.end();
                }
              });
            } else {
              //file empty no user
              res.write("THERE ARE CURRENTLY NO USERS IN THE DB");
              res.end();
            }
          });
        });
      }
      break;
    case "/logout":
      if (isAuth === true) {
        if (method === "POST") {
          const body = [];
          req.on("data", (chunk) => {
            body.push(chunk);
          });
          req.on("end", () => {
            const parsedBody = Buffer.concat(body).toString();
            console.log(parsedBody);
            let userToLogOut = parsedBody.split("=")[1];
            console.log(userToLogOut);
            fs.readFile("auth.json", "utf8", function (err, data) {
              if (err) throw err;
              if (data !== "") {
                let authUsers = JSON.parse(data).authUsers;

                authUsers.map((u, index) => {
                  if (u.username === userToLogOut) {
                    authUsers.splice(index, 1);
                    let obj = {};
                    obj.authUsers = authUsers;
                    fs.writeFile("auth.json", JSON.stringify(obj), (err) => {});
                    resource.removeCookie(res);
                    res.write(`
                    LOGUT
                    `);
                    res.end();
                  }
                });
              } else {
              }
            });
          });
        }
      } else {
        res.write(`
          Please log in by going to <br>
          <a href="http://localhost:8000/login">The login page</a> or
          <br>
          sign up on the <a href="http://localhost:8000/register">The register page<a/>
        `);
        res.end();
      }

      break;
    case "/protected":
      if (isAuth === true) {
        res.write("protected route here");
      } else {
        res.write(`
        Please log in by going to <br>
        <a href="http://localhost:8000/login">The login page</a> or
        <br>
        sign up on the <a href="http://localhost:8000/register">The register page<a/>
      `);
      }
      res.end();
      break;
    default:
      if (isAuth === true) {
        let params = url.split("/");
        let id = params[2];
        if (id !== undefined && !isNaN(id)) {
          fs.readFile("db.json", "utf8", function (err, data) {
            if (err) throw err;
            if (data !== "") {
              let resources = JSON.parse(data).resources;
              let IDs = [];
              resources.map((r) => {
                IDs.push(r.id);
              });
              if (IDs.includes(id)) {
                res.write(`
                  <h1 style="text-align:center; display:block; margin:auto; width:30rem; margin-top:5rem; border:5px solid #ccc; border-radius:10px; padding:3rem;" >  
                      Edit/Delete resource with id <span style="border-bottom:5px solid #000;">${id}</span>
                  </h1>
                  <button style="display:block; margin:auto; width:20rem; height:3rem; font-size:1.5rem; margin-top:2rem;">
                    <a  target="_blank" href="http://localhost:8000/edit/resource/${id}">
                      Edit resource with id ${id}
                    </a>
                  </button>
  
                  <button style="display:block; margin:auto; width:20rem; height:3rem; font-size:1.5rem; margin-top:2rem;">
                    <a  target="_blank" href="http://localhost:8000/delete/resource/${id}">
                      Delete resource with id ${id}
                    </a>
                  </button>
                `);
              } else {
                res.write(`
                <h1 style="text-align:center; display:block; margin:auto; width:30rem; margin-top:5rem; border:5px solid #ccc; border-radius:10px; padding:3rem;">
                  There is currently no available resource with the id ${id} to delete/update.
                  Add it by going to <a href="http://localhost:8000/resource/add" target="_blank">http://localhost:8000/resource/add</a> 
                </h1>
                `);
              }
              res.end();
              console.log(IDs);
            } else {
              res.write(`
                <h1 style="text-align:center; display:block; margin:auto; width:30rem; margin-top:5rem; border:5px solid #ccc; border-radius:10px; padding:3rem;">
                  There are currently no available resources to delete/update.
                  Add some by going to <a href="http://localhost:8000/resource/add" target="_blank">http://localhost:8000/resource/add</a> 
                </h1>
              `);
            }
          });
        } else if (params[1] === "delete") {
          let tempId = params[3];

          fs.readFile("db.json", "utf8", function (err, data) {
            if (err) throw err;
            if (data !== "") {
              let resources = JSON.parse(data).resources;
              let IDs = [];
              resources.map((r) => {
                IDs.push(r.id);
              });
              if (IDs.includes(tempId)) {
                res.write(`
                <h1 style="text-align:center; margin:3rem;">Delete resource with id ${tempId}</h1>
                <form 
                  action="/resource/delete" 
                  method="POST" 
                  style="display:block; margin:auto; border: 2px solid #ccc; text-align:center; width:30rem; margin-bottom:1rem; padding:2rem!important; font-size:1.5rem!important;" 
                >
                    <input  type="hidden" value=${tempId} name="id" for="id">
                    <br><br>
                    <input style="display:block; margin:auto!important; width:20rem; font-size:2rem;" type="submit" value="Delete Resource"> 
               
                </form>
                `);

                res.end();
              } else {
                res.write(`
                <h1 style="text-align:center; display:block; margin:auto; width:30rem; margin-top:5rem; border:5px solid #ccc; border-radius:10px; padding:3rem;">
                  There is currently no available resource with the id ${tempId} to delete/update.
                  Add it by going to <a href="http://localhost:8000/resource/add" target="_blank">http://localhost:8000/resource/add</a> 
                </h1>
              `);
                res.end();
              }
            }
          });
        } else if (params[1] === "edit") {
          let tempId = params[3];
          res.write(`
          <h1 style="text-align:center; margin:3rem;">EDIT resource with id ${tempId}</h1>
          <form style="display:block; margin:auto; border: 2px solid #ccc; text-align:center; width:30rem; margin-bottom:1rem; padding:2rem!important; font-size:1.5rem!important;" 
          action="/resource/edit" method="POST"  >
            <label for="text">Resource Text</label>
            <input name="text" type="text"/>
            <br> <br> 
            <label for="id">Resource id</label>
            <input name="id" type="number" value='${tempId}'/>
            <br> <br>
            <label for="date">Submission Date</label>
            <input name="date" type="date"/>
            <br> <br>
            <input style="display:block; margin:auto!important; width:20rem; font-size:2rem;" type="submit" value="Edit Resource"> 
          </form>
          `);
          res.end();
        } else {
          res.write("404 error page not found");
          res.end();
        }
      } else {
        res.write(`
          Please log in by going to <br>
          <a href="http://localhost:8000/login">The login page</a> or
          <br>
          sign up on the <a href="http://localhost:8000/register">The register page<a/>
        `);
      }

      break;
  }
});

console.log(`Server started on port ${PORT}`);

server.listen(8000);
