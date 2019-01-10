var camunda_request = require('request'),
  camunda_url = "http://couchdb.sistema.social:8080";
// username = "demo",
// password = "demo",
// auth = "Basic " + new Buffer(username + ":" + password).toString("base64");
var couchdb_request = require('request'),
  couchdb_url = "http://couchdb.sistema.social:5984";
// username2 = "admin",
// password2 = "ajv1439s",
// auth2 = "Basic " + new Buffer(username + ":" + password).toString("base64");
let template_database = "base_memo_modelo";

setInterval(function() {
  fun()
}, 1000);

function fun() {
  camunda_request({
    url: camunda_url + "/engine-rest/external-task/fetchAndLock",
    method: "POST",
    json: true, // <--Very important!!!
    body: {
      "workerId": "aWorkerId",
      "maxTasks": 2,
      "usePriority": true,
      "topics": [{
        "topicName": "create-user",
        "lockDuration": 10000
      }]
    }
  }, function(error, response, body) {
    console.log("body", body);
    body.forEach(topic => {
      let userData = {
        "name": topic.variables.user.value,
        "password": topic.variables.password.value,
        "phone": topic.variables.mobile.value,
        "email": topic.variables.email.value,
        "real_name": topic.variables.name.value,
        "roles": [],
        "db_list": [{
          "name": topic.variables.name.value,
          "database": topic.variables.user.value,
          "image": "./assets/images/login2.png"
        }],
        "type": "user"
      }
      couchdb_request({
        url: couchdb_url + "/_users/org.couchdb.user:" + topic.variables.user.value,
        method: "PUT",
        json: true, // <--Very important!!!
        body: userData
      }, function(error, response, userCreated) {
        console.log("userCreated", userCreated);

        let replicationBody = {
          "source": template_database,
          "target": "http://admin:ajv1439s@couchdb.sistema.social:5984/" + topic.variables.user.value,
          "create_target": true,
          //"continuous": true
        }
        couchdb_request({
          url: couchdb_url + "/_replicate",
          method: "POST",
          json: true, // <--Very important!!!
          body: replicationBody
        }, function(error, response, replicate) {
          //Modify Company Profile
          couchdb_request({
              url: couchdb_url + "/" + topic.variables.user.value + "/contact.myCompany",
              method: "GET",
            },
            function(error, response, config) {

              console.log("config", config);
              let configjson = JSON.parse(config);
              configjson.name = topic.variables.name.value;
              configjson.email = topic.variables.email.value;
              configjson.phone = topic.variables.mobile.value;
              configjson.user = true;
              configjson.user_details = {
                "username": topic.variables.user.value,
                "sale": true,
                "purchase": true,
                "finance": true,
                "service": true,
                "report": true,
                "config": true,
                "registered": true,
              }
              let createList = [
                {
                  "_id": "sequence.product",
                  "value": "0003"
                },
                {
                  "_id": "sequence.user",
                  "value": "02"
                },
                {
                  "_id": "sequence.sale."+topic.variables.user.value,
                  "value": "01-0001"
                },
                {
                  "_id": "sequence.purchase."+topic.variables.user.value,
                  "value": "01-0001"
                },
                {
                  "_id": "sequence.service."+topic.variables.user.value,
                  "value": "01-0001"
                },
                {
                  "_id": "sequence.invoice."+topic.variables.user.value,
                  "value": "001-001-0000001"
                },
                {
                  "_id": "sequence.receipt."+topic.variables.user.value,
                  "value": "01-0001"
                },
              ];
              createList.push(configjson);
              couchdb_request({
                url: couchdb_url + "/" + topic.variables.user.value + "/_bulk_docs",
                method: "POST",
                json: true, // <--Very important!!!
                body: {docs: createList}
              }, function(error, response, update) {
                console.log("update config", update);

                let userSet = {
                  "admins": {
                    "names": [topic.variables.user.value],
                    "roles": []
                  },
                  "members": {
                    "names": [topic.variables.user.value],
                    "roles": []
                  }
                }
                couchdb_request({
                  url: "http://admin:ajv1439s@couchdb.sistema.social:5984/" + topic.variables.user.value + "/_security",
                  method: "PUT",
                  json: true, // <--Very important!!!
                  body: userSet
                }, function(error, response, userSeted) {
                  console.log("userSeted", userSeted);

                  // Complete the task
                  camunda_request({
                    url: camunda_url + "/engine-rest/external-task/" + topic.id + "/complete",
                    method: "POST",
                    json: true, // <--Very important!!!
                    body: {
                      "workerId": "aWorkerId"
                    }
                  }, function(error, response, completed) {
                    console.log("completed", completed);
                  });
                })
              })
            })
        });
        // console.log("teste2");
      });
    })
  });
}
