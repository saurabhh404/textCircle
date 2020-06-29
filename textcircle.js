this.Documents = new Mongo.Collection("documents")
EditingUsers = new Mongo.Collection("editingUsers")

if (Meteor.isClient) {

  // //update the session current_date variable every 1000 msec
  // Meteor.setInterval(function() {
  //   Session.set("current_date", new Date())
  // }, 1000)

  Meteor.subscribe("documents")
  Meteor.subscribe("editingUsers")

  Template.editor.helpers({
    docid: function () {
      setUpCurrentDocument()
      return Session.get('docid')
      // var doc = Documents.findOne()
      // if (doc) return doc._id
      // else return undefined
    },
    config: function () {
      return function (editor) {
        editor.setOption("lineNumbers", true)
        editor.setOption("theme", "duotone-dark")
        editor.on("change", function (cm_editor, info) {
          $("#viewer_iframe").contents().find("html").html(cm_editor.getValue())
          Meteor.call("addEditingUser")
        })
      }
    }
  })

  // Template.date_display.helpers({
  //   current_date: function() {
  //     return Session.get("current_date")
  //   }
  // })

  Template.editingUsers.helpers({
    users: function () {
      var doc, eusers, users
      doc = Documents.findOne()
      if (!doc) return
      eusers = EditingUsers.findOne({
        docid: doc._id
      })
      if (!eusers) return
      users = new Array()
      var i = 0
      for (var user_id in eusers.users) {
        users[i] = fixObjectKeys(eusers.users[user_id])
        i++
      }
      return users
    }
  })

  Template.navbar.helpers({
    documents: function () { return Documents.find() }
  })

  Template.docMeta.helpers({
    document: function () { return Documents.findOne({ _id: Session.get('docid') }) },
    canEdit: function () {
      var doc
      doc = Documents.findOne({ _id: Session.get('docid') })
      if (doc) {
        if (doc.owner == Meteor.userId()) {
          return true
        }
      } return false
    }
  })

  Template.editableText.helpers({
    userCanEdit: function (doc, Collection) {
      doc = Documents.findOne({ _id: Session.get('docid'), owner: Meteor.userId() })
      if (doc) return true
      else return false
    }
  })

  //////EVENTS//////
  Template.navbar.events({
    "click .js-add-doc": function (event) {
      event.preventDefault()
      if (!Meteor.user())
        alert("You need to login first")
      else {
        Meteor.call("addDoc", function (err, res) {
          if (!err) {
            console.log("callback received: ", res);
            Session.set('docid', res)
          }
        })
      }
    },

    "click, .js-load-doc": function (event) {
      Session.set('docid', this._id)
    }
  })

  Template.docMeta.events({
    "click, .js-tog-private": function (event) {
      var doc = { _id: Session.get('docid'), isPrivate: event.target.checked }
      Meteor.call("updateDocPrivacy", doc)
    }
  })

} //end isClient

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    if (!Documents.findOne()) {
      // no docs yet
      Documents.insert({ title: "My new Document" })
    }
  })

  Meteor.publish("documents", function () {
    return Documents.find({
      $or: [
        { isPrivate: false },
        { owner: this.userId }
      ]
    });
  })
  Meteor.publish("editingUsers", function () {
    return EditingUsers.find({})
  })

}

Meteor.methods({
  addEditingUser: function () {
    var doc, user, eusers
    doc = Documents.findOne()
    if (!doc) {
      return //no doc
    }
    if (!this.userId) {
      return //no logged in user
    }
    user = Meteor.user().profile
    eusers = EditingUsers.findOne({
      docid: doc._id
    })
    if (!eusers) {
      eusers = {
        docid: doc._id,
        users: {}
      }
    }
    user.lastEdit = new Date()
    eusers.users[this.userId] = user
    EditingUsers.upsert({
      _id: eusers._id
    }, eusers)
  },

  addDoc: function () {
    var doc;
    if (!this.userId) return
    else {
      doc = {
        owner: this.userId,
        createdOn: new Date(),
        title: "My New Doc"
      }
      var id = Documents.insert(doc)
      console.log("addDoc method: got an id " + id)
      return id
    }
  },

  updateDocPrivacy: function (doc) {
    var realDoc = Documents.findOne({ _id: doc._id, owner: this.userId })
    if (realDoc) {
      realDoc.isPrivate = doc.isPrivate
      Documents.update({ _id: doc._id }, realDoc)
    }
  }
})

function setUpCurrentDocument() {
  var doc
  if (!Session.get('docid')) {
    doc = Documents.findOne()
    if (doc) {
      Session.set('docid', doc._id)
    }
  }
}

function fixObjectKeys(obj) {
  var newObj = {}
  for (key in obj) {
    var key2 = key.replace("-", "")
    newObj[key2] = obj[key]
  }
  return newObj
}
