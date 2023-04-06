const express = require('express');
const path = require('path');
const app = express();
const mongoose = require("mongoose");
const { send } = require('process');

mongoose.connect('mongodb://127.0.0.1:27017/bankapp').catch(error => handleError(error));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({

    extended: true
    
    }));

const dataschema = mongoose.Schema({username : {
    type : String,
    require : true
},
balance : {
    type: Number , 
    require:true
},
email : {
    type:String,
    require:true
}
});

const transactionschema = mongoose.Schema({sender : String , receiver : String , amount: Number , time : Date})

const transaction = mongoose.model("transaction",transactionschema);
const data = mongoose.model("data", dataschema);

// seeding data in db
// app.get('/insert', async (req,res)=>{
//     const dataarr = [ "Alex", "Aaron", "Ben", "Carl", "Dan", "David", "Edward", "Fred", "Frank", "George", "Hal", "Hank", "Ike", "John"]
//     for(dataa of dataarr){
//         let databal = Math.floor(Math.random() * 100) + 1;
//         let datae = dataa + '@gmail.com';
//         await data.insertMany({username : dataa, balance : databal , email:datae})
//     }
//     res.send("DONE");
// })

app.get('/' , async (req,res)=>{
    const users = await data.find()
    res.render('home.ejs',{users})
})

app.get('/transfer/:id', async (req,res)=>{
    const id = req.params.id;
    const users = await data.find()
    res.render('transfer.ejs',{users,id})
})

app.get('/customer/:id/sender/:id2', async(req,res)=>{
    const id = req.params.id;
    const id2 = req.params.id2;
    const user = await data.findById(id);
    res.render('customer.ejs',{user,id , id2})
})

app.post('/receiver/:id/sender/:id2',async (req,res)=>{
     const sender = await data.findById(req.params.id2);
     const receiver = await data.findById(req.params.id);
     if(sender.balance < req.body.amount){
        let resp = "You Dont Have Enough Balance"
        res.render("resp.ejs",{resp});
     }else{
        await data.findByIdAndUpdate(sender , {balance : parseInt(sender.balance)  - parseInt(req.body.amount)});
        await data.findByIdAndUpdate(receiver , {balance : parseInt(receiver.balance) + parseInt(req.body.amount)});
        
        await transaction.insertMany({sender : sender.username , receiver : receiver.username , amount : req.body.amount , time : Date.now()})

        let resp = "Transaction Successfull !"
        res.render("resp.ejs",{resp});
    }
})


app.get("/transactions" , async (req,res)=>{
    const transactions = await transaction.find();
    res.render("transactions.ejs",{transactions});
})

app.get("/clear", async (req,res)=>{
    const transactions = await transaction.deleteMany();
    res.redirect('/transactions');
})

app.listen(3000 , ()=>{
    console.log("We are listening on port 3000");
})