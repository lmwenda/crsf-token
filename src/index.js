import express from "express";
import cors from "cors";
import csrf from "csurf";
import bodyParser from "body-parser";
import session from "express-session";
import cookieParser from "cookie-parser";

// Express Application

const app = express();

// Middlewares

app.use(cors())
app.use(cookieParser())
app.use(csrf({ cookie: { httpOnly: true, secure: true } }));
app.use(session({
    secret: 'topsecret', saveUninitialized: true, resave: true, httpOnly: true, secure: true
}))

// error handler
app.use(function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)
  
    // handle CSRF token errors here
    res.status(403)
    res.send('form tampered with')
})

// Definitions

const parseForm = bodyParser.urlencoded({ extended: false })

const User = {
    email: "test@gmail.com",
    pwd: "Testing123"
}

const xsrfProtection = csrf({ cookie: true });

// Routes

app.get('/csrf', parseForm, xsrfProtection, (req, res, next) => {
    res.json({ csrfToken: req.csrfToken() })
})

app.post('/api/login', parseForm, xsrfProtection,(req, res) => {
    const { email, pwd } = req.body;

    if(email !== User.email && pwd !== User.pwd){
        res.json({ type: "Error", msg: "Invalid Credientials" });
    }
    else{
        const token = req.csrfToken();
        // Return XSRF-TOKEN, atkn, and ACT_SSO_COOKIE cookies after successful login

        res.cookie('XSRF-TOKEN', req.csrfToken());
        res.locals.csrfToken = token;

        // Returns Successfull Message
        res.json({ type: "Success", msg: "Successfull Login!" });
    }
})

// Listening

app.listen(5000, () => console.log("Server Running on http://localhost:5000/"))