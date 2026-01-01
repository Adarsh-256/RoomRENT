const User = require("../models/user");
const passport = require("passport");

module.exports.signup = (req,res)=>{
    return res.render("users/signup.ejs");
};

module.exports.signupPost = async(req,res,next)=>{
    try{ let {username,email,password} = req.body;
    const newuser = new User({username,email});
    const registeredUser = await User.register(newuser,password);
    console.log(registeredUser);
    req.login(registeredUser, err=>{
        if(err){
            return next(err)
        } req.flash("success", "Welcome to RoomRENT");
        res.redirect("/listings");
    });
    } catch (e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.login = async(req,res)=>{
    res.render("users/login.ejs");
};

module.exports.loginPost = [
    passport.authenticate("local",{
    failureRedirect:"/login",
    failureFlash:true,
}),
   async(req,res)=>{
    req.flash("success", "welcome back!!");
    const redirectUrl = res.locals.returnTo || "/listings";
    res.redirect(redirectUrl);
}];

