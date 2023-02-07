const mongoose = require("mongoose");
const router = require("express").Router();

const {
  isLoggedIn,
  isLoggedOut,
  isAdmin,
} = require("../middleware/route-guard.js");
const User = require("../models/User.model");
const Pets = require("../models/Pet.model");
const fileUploader = require("../config/cloudinary.config");

//Dotation Form:
router.get("/donationform", (req, res) => {
  res.render("donationForm");
});

//Contact Form:
router.get("/contactform", (req, res) => {
  res.render("contactForm");
});

//contact confirmation form!
router.get("/contactFormConfirmation", (req, res) => {
  res.render("contactFormConfirmation");
});

//mySpace route:
router.get("/mySpace", (req, res) => {
  res.render("mySpace");
});

// Adopt : animalSearch page with search filters and serch button
router.get("/search/animalsfilters", (req, res) => {
  Pets.find()
    .populate("user_id")
    .then((result) => {
      console.log(result);
      res.render("search/animalsFilters", result);
    })
    .catch((error) => {
      console.log("There is an error!", error);
    });
});

//display All Animals
router.get("/pets/animalAll", (req, res) => {
  Pets.find()
    .populate("user_id")
    .then((result) => {
      res.render("pets/animalAll", { result });
    })
    .catch((error) => {
      console.log("there is an error", error);
    });
});

/* //redirect from animal profile page to the list of animals
router.get("/pets/animalall", (req, res) => {
  res.render("pets/animalall");
}); */

//router to add an animal to the favourited list
router.get("/pets/:petsId/likeButton", isLoggedIn, (req, res) => {
  let likedPet = req.params.petsId;
  const { favouriteAnimal } = req.body;
  User.findByIdAndUpdate(req.session.currentUser._id, {
    $addToSet: { favouriteAnimal: likedPet },
  })
    .then(() => {
      res.redirect("/pets/animalAll");
      console.log("TESTEST==>", likedPet);
    })
    .catch((error) => {
      console.log("there is an error ===>", error);
    });
});

//favourited animals page
router.get("/pets/favouritedAnimals", isLoggedIn, (req, res) => {
  //req.session.currentUser <== saved
  let currentUser = req.session.currentUser;

  User.findById(currentUser._id)
    .populate("favouriteAnimal")
    .then((result) => {
      console.log("trying to pass the favouriteAnimal", result);
      res.render("pets/favouritedAnimals", result);
    })
    .catch((error) => {
      console.log("error", error);
    });
});

//router for the CREATE one animal GET =>
// router.get("/pets/animalCreate", isAdmin, (req, res) => {
//   Pets.find()
//     .then((result) => {
//       res.render("pets/animalCreate", {result});
//       console.log("THIS IS THE GET ROUTE TO ADD AN ANIMAL==>",{result})
//     })
// })

router.get("/pets/animalCreate", isAdmin, (req, res) => {
  res.render("pets/animalCreate");
});

//post route for creating an animal
router.post(
  "/pets/animalCreate",
  fileUploader.single("animalImage"),
  (req, res) => {
    const {
      animalAge,
      animalGender,
      animalName,
      animalType,
      animalSize,
      animalImage,
      user_id,
    } = req.body;

    Pets.create({
      user_id: user_id,
      animalAge: animalAge,
      animalGender: animalGender,
      animalName: animalName,
      animalType: animalType,
      animalSize: animalSize,
      animalImage: req.file.path,
    })
      .then(() => {
        res.redirect("/pets/animalAll");
        console.log(req.file);
        console.log("THIS IS TRAVELING IN THE REQ.BODY", req.body);
      })
      .catch((error) => {
        console.log(`Error while creating a new animal profile: ${error}`);
      });
  }
);

//Animal profile one profile ===> this is the route for searching for one animal.
//The result of the search should be posted on the following page: "/pets/animalProfileResult.hbs"
router.get("/pets/:petsId", (req, res) => {
  console.log(req.params);
  Pets.findById(req.params.petsId)
    .then((result) => {
      console.log(result);
      res.render("pets/animalProfile", { result });
    })
    .catch((error) => {
      console.log("There is an error", error);
    });
});

//router for the DELETE one animal button =>
router.post("/pets/:petsId/delete", isLoggedIn, isAdmin, (req, res) => {
  const { petsId } = req.params;

  Pets.findByIdAndDelete(petsId)
    .then(() => res.redirect("/pets/animalAll"))
    .catch((error) => {
      console.log("There is an error deleting a pet ==>", error);
    });
});

// GET route to display the form to update a specific animal
router.get("/pets/:petsId/edit", (req, res, next) => {
  // const { petsId } = req.params;

  Pets.findById(req.params.petsId)
    .then((result) => {
      // console.log(petsToEdit);
      res.render("pets/animalEdit", result);
    })
    .catch((error) => next(error));
});

// POST route to actually make updates on a specific animal profile
router.post(
  "/pets/:petsId/edit",
  fileUploader.single("animalImage"),
  (req, res) => {
    // const { petsId } = req.params;
    const {
      animalName,
      animalType,
      animalGender,
      animalAge,
      animalSize,
      animalImage,
      user_id,
    } = req.body;

    let animalImageNew;
    if (req.file) {
      animalImageNew = req.file.path;
    } else {
      animalImageNew = animalImage;
    }

    Pets.findByIdAndUpdate(
      req.params.petsId,
      {
        user_id: user_id,
        animalName: animalName,
        animalType: animalType,
        animalGender: animalGender,
        animalAge: animalAge,
        animalSize: animalSize,
        animalImage: animalImageNew,
      },
      { new: true }
    )

      .then(() => {
        console.log("THE PET IS EDITED");
        // res.render('pets/animalEdit',result)
        res.redirect("/pets/animalall");
      })

      .catch((error) => {
        console.log("There is an errorr", error);
      });
  }
);

//animal profile page
router.get("/pets/animalprofile/:id", (req, res) => {
  Pets.findById(req.params.id)
    .then((result) => {
      res.render("pets/animalProfile", result);
    })
    .catch((error) => {
      console.log("error", error);
    });
});
module.exports = router;
