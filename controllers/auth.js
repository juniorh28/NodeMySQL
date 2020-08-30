const mysql = require("mysql");
const jwt = require("jsonwebtoken"); //creates cookies so user can pick up where they left off
const bcryptjs = require("bcryptjs"); //encrypts the passwords
const passport = require("passport-local");

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
});

exports.login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;
        /*
        passport.authenticate("local", {
                failureRedirect: "/login"
            }),
            function (req, res) {
                res.redirect("/dashboard");
            };

        */
        //if the password or email is blank
        if (!email || !password) {
            return res.status(400).render("login", {
                message: "Please provide email/password",
            });
        }

        db.query(
            "SELECT * FROM users WHERE Email = ?",
            [email],
            async (error, results) => {
                console.log(results);
                //if there are no users with that email or if the password user enter doesn't matches the hashpassword in our database
                if (
                    !results ||
                    !(await bcryptjs.compare(password, results[0].Password))
                ) {
                    return res.status(401).render("login", {
                        message: "Email or Password is incorrect",
                    });
                } else {
                    const id = results[0].id;
                    //because our key and value have same name ({id:id}) we can shorten it to ({id})
                    const token = jwt.sign({
                            id, //creates a token for the user,
                        },
                        process.env.JWT_SECRET, {
                            //uses the password you set for the token
                            expiresIn: process.env.JWT_EXPIRES_IN, //set a time limit on the token
                        }
                    );
                    console.log("the token is " + token);
                    const cookieOption = {
                        //creats a cookie for the user
                        expires: new Date(
                            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000 //set a time limit on the token
                        ),
                        httpOnly: true,
                    };
                    res.cookie("jwt", token, cookieOption);
                    res.status(200).redirect("/dashboard");
                }
            }
        );
    } catch (error) {
        console.log(error);
    }
};

exports.register = (req, res) => {
    console.log(req.body);
    /*this is the long way of doing it
            const name = req.body.name
            const email = req.body.email
            const password = req.body.password
            const passwordConfirm = req.body.passwordConfirm
        */
    //this is the short way of doing it
    const {
        firstName,
        lastName,
        userName,
        email,
        password,
        passwordConfirm,
    } = req.body;
    //checks to see if the email is in use
    db.query(
        "SELECT * FROM users WHERE Email = ?",
        [email],
        async (error, results) => {
            console.log(results);
            if (error) {
                console.log(error);
            }
            //if the database found the result(email) it will return how many

            if (results.length > 0) {
                return res.render("register", {
                    message: "That email is already in use",
                });
                //if not, it'll check if the password matches
            } else if (password !== passwordConfirm) {
                return res.render("register", {
                    message: "The passwords do not match",
                });
            }
            //checks for duplicate userName in the database with user data inputted
            db.query(
                "SELECT UserName FROM users WHERE UserName = ?",
                [userName],
                async (err, result) => {
                    if (result.length > 0) {
                        //existing user, redirect to another page
                        return res.render("register", {
                            message: "This username is taken",
                        });
                    }
                }
            );
            //if they do, it will encrypt the password and assign it to hashedPassword
            let hashedPassword = await bcryptjs.hash(password, 8);
            console.log(hashedPassword);

            //it will insert all the data into the databse now
            db.query(
                "INSERT INTO users SET ?", {
                    FirstName: firstName,
                    LastName: lastName,
                    UserName: userName,
                    Email: email,
                    Password: hashedPassword,
                },
                (error, results) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(results);
                        return res.render("register", {
                            success: "User Registered",
                        });
                    }
                }
            );
        }
    );
};