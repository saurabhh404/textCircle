// //update the session current_date variable every 1000 msec
// Meteor.setInterval(function() {
//   Session.set("current_date", new Date())
// }, 1000)

Meteor.subscribe("documents")
Meteor.subscribe("editingUsers")
    // Meteor.subscribe("comments")


Router.configure({
    layoutTemplate: 'ApplicationLayout'
})

Router.route('/', function() {
    this.render('navbar', { to: 'header' })
    this.render('docList', { to: 'main' })
})

Router.route('/documents/:id', function() {
    Session.set('docid', this.params.id)
    this.render('navbar', { to: 'header' })
    this.render('docItem', { to: 'main' })
})


Template.editor.helpers({
    docid: function() {
        setUpCurrentDocument()
        return Session.get('docid')
            // var doc = Documents.findOne()
            // if (doc) return doc._id
            // else return undefined
    },
    config: function() {
        return function(editor) {
            editor.setOption("lineNumbers", true)
            editor.setOption("theme", "duotone-dark")
            editor.on("change", function(cm_editor, info) {
                $("#viewer_iframe").contents().find("html").html(cm_editor.getValue())
                Meteor.call("addEditingUser", Session.get('docid'))
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
    users: function() {
        var doc, eusers, users
        doc = Documents.findOne({ _id: Session.get('docid') })
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
    documents: function() { return Documents.find() }
})

Template.docMeta.helpers({
    document: function() { return Documents.findOne({ _id: Session.get('docid') }) },
    canEdit: function() {
        var doc
        doc = Documents.findOne({ _id: Session.get('docid') })
        if (doc) {
            if (doc.owner == Meteor.userId()) {
                return true
            }
        }
        return false
    }
})

Template.editableText.helpers({
    userCanEdit: function(doc, Collection) {
        doc = Documents.findOne({ _id: Session.get('docid'), owner: Meteor.userId() })
        if (doc) return true
        else return false
    }
})

Template.docList.helpers({
    documents: function() {
        return Documents.find()
    }
})

// Template.insertCommentForm.helpers({
//         docid: function() { return Session.get('docid') }
//     })
//////EVENTS//////
Template.navbar.events({
    "click .js-add-doc": function(event) {
        event.preventDefault()
        if (!Meteor.user())
            alert("You need to login first")
        else {
            Meteor.call("addDoc", function(err, res) {
                if (!err) {
                    console.log("callback received: ", res);
                    Session.set('docid', res)
                }
            })
        }
    },

    "click, .js-load-doc": function(event) {
        Session.set('docid', this._id)
    }
})

Template.docMeta.events({
    "click, .js-tog-private": function(event) {
        var doc = { _id: Session.get('docid'), isPrivate: event.target.checked }
        Meteor.call("updateDocPrivacy", doc)
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