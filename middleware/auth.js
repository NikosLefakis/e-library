const User = require('../models/user');

const checkAuth = (req,res,next) => {
	const user_id = req.cookies.user_id
	const user_role = req.cookies.user_role;
	if(user_id && user_role)
	{
		User.findOne({
			where: {
				id: user_id
			}
		}).then((user) => {
			req.user = user;
			next();
		}).catch((err) => {res.json(err)});
	}
	else if(user_role == "guest")
	{
		next();
	}
	else
	{
		res.json({
			message: "Authentication Required",
			success: false
		});
	}
}

module.exports = checkAuth;