Meteor.startup(function() {
    // code to run on server at startup
    // if (!Documents.findOne()) {
    //     // no docs yet
    //     Documents.insert({ title: "My new Document" })
    // }
})

Meteor.publish("documents", function() {
    return Documents.find({
        $or: [
            { isPrivate: { $ne: true } },
            { owner: this.userId }
        ]
    });
})
Meteor.publish("editingUsers", function() {
    return EditingUsers.find({})
})

// Meteor.publish("comments", function() {
//     return Comments.find({})
// })