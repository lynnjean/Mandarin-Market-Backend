var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

var ReportSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  comment:{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
}, {timestamps: true});

ReportSchema.methods.toJSONFor = function(){
  return {
    post: this.post,
    comment:this.comment,
    createdAt: this.createdAt
  };
};

mongoose.model('Report', ReportSchema);