const express    = require("express");
const bodyParser = require("body-parser");
const https      = require("https");
const app        = express();
const mongoose   = require("mongoose");
app.set("view engine", "ejs");
app.use(express.static(__dirname +"/dosyalar"));
app.use(bodyParser.urlencoded({extended : true}));
const Schema = mongoose.Schema;
mongoose.connect("mongodb+srv://emre:1234@cluster0.asuuu.mongodb.net/Cluster0?retryWrites=true&w=majority", {useNewUrlParser: true , useUnifiedTopology : true});
const guzelSozSema = {
  kategori : String,
  icerik : String
};

const GuzelSoz = mongoose.model("GuzelSoz", guzelSozSema);

app.get("/", function(req, res){
  GuzelSoz.find({}, function(err, gelenSozler){ // anasayfaya baglaninca veri tabanindan tum dosyalari bulur.
    res.render("anasayfa", {sozler : gelenSozler}); //anasayfa ejs yi render ederken veri olarak tum sozleri gosterecek.
  });
});
app.route("/api/guzelsoz/:id")
    .get(function(req, res){
      GuzelSoz.findOne({_id : req.params.id} , function(err, gelenVeri){
        res.send(gelenVeri);
      });
    })
    .put(function(req, res){ //dosyayi komple degistirir.
      var kategoriGelen = req.body.kategori;
      var icerikGelen   = req.body.icerik;
      GuzelSoz.update({_id : req.params.id} , {kategori : kategoriGelen, icerik : icerikGelen}, {overwrite: true}, function(err){
        if(!err)
          res.send({sonuc : "Kayıt başarıyla güncellendi."});
        else
          res.send(err);
      });
    })
    .patch(function(req, res){ //belli kismi guncelller tamamen degistirmez.
      GuzelSoz.update({_id : req.params.id} , {$set : req.body}, function(err){
        if(!err)
          res.send({sonuc : "Kayıt başarıyla güncellendi."});
        else
          res.send(err);
      })
    })
    .delete(function(req, res){
      var sifre = req.body.sifre;
      if(sifre == "parola1234"){
        GuzelSoz.deleteOne({_id : req.params.id}, function(err){
          if(!err)
            res.send({sonuc : "Kayıt başarıyla silindi."});
          else
            res.send(err);
        })
      }else{
        res.send({sonuc : "Şifre hatalı."});
      }
    });
app.route("/api/guzelsozler")
    .get(function(req, res){ //guzelSozler safasina get ile baglanirsa butun kayitlari gorur.
      GuzelSoz.find({}, function(err, gelenVeri){
        if(!err)
          res.send(gelenVeri);
        else
           res.send(err);
      });
    })
    .post(function(req, res){ // post ike baglanirsa kayit olusturur.
       var guzelSoz = new GuzelSoz({
         kategori : req.body.kategori,
         icerik : req.body.icerik
       });
       guzelSoz.save(function(err){
          if(!err)
            res.send( {sonuc : "Kayıt başarıyla oluşturuldu."} );
          else
            res.send(err);
       });
    })
    .delete(function(req, res){
      var sifre = req.body.sifre;
      if(sifre == "parola1234"){
        GuzelSoz.deleteMany({}, function(err){
          if(!err)
            res.send( {sonuc : "Tüm kayıtlar başarıyla silindi."} );
          else
            res.send(err);
        });
      }else{
        res.send({sonuc : "Şifre hatalı."});
      }
    });
app.get("/admin", function(req, res){
    // 1. Alternatif
    /*GuzelSoz.find({}, function(err, gelenGuzelSozler){
      res.render("admin", {guzelsozler : gelenGuzelSozler});
    })*/
    var link = "https://guzelsozler.herokuapp.com/api/guzelsozler";
    https.get(link , function(response){
      response.on("data", function(gelenGuzelSozler){
        // gelenGuzelSozler -> byte türünde gelmişti.
        var guzelSozler = JSON.parse(gelenGuzelSozler);
        res.render("admin", { sozler : guzelSozler } );
      })
    });
});
//https://guzelsozler.herokuapp.com/api/guzelsoz/600c683c986f50001534a062
app.post("/kayit-sil", function(req, res){
    var id = req.body._id;
    var link = "https://guzelsozler.herokuapp.com/api/guzelsoz/"+id;
    var secenekler = {
      method : 'DELETE'
    };
    https.get(link, secenekler , function(response){
        response.on("data", function(gelenData){
          var sonuc = JSON.parse(gelenData);
          res.send(sonuc)
        });
    });
});
let port = process.env.PORT;
if(port == "" || port == null){
  port = 5000;
}
app.listen(port, function(){
  console.log("port numarasi : " + port);
});
