require('dotenv').config()
console.log(process.env.SECREAT)

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejs = require("ejs");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const { listingSchema } = require("./schema.js");
const { reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js')


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require('./routes/user.js');





const dbUrl = process.env.ATLASDB_URL;


main()
  .then(() => {
    console.log("Connected with DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET, 
  },
 touchAfter: 24 * 3600  // time period in seconds
})
store.on("error", ()=>{
  console.log("Session store error")
})

const seissionOptions ={
  store,
  secret :process.env.SECRET,
  resave : false,
  saveUninitialized : true,
  cookie :{
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly : true
  }
}


// app.get("/", (req, res) => {
//   res.send("hey im root");
// });


app.use(session(seissionOptions));
app.use(flash())

app.use(passport.initialize());
app.use(passport.session())   // this is for knowing that the req res is from the same user like for a single session so that the user do require to log in for every req
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());  //storing the user log in data during the session 
passport.deserializeUser(User.deserializeUser()); //clear the user log in data after ending the session 



app.use((req,res,next)=>{
  res.locals.successMsg = req.flash("success")
  res.locals.errorMsg = req.flash("error")
  res.locals.currUser = req.user;
  next()
})
// app.get("/demouser", async( req,res)=>{
//   let fakeuser = new User({
//     email: "student@gmail,com",
//     username: "delta-student"
//   })

//   let registeredUser = await User.register(fakeuser , "helloworld");
//   res.send(registeredUser)
// })
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/" , userRouter)

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not Found!"));
});

//error handler--------------->
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  console.log(err)
  res.status(statusCode);
  console.log(statusCode);
  res.render("error.ejs", { message, statusCode });
});

app.listen(8080, () => {
  console.log("Server is listening to port 8080");
});
