var couchdb_request = require('request'),
  couchdb_url = "http://couchdb.sistema.social:5984";
let source_database = "beck_limpada";
let destination_database = "base_memo2_modelo";

// setInterval(function() {
//   fun()
// }, 1000);

// function fun() {
  // camunda_request({
  //   url: camunda_url + "/engine-rest/external-task/fetchAndLock",
  //   method: "POST",
  //   json: true, // <--Very important!!!
  //   body: {
  //     "workerId": "aWorkerId",
  //     "maxTasks": 2,
  //     "usePriority": true,
  //     "topics": [{
  //       "topicName": "create-user",
  //       "lockDuration": 10000
  //     }]
  //   }
  // }, function(error, response, body) {
  //   console.log("body", body);
  //   body.forEach(topic => {


      // let userData = {
      //   "name": topic.variables.user.value,
      //   "password": topic.variables.password.value,
      //   "phone": topic.variables.mobile.value,
      //   "email": topic.variables.email.value,
      //   "real_name": topic.variables.name.value,
      //   "roles": [],
      //   "type": "user"
      // }
      couchdb_request({
        url: couchdb_url+"/"+source_database+"/_all_docs?include_docs=true",
        method: "GET"
      }, function(error, response, template_data) {
        let template_docs = JSON.parse(template_data)
        // console.log("template_data", template_docs.rows);
        let docs = [];
        template_docs.rows.forEach(doc=>{
          console.log("id:", doc)
          delete doc.doc._rev;
          docs.push(doc.doc);
        })
        // delete template_docs.rows[1].doc._rev;
        // docs.push(template_docs.rows[1].doc);
        // console.log("docs", docs);
        couchdb_request({
          url: "https://admin:ajv1439s@couchdb.sistema.social/"+destination_database+"/_bulk_docs",
          method: "POST",
          json: true, // <--Very important!!!
          body: {docs: docs}
        }, function(error, response, userSeted) {
          console.log("userSeted", userSeted);
          // Complete the task
        })
        // let replicationBody = {
        //   "source": template_database,
        //   "target": "http://admin:ajv1439s@couchdb.sistema.social:5984/" + topic.variables.user.value,
        //   "create_target": true,
        //   //"continuous": true
        // }
        // couchdb_request({
        //   url: couchdb_url + "/_replicate",
        //   method: "POST",
        //   json: true, // <--Very important!!!
        //   body: replicationBody
        // }, function(error, response, replicate) {
        //   //Modify Company Profile
        //   couchdb_request({
        //     url: couchdb_url + "/" + topic.variables.user.value + "/contact.myCompany",
        //     method: "GET",
        //
        //   }, function(error, response, config) {
        //
        //     console.log("config", config);
        //     let configjson = JSON.parse(config);
        //     configjson.name = topic.variables.name.value;
        //     configjson.email = topic.variables.email.value;
        //     configjson.phone = topic.variables.mobile.value;
        //     couchdb_request({
        //       url: couchdb_url + "/" + topic.variables.user.value + "/contact.myCompany",
        //       method: "PUT",
        //       json: true, // <--Very important!!!
        //       body: configjson
        //     }, function(error, response, update) {
        //       console.log("update config", update);
        //
        //       let userSet = {
        //         "admins": {
        //           "names": [topic.variables.user.value],
        //           "roles": []
        //         },
        //         "members": {
        //           "names": [topic.variables.user.value],
        //           "roles": []
        //         }
        //       }
        //       couchdb_request({
        //         url: "http://admin:ajv1439s@couchdb.sistema.social:5984/" + topic.variables.user.value + "/_security",
        //         method: "PUT",
        //         json: true, // <--Very important!!!
        //         body: userSet
        //       }, function(error, response, userSeted) {
        //         console.log("userSeted", userSeted);
        //         // Complete the task
        //         camunda_request({
        //           url: camunda_url + "/engine-rest/external-task/" + topic.id + "/complete",
        //           method: "POST",
        //           json: true, // <--Very important!!!
        //           body: {
        //             "workerId": "aWorkerId"
        //           }
        //         }, function(error, response, completed) {
        //           console.log("completed", completed);
        //         });
        //       })
        //     })
        //   })
        // });
      })
    // })
//   }
// }
