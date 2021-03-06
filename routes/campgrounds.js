var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

//INDEX - show all campgrounds
router.get("/", function(req, res){
	var noMatch = null;
	if(req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		// Get all campgrounds from DB
		Campground.find({name: regex}, function(err, allCampgrounds){
			if(err){
				console.log(err);
			} else {
				if(allCampgrounds < 1){
					noMatch = "No campgrounds match that query, please try again.";
				}
				res.render("campgrounds/index", {campgrounds: allCampgrounds, page: 'campgrounds', currentUser: req.user, noMatch: noMatch});
			}
		});
	} else {
		// Get all campgrounds from DB
		Campground.find({}, function(err, allCampgrounds){
			if(err){
				console.log(err);
			} else {
				res.render("campgrounds/index", {campgrounds: allCampgrounds, page: 'campgrounds', currentUser: req.user, noMatch: noMatch});
			}
		});
	}		
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
	// get data from form and add data to campgrounds array
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	var newCampground = {name: name, price: price, image: image, description: desc, author: author};
	// Create a new campground and save to DB
		Campground.create(newCampground, function(err, newlyCreated){
			if(err){
				console.log(err);
			} else {
				//redirect back to campgrounds page
				console.log(newlyCreated);
				res.redirect("/campgrounds");
			}
		});
});

//NEW - show form to create new campground
router.get("/new",middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");	
});

//SHOW - shows more info about one campground
router.get("/:id", function(req, res){
	//find the campground with provided ID
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err || !foundCampground){
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			console.log(foundCampground);
			//render show template with that campground
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

// EDIT campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		// if(err){
			// flash message
		// }
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});

//UPDATE campground route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	//find and update the correct campground
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			res.redirect("campgrounds");
		} else {
			//redirect somewhere (show page)
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

// DESTROY campground route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/campgrounds");
		} else {
			res.redirect("/campgrounds");
		}
	})
})


function escapeRegex(text){
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\S&");
}

module.exports = router;