const express = require("express");
const usersRouter = express.Router();
const jwt = require("jsonwebtoken");
const { token } = require("morgan");
const { JWT_SECRET } = process.env;

const { getUserByUsername, createUser, getUser, getUserById, getPublicRoutinesByUser } = require("../db");


usersRouter.use((req, res, next) => {
    console.log("A request has been made to /users");

    next();
})

usersRouter.post("/register", async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const _user = await getUserByUsername(username);

        if (_user) {
            throw new Error({
                name: "UserExistsError",
                message: "User already exists"
            })
        }
        if (password.length < 8) {
            throw new Error ({
                name: "PasswordLengthError",
                message: "password length must be at least 8 characters long"
            })
        }

        const user = await createUser({
            username,
            password
        });

        const token = jwt.sign({
            id: user.id,
            username
        }, process.env.JWT_SECRET, {
            expiresIn: "1w"
        });

        res.send({
            message: "You Successfully Registered!",
            user,
            token,
        });
    }
    catch ({ name, message }) {
        next({ name, message })
    }
});

usersRouter.post("/login", async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        next({
            name: "MissingCredentialsError",
            message: "Please supply both a username and password"
        });
    }

    try {
        const user = await getUser({ username, password });

        const token = await jwt.sign(user, process.env.JWT_SECRET);

        if (user) {
            res.send({
                message: "Successful Login",
                token: token
            });
        } else {
            next({
                name: "IncorrectCredentialsError",
                message: "Username or password is incorrect"
            })
        }
    }
    catch ({ name, message }) {
        ({ name, message });
    }
})

usersRouter.get("/me", async (req, res, next) => {
    const prefix = "Bearer ";
    const auth = req.header("Authorization");
    try {
        if (!auth) {
            res.sendStatus(401);
        } else if (auth.startsWith(prefix)) {
            const token = auth.slice(prefix.length)
            const { id } = jwt.verify(token, JWT_SECRET);

            if (id) {
                req.user = await getUserById(id);
                // console.log("----->USER", req.user)
                res.send(req.user);
            }
        }
    }
    catch (error) {
        next(error);
    }
});

usersRouter.get("/:username/routines", async (req, res, next) => {
    const { username } = req.params;

    try {
        const routine = await getPublicRoutinesByUser({ username });

        if (routine) {
            res.send(routine);
        } else {
            next(error);
        }
    }
    catch (error) {
        next(error);
    }
})

module.exports = usersRouter;