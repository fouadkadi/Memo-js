var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname));
app.set('view engine', 'ejs');

const mysql = require('mysql');

// Create connection
const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'etu21964099',
    password : 'etu21964099',
    database : 'etu21964099'
});

// Connect
db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('MySql Connected...');
});



app.get('/', function(req, res) {
    res.render(__dirname + '/routes/Acceil.ejs',{message:"rien",});
  });

//================================== AJOUTER UN NOUVEAU CLIENT ====================
/**
 * 
 * 
 */

app.post('/register',function(req,res){
  
  //** Recherche de l'existance */
  var sql="SELECT * FROM users WHERE  name=?";
  db.query(sql,[req.body.name],function(err,results,fields){
    if(err) throw err;
    if(results.length > 0) // si le pseudo est deja attribué
    { 
      var reponse="le pseudo "+req.body.name+" existe deja";
      res.render(__dirname + '/routes/Acceil.ejs',{message:reponse}) ;
    }
    else
    { 
      //** Enregistrement du nouveau client  */

      var sql2="INSERT INTO users (name, password) VALUES ?";
      var values=[[req.body.name,req.body.password]];
      db.query(sql2,[values],function(err,results,fields){
        if(err) throw err;
        var reponse="vous etes bien inscrit "+req.body.name+" !";
        res.render(__dirname + '/routes/Acceil.ejs',{message:reponse}) ;

      })

    }

  })
  
  
});

//========================= AUTHENTIFICATION DU CLIENT ====================
/**
 * 
 * 
 * 
 */

 app.post('/login',function(req,res)
 {   
     //** Recherche du client */
     var sql="SELECT * FROM users WHERE  name=? AND password=?";
     db.query(sql,[req.body.name,req.body.password],function(err,results,fields){
     if(err) throw err;

      if(results.length == 0)
      {
        res.render(__dirname + '/routes/Acceil.ejs',{message:"votre login ou mot de passe est incorrect",}) ;
      }
      else
      { 
        //** chargment des memos du client */
        var sql2="SELECT * FROM memos WHERE  idowner=?";
        db.query(sql2,[results[0].id],function(err2,results2,fields2){
        if(err2) throw err2;
        res.render(__dirname + '/routes/Memo.ejs',{client:results[0],memos:results2,message:"rien"});

        })
        
      }  
   });     
 });


 //============================ CREE UNE NOUVELLE MEMO =========================
/**
 * 
 */

 var monclient;
 var mesmemos;
 app.post('/newmemo',function(req,res){
  
  //** Insertion d'une nouvelle memo */
   var sql="INSERT INTO memos (idowner,titre,content) VALUES ?";
   var value=[[req.body.idclient,req.body.titre,req.body.contenu]];
   db.query(sql,[value],function(err,results,fields){
    if(err) throw err;


     //**  Recuperation du client */
     sql="SELECT * FROM users WHERE id=?";
     db.query(sql,[req.body.idclient],function(err,results,fields){
     if(err) throw err;
     monclient=results[0];
 

     //**   Recuperation des memos  */
     sql="SELECT * FROM memos WHERE idowner=?";
     db.query(sql,[req.body.idclient],function(err,results,fields){
       if(err) throw err;
       mesmemos=results;

       res.render(__dirname + '/routes/Memo.ejs',{client:monclient,memos:mesmemos,message:"rien"});   

     });

   });
   });
   });



  //============================ SUPPRIMER UN MEMO ==============================
  /**
   * 
   * 
   */


   app.post('/supprimer',function(req,res){

    //** Suppression du memo */
    var sql="DELETE FROM memos WHERE idmemo=?";
    db.query(sql,[req.body.idmemo],function(err,results,fields){
    if(err) throw err;


     //**  Recuperation du client */
     sql="SELECT * FROM users WHERE id=?";
     db.query(sql,[req.body.idclient],function(err,results,fields){
     if(err) throw err;
     monclient=results[0];
 

     //**   Recuperation des memos  */
       sql="SELECT * FROM memos WHERE idowner=?";
       db.query(sql,[req.body.idclient],function(err,results,fields){
       if(err) throw err;
       mesmemos=results;

       res.render(__dirname + '/routes/Memo.ejs',{client:monclient,memos:mesmemos,message:"rien"});   

     });

   });
   });
   });


   //============================ MODIFIER UN MEMO ==============================
  /**
   * 
   * 
   */
   
   app.post('/modifmemo',function(req,res){
     var sql="SELECT * from memos WHERE idmemo=?";
     db.query(sql,[req.body.idmemo],function(err,results,fields){
     if(err) throw err;
      res.render(__dirname + '/routes/Modif.ejs',{memo:results[0]});
    })
   });


    //============================ VALIDER LA MODIFICATION ==============================
  /**
   * 
   * 
   */

  app.post('/validmodif',function(req,res){

    var sql="UPDATE memos SET titre='"+req.body.titre+"',content='"+req.body.content+"' WHERE idmemo='"+req.body.idmemo+"'";
   
    db.query(sql,function(err,results,fields){//---- Mise a jour
    if(err) throw err ;

    sql="SELECT * FROM memos WHERE idowner=?";
    db.query(sql,[req.body.idclient],function(err,memos_r,fields){ //--- Recuperation des memos
    if(err) throw err ;

    sql="SELECT * FROM users WHERE id=?";
    db.query(sql,[req.body.idclient],function(err,client_r,fields){ //------ Recuperation du client
    if(err) throw err ;

    res.render(__dirname + '/routes/Memo.ejs',{client:client_r[0],memos:memos_r,message:"Memo modifié avec succès"});

   });
   });   
   });
   });
   

    //============================ PARTAGER LES MEMOS ==============================
  /**
   * 
   * 
   */

  app.post('/partager',function(req,res){

    var sql="SELECT * FROM users WHERE id!=?";
    db.query(sql,[req.body.idclient],function(err,results,fields){
      if (err) throw err;
      res.render(__dirname + '/routes/Partage.ejs',
      {idmemo:req.body.idmemo,
      idclient:req.body.idclient,
      titre:req.body.titre,
      contenu:req.body.contenu,
      users:results ,
      message:"rien"});

    });
    
  });

   //============================ VALIDER LE PARTAGE ==============================
  /**
   * 
   * 
   */

  app.post('/validpartage',function(req,res){
    var sql="INSERT INTO memos (idowner,titre,content) VALUES ?";
    var value=[[req.body.users,req.body.titre,req.body.content]];
    db.query(sql,[value],function(err,results,fields){
     if(err) throw err ;

     sql="SELECT * FROM users WHERE id!=?";
    db.query(sql,[req.body.idclient],function(err,results,fields){
      if(err) throw err;

      res.render(__dirname + '/routes/Partage.ejs',
      {idmemo:req.body.idmemo,
      idclient:req.body.idclient,
      titre:req.body.titre,
      contenu:req.body.contenu,
      users:results,
      message:"Memo partagé avec succès"});
      }); 

    });
  });

  //========================== RETOUR A LA PAGE PRINCIPAL ==============================
  /**
   * 
   * 
   */


  app.post('/loadmainpage',function(req,res){
    var sql="SELECT * FROM users WHERE id=?";
     db.query(sql,[[req.body.idclient]],function(err,results,fields){
     if(err) throw err ;

     sql="SELECT * FROM memos WHERE idowner=?";
     db.query(sql,[[req.body.idclient]],function(err,results2,fields){
     if(err) throw err ;

     res.render(__dirname + '/routes/Memo.ejs',{client:results[0],memos:results2,message:"rien"});
    
    
    });   
    });
    });


app.listen(8080);