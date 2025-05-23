const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing");
const { isLoggedin, isOwner } = require("../middleware.js");


const listingController = require("../controller/listings.js");
const multer  = require("multer")
const {storage} = require("../cloudConfig.js")
const upload = multer({storage})



const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    // let errMsg = error.details[0].message
    let errMsg = error.details.map((el) => el.message).join(",");
    console.log(errMsg);

    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};


router
  .route("/")
  .get(isLoggedin ,wrapAsync(listingController.index))
  .post(isLoggedin,upload.single('listing[image]'), wrapAsync(listingController.createListings));

//new route
router.get("/new", isLoggedin, listingController.renderNewForm);

  
router
  .route("/:id")
  .get( isLoggedin,wrapAsync(listingController.showListings))
  .put(isLoggedin, isOwner,upload.single('listing[image]'), wrapAsync(listingController.updateListings))
  .delete(isLoggedin, isOwner, wrapAsync(listingController.destroyListings));
//New Route----------------->


//Edit Route-------------------->
router.get(
  "/:id/edit",
  isLoggedin,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
