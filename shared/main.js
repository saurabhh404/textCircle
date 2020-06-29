Meteor.methods({
    addEditingUser: function(docid) {
        var doc, user, eusers
        doc = Documents.findOne({ _id: docid })
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

    addDoc: function() {
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

    updateDocPrivacy: function(doc) {
        var realDoc = Documents.findOne({ _id: doc._id, owner: this.userId })
        if (realDoc) {
            realDoc.isPrivate = doc.isPrivate
            Documents.update({ _id: doc._id }, realDoc)
        }
    },

    // addComment: function(comment) {
    //     console.log("addComment method called");
    //     if (this.userId) {
    //         comment.createdOn = new Date()
    //         comment.userId = this.userId
    //         return Comments.insert(comment)
    //     }
    //     return
    // }
})