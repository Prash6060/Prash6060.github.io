// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MGVkYzNmMjgwNDg0MTE4ZDQxNzI4Y2QiLCJpYXQiOjE2MjYxOTUwODh9.r9X3hk98KkrY8CjjVAMgpOa9o_RDYZdbcDmxhha1ocU"
const express = require('express');

//mongoose schemas
const User = require("../models/user");
const Admin = require("../models/admin");
const Vote = require("../models/vote");
const Elec = require("../models/elec");

const P2pServer = require('./p2p-server');

const Election = require('../blockchain');
const ejs = require("ejs");

//jwt tokeniser for authorization
const tokeniser = require('../middleware/tokeniser')
    //admin
const usertokeniser = require('../middleware/usertokeniser')
    //users


//this will get index.js file by default inside blockchain folder
const bodyParser = require('body-parser')
const HTTP_PORT = process.env.HTTP_PORT || 3001;
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
    //process.env. is if we want to run multiple instances of same application on our machine
    //proccess environment variable , if user specifies somthing on command line ,the port other than 3001
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(express.json());


const mongoose = require('mongoose');


// MongoDB Atlas connection string
const connectionString = 'mongodb+srv://prashil0:prashil0@cluster0.1vtka8n.mongodb.net/?retryWrites=true&w=majority';

// Connect to MongoDB Atlas
mongoose.connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Connected to MongoDB Atlas');
        // Your code logic here
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB Atlas:', error);
    });


//mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connection.on('connected', () => {
    console.log("connected to mongodb")
})
mongoose.connection.on('error', (err) => {
    console.log("err connecting", err)
})

app.set('view engine', 'ejs'); //embedded JS dynamic rendering


const election = new Election();
const election_type = election.electionType; //election type
const candidates = election.candidates;
const images = election.images;
//console.log(election.start);
//candidates = election.candidates;     //getting our candidate list
const p2pServer = new P2pServer(election.start);

//tokeniser,
//get request to get current blocks which are already stored..endpoint of the api is blocks //tojkeniser for admin
// app.get('/blocks',(req,res)=>{
//   res.json(election.start.chain);
//
// });


app.get("/adminpanel", (req, res) => {
    res.render("adminpanel");
});


//for non admin //for users to vote
app.get('/vote', (req, res) => {
    Elec.findOne({ name: "election1" })
        .then((savedElec) => {
            if (savedElec.status === false) {
                res.render("electionnotgoingon");
            } else {
                res.render("vote", { kindOfElection: election_type[0], candidate: candidates, image: images });
            }
        });
    // if(election.flag == 0){
    //   res.render("vote",{kindOfElection : election_type[0] , candidate:candidates, image : images }); //vote only if election is going on
    // }
    // else{
    //   res.render("electionnotgoingon");
    // }
    //election.setVote();   //casts a vote
});

app.post('/getresult', (req, res) => {
    let winners = election.getResult();
    console.log(winners);
    Elec.findOne({ name: "election1" })
        .then((savedElec) => {
            if (savedElec.status === false) {
                res.render("electionwinner", { winnerlist: winners }); //if election is stopped.
            } else {
                res.render("resultnotavailable");
            }
        });

});

app.get("/votingblocks", function(req, res) {
    const votingblocks = election.start.chain;
    res.render("votingblocks", { votingblocks: votingblocks });
});

app.post("/votepost", function(req, res) {
    vote_option = req.body.button;
    var blockdata = election.setVote(vote_option);
    //solution to problem of creating new chain and candidate vote to zero at that peer and changing our count proccess
    //create a global struct over here and pass incremented count ,updated block directly to mine function.
    console.log("block" + blockdata);
    let blocked = JSON.parse(blockdata);
    // console.log(typeof(blocked));
    // console.log(blocked);
    // console.log(typeof(blocked.timestamp));
    const vote = new Vote({
        timestamp: blocked.timestamp,
        lastHash: blocked.lastHash,
        hash: blocked.hash,
        data: blocked.data,
        nonce: blocked.nonce
    })
    vote.save()
        .then(vote => {
            //res.json({message:"saved successfully"})
            p2pServer.syncChains();
            res.render('voteSuccess');

            //res.redirect('/');
        })
        .catch(err => {
            console.log(err)
        })
    p2pServer.syncChains();
    //res.render('voteSuccess');
});

//for login-signup page
app.get('/', function(req, res) {

    res.render('login');
});


app.post('/signup', (req, res) => {
    // console.log(req.body);
    const { name, email, password, voterID } = req.body
    if (!email || !password || !name) {
        return res.status(422).json({ error: "please add all the fields" })
    }
    User.findOne({ email: email })
        .then((savedUser) => {
            if (savedUser) {
                return res.status(422).json({ error: "user already exists with that email" })
            }
            hasVoted = false;
            bcrypt.hash(password, 12)
                .then(hashedpassword => {
                    const user = new User({
                        email,
                        password: hashedpassword,
                        name,
                        voterID,
                        hasVoted
                    })

                    user.save()
                        .then(user => {
                            //res.json({message:"saved successfully"})
                            res.render('signedUp');
                            //res.redirect('/');
                        })
                        .catch(err => {
                            console.log(err)
                        })
                })

        })
        .catch(err => {
            console.log(err)
        })
})


app.get("/adminlogin", (req, res) => {
    res.render("adminlogin");
});


app.post('/adminlogin', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).json({ error: "please add email or password" })
    }

    Admin.findOne({ email: email })
        .then(savedUser => {
            if (!savedUser) {
                return res.status(422).json({ error: "Invalid Email or password" })
            }
            // console.log(savedUser);
            bcrypt.compare(password, savedUser.password)
                .then(doMatch => {
                    if (doMatch) {
                        const token = jwt.sign({ _id: savedUser._id }, "adminsecretkey")
                            // console.log(token)
                        const { _id, name, email, voterID } = savedUser
                        //res.json({token,user:{_id,name,email,voterID}})
                        res.render('adminPanel');
                    } else {
                        return res.status(422).json({ error: "Invalid mail or password" })
                    }
                })
                .catch(err => {
                    console.log(err)
                })
        })

});


app.post('/signin', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).json({ error: "please add email or password" })
    }

    //for users
    User.findOne({ email: email })
        .then(savedUser => {
            if (!savedUser) {
                return res.status(422).json({ error: "Invalid Email or password" })
            }

            //  already voted then dont allow.
            if (savedUser.hasVoted === true) {
                // return res.status(422).json({error:"You have already voted."})
                return res.render('alreadyVoted');
            }
            // console.log(savedUser);
            bcrypt.compare(password, savedUser.password)
                .then(doMatch => {
                    if (doMatch) {
                        const token = jwt.sign({ _id: savedUser._id }, "usersecretkey")
                            // console.log(token)
                        savedUser.hasVoted = true;
                        savedUser.save();
                        const { _id, name, email, voterID } = savedUser;
                        res.redirect('/vote');
                    } else {
                        return res.status(422).json({ error: "Invalid Email or password" })
                    }
                })
                .catch(err => {
                    console.log(err)
                })
        })
});
app.post('/stopelection', (req, res) => {
    var electionname = "election1";
    Elec.findOne({ name: electionname })
        .then((savedUser) => {
            if (savedUser) {
                savedUser.status = false;
                savedUser.save();
                res.render("electionstopped");
            } else {
                res.render('electionnotgoingon');
            }

            election.stopElection();
            // res.render("electionnotgoingon");
        });
});

app.post('/startelection', (req, res) => {
    var electionname = "election1";
    Elec.findOne({ name: electionname })
        .then((savedElec) => {
            if (savedElec) {
                savedElec.status = true;
                savedElec.save();
                res.render("electionstarted");
            } else {
                status = true;
                const elec = new Elec({
                    name: electionname,
                    status: true
                })
                elec.save()
                    .then(elec => {
                        //res.json({message:"saved successfully"})
                        res.render('electionstarted');
                        //res.redirect('/');
                    })
                    .catch(err => {
                        console.log(err)
                    })

            }

        });
});
// app.post('/mine',(req,res) =>{
//   const block = election.start.addBlock(req.body.data ,0);
//   console.log(`New block added : ${block.toString()}`);
//
//   //we want to sync chains with every new block added
//   p2pServer.syncChains();
//   res.redirect('/blocks');
// });


app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));
p2pServer.listen(); //this will fireup a instance ...this will start websocket server in this blockchain app instance