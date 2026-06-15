const authenticate = (req,res,username,password) => {
	User.findOne({
		where: {
			username: username,
			password: password
		}
	}).then((user) => {
		res.cookie('user_id',user.id);
	});
}

module.exports = {
	authenticate
};