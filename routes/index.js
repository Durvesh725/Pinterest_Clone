var express = require("express");
var router = express.Router();
const userModel = require('./users');

const passport = require('passport');
const localStrategy = require('passport-local')
passport.use(new localStrategy(userModel.authenticate()));

const upload = require('./multer');


router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/register", function (req, res, next) {
  res.render("register");
});

router.get('/profile', isLoggedIn, async (req, res, next) => {
  const user = await userModel.findOne({username: req.session.passport.user});
  res.render('profile', {user});
});

router.post('/fileupload', upload.single('avatar'),async function (req, res, next) {
  const user = await userModel.findOne({username: req.session.passport.user});
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect('profile');
})

router.post("/register", function (req, res, next) {
  const data = new userModel({
    username: req.body.username,
    email: req.body.email,
    contact: req.body.contact,
  });

  userModel.register(data, req.body.password)
  .then(function() {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});

// login
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/",
    failureFlash: true,
  }),
  function (req, res) {}
);

router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated())
    return next(); 
  res.redirect('/login');
};

module.exports = router;
