const Listing = require("../models/listing")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });



module.exports.index = async (req, res, next) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }

module.exports.renderNewForm =  (req, res) => {
  res.render("listings/new.ejs");
}

module.exports.showListings=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({path : "reviews", populate:{path: "author"}}).populate("owner");
    if(!listing){
      req.flash("error", "Listing you are requested for does not exist!");
      res.redirect("/listings")
    }
    
    res.render("listings/show.ejs", { listing });
  }

  module.exports.createListings =async (req, res, next) => {
      // let{ title , description , image , price , country , location} = req.body;
      let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
        .send()

      let url =req.file.path;
      let filename = req.file.filename;
      const newListing = new Listing(req.body.listing);
      newListing.owner= req.user._id;
      newListing.image={url, filename}
      newListing.geometry = response.body.features[0].geometry;
      let savedListing = await newListing.save();
      console.log(savedListing);
      req.flash("success", "New listing Created!");
      res.redirect("/listings");
    }

  module.exports.renderEditForm=async (req, res) => {
      let { id } = req.params;
      const listing = await Listing.findById(id);
      if(!listing){
        req.flash("error", "Listing you are requested for does not exist!");
        res.redirect("/listings")
      }  
      let originalImage = listing.image.url;
      originalImage = originalImage.replace("/upload","/upload/h_50,w_50")
      res.render("listings/edit.ejs", { listing , originalImage });
    }

  module.exports.updateListings =async (req, res) => {
      if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing");
      }
      let { id } = req.params;
       
      let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing})

     if(typeof req.file !== "undefined"){//with the help of this we can update a new file while editting
      let url =req.file.path;
      let filename = req.file.filename;
      listing.image = {url, filename};
      await listing.save();
     }
      
      req.flash("success", "Listing Updated");
  
      res.redirect(`/listings/${id}`);
    } 

  module.exports.destroyListings =async (req, res) => {
    let { id } = req.params;
     await Listing.findByIdAndDelete(id);
    
    req.flash("success", "Listing deleted successfully");
    res.redirect("/listings");
    console.log("deleted suceefully");
  }