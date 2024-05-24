const express = require("express");
const app = express();
const cors = require('cors');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./tournament_organiser_db.db');

app.use(cors());
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Server port
var HTTP_PORT = 8000 
// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});

// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"REST API OK"})
})

// retrieving all row
app.get("/login_details", (req, res, next) => {
    var sql = "select * from login_details";
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});

// retrieving one row
app.get("/login_details/:id", (req, res, next) => {
    var sql = "select * from login_details where id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row
        })
      });
});

// inserting a row
app.post("/login_details", (req, res, next) => {
    var errors=[]
    if (!req.body.username){
        errors.push("No username specified");
    }
    if (!req.body.password){
        errors.push("No password specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        username: req.body.username,
        password : req.body.password
    }
    var sql ='INSERT INTO login_details (username, password) VALUES (?,?)'
    var params =[data.username, data.password]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
});


// updating a row
app.put("/login_details/:id", (req, res, next) => {
    var data = {
        username: req.body.username,
        password : req.body.password
    }
    db.run(
        `UPDATE login_details set 
           username = COALESCE(?,username), 
           password = COALESCE(?,password) 
           WHERE id = ?`,
        [data.username, data.password, req.params.id],
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({
                message: "success",
                data: data,
                changes: this.changes
            })
    });
});

// delete a row
app.delete("/login_details/:id", (req, res, next) => {
    db.run(
        'DELETE FROM login_details WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"deleted", changes: this.changes})
    });
});

// Default response for any other request
app.use(function(req, res){
    res.status(404);
});