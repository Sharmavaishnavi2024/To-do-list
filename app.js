//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {useNewURLParser:true});
const itemsSchema= new mongoose.Schema ({
  name: String,
});
const Item= mongoose.model("Item", itemsSchema);
const item1= new Item ({
  name: "Welcome to todolist!",
});
const item2= new Item ({
  name: "Add new items",
});
const item3= new Item ({
  name: "If there is any mistake please ensure to delete",

});
const defaultItems= [item1, item2, item3];
const listSchema= {
  name: String,
  items: [itemsSchema],
};
const List= mongoose.model("List", listSchema);

 


app.get("/", function(req, res) {
Item.find({}, function(err, foundItems){
  if(foundItems.length===0){
    Item.insertMany(defaultItems, function(err){
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully updated");
      }
    });
     res.redirect("/");
  } else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});

  }
});

  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;
   const item= new Item ({
    name: itemName,
   });
   if(listName==="Today"){
    item.save();
   res.redirect("/");
   }
   else {
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    
    });

   }
  
});
app.post("/delete", function(req,res){
  const deletedId= req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove(deletedId, function(err){
      if(!err) {
        console.log("Successfully deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull:{items:{_id:deletedId}}}, function(err, foundList){
      if(!err) {
        res.redirect("/" + listName);
      }
    });
  }
  
  
});

app.get("/:customListName", function(req, res){
  const customListName= _.capitalize(req.params.customListName);

  List.findOne({name:customListName}, function(err, foundList){
    if(!err) {
      if (!foundList) {
        const list= new List ({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
        

      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
