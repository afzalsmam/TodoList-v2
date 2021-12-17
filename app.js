//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String
});

//Create Mongoose model and collection when item is the name of the collection in this case.
const Item = mongoose.model("item", itemsSchema);

//Create mongoose documents
const item1 = new Item({
  name: "Work out for 40 minutes"
});

const item2 = new Item({
  name: "shower"
});

const defaultItem = [item1 ,item2];

const routeListSchema = new mongoose.Schema({
      name: String,
      items: [itemsSchema]
})

const List = mongoose.model("routeList", routeListSchema);


app.get("/", function(req, res) {

const day = date.getDate();
//Here foundItems is just used to pass results to callback and then used in the res.render part for EJS.
Item.find({}, function(err, foundItems){
  if(foundItems.length === 0){

    Item.insertMany(defaultItem, function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Succesfully created the default items!");
      }

    });
    res.redirect("/");
  }
  else{
    res.render("list", {listTitle: day, newListItems: foundItems});
  }
});



});

app.post("/", function(req, res){
  const day = date.getDate();
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const addItem = new Item({
    name: itemName
  });

  if(listName === day){
    addItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(addItem);
      foundList.save();
      res.redirect("/" +listName);
    });
  }

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});


app.post("/strikeRemove", function(req, res){
    const checkedItemId = req.body.checkbox;   //This logs the name and the id both because the id is in the value of the checkbox.
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("Succesfully removed checked item");
    }
  });
  res.redirect("/");
});


app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;


  List.findOne({name: customListName}, function(err, results){
    if(!results){
      //create the list
      const list = new List({
        name: customListName,
        items: defaultItem
      });
      list.save();
      res.redirect("/"+customListName);
    }
    else{
      //show the list
      res.render("list", {listTitle: results.name, newListItems: results.items})
    }
  });


});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
