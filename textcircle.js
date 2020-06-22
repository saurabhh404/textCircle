this.Documents = new Mongo.Collection("documents")

if (Meteor.isClient) {

  // //update the session current_date variable every 1000 msec
  // Meteor.setInterval(function() {
  //   Session.set("current_date", new Date())
  // }, 1000)

  Template.editor.helpers({
    docid: function() {
      var doc = Documents.findOne()
      if (doc) return doc._id
      else return undefined

    },
    config: function(){
      return function(editor){
        editor.on("change", function(cm_editor, info){
          $("#viewer_iframe").contents().find("html").html(cm_editor.getValue())
        })
      }
    }
  })

  // Template.date_display.helpers({
  //   current_date: function() {
  //     return Session.get("current_date")
  //   }
  // })
}

if (Meteor.isServer) {
  Meteor.startup(function() {
    // code to run on server at startup
    if (!Documents.findOne()) {
      // no docs yet
      Documents.insert({
        title: "My new Document"
      })
    }
  })
}
