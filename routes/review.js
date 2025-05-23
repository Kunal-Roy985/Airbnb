const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync")
const ExpressError = require("../utils/ExpressError");
const {reviewSchema} = require("../schema.js")
const Listing = require("../models/listing");
const Review = require("../models/review.js")
const {isLoggedin,validateReview, isReviewAuthor} = require("../middleware.js")
const reviewController = require("../controller/reviews.js")



//Reviews
//post Route
router.post("/",isLoggedin, wrapAsync(reviewController.createReview))
  
  //Delete Review Route===
  router.delete("/:reviewId" ,isLoggedin,isReviewAuthor, wrapAsync(reviewController.destroyReview))

  module.exports = router