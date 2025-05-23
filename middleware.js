const Listing = require("./models/listing")
const Review = require("./models/review.js")
const ExpressError = require("./utils/ExpressError");
const {reviewSchema} = require("./schema.js")


module.exports.validateReview= (req,res,next)=>{
  let {error} = reviewSchema.validate(req.body);
   if(error){
    // let errMsg = error.details[0].message
    let errMsg = error.details.map((el)=> el.message).join(",")
    console.log(errMsg)
    
    throw new ExpressError(400, errMsg)
   }else{
    next()   
   }
}

module.exports.isLoggedin = (req,res,next)=>{
    if(!req.isAuthenticated()){
      req.session.redirectUrl = req.originalUrl
        req.flash("error","You must be logged in to create listing!");
        return res.redirect("/login")
      }
      next()
}

module.exports.saveRedirectUrl = (req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl = req.session.redirectUrl
  }
  next()
}

module.exports.isOwner = async(req,res,next)=>{
  let { id } = req.params;
  let listing = await Listing.findById(id);
     if( !listing.owner.equals(res.locals.currUser._id)){
      req.flash("error", "You are not the owner of this listing");
      return res.redirect(`/listings/${id}`)
     }
     next()
}
module.exports.isReviewAuthor = async(req,res,next)=>{
  let { id ,reviewId } = req.params;
  console.log(reviewId)

  let review = await Review.findById(reviewId);
  console.log(review)
     if( !review.author.equals(res.locals.currUser._id)){
      req.flash("error", "You are not the author of this review");
      return res.redirect(`/listings/${id}`)
     }
     next()
}



