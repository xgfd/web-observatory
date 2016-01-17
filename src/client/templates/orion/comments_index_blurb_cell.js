Template.commentsIndexBlurbCell.helpers({
	blurb: function(){
		let blurb = jQuery.truncate(this.body, {
		  length: 15
		});
		return blurb
	}
});
