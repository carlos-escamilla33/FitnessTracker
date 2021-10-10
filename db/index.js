// require and re-export all files in this db directory (users, activities...)
module.exports = {
    ...require("./tableFunctions/users"),
    ...require("./tableFunctions/activities"),
    ...require("./tableFunctions/routines"),
    ...require("./tableFunctions/routine_activities")
}