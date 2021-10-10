// create an api router
// attach other routers from files in this api directory (users, activities...)
// export the api router
const express = require("express");
const { getUserById } = require("../db");
const activitiesRouter = require("./activities");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const healthRouter = require("./health");
const routinesRouter = require("./routines");
const usersRouter = require("./users");
const routine_activitiesRouter = require("./routine_activities");
const apiRouter = express.Router();

apiRouter.use(async (req, res, next) => {
    const prefix = "Bearer ";
    const auth = req.header("Authorization");

    try {
        if (!auth) {
            next()
        } else if (auth.startsWith(prefix)) {
            const token = auth.slice(prefix.length);

            try {
                const { id } = jwt.verify(token, JWT_SECRET);

                if (id) {
                    req.user = await getUserById(id);
                    next();
                }
            }
            catch ({ name, message }) {
                next({
                    name: 'AuthorizationHeaderError',
                    message: `Authorization token must start with ${prefix}`
                });
            }
        }
    }
    catch ({ name, message }) {
        next({
            name: 'AuthorizationHeaderError',
            message: `Authorization token must start with ${prefix}`
        });
    }
})

apiRouter.use("/health", healthRouter);

apiRouter.use("/users", usersRouter);

apiRouter.use("/activities", activitiesRouter);

apiRouter.use("/routines", routinesRouter);

apiRouter.use("/routine_activities", routine_activitiesRouter);

module.exports = apiRouter;