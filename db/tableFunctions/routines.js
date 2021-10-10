const { report } = require("process");
const util = require("util");
const client = require("../client");
const { getRoutineActivityById } = require("./routine_activities");

const createRoutine = async ({ creatorId, isPublic, name, goal }) => {
    try {
        const { rows: [routine] } = await client.query(`
            INSERT INTO routines("creatorId", "isPublic", name, goal)
            VALUES($1,$2,$3,$4)
            RETURNING *;
        `, [creatorId, isPublic, name, goal]);

        return routine
    }
    catch (error) {
        throw error
    }
}

const getRoutineById = async (id) => {
    try {
        const { rows: [routine] } = await client.query(`
            SELECT *
            FROM routines
            WHERE id=${id};
        `)

        return routine;
    }
    catch (error) {
        throw error;
    }
}

const getRoutinesWithoutActivities = async () => {

    try {
        const { rows } = await client.query(`
            SELECT *
            FROM routines;
        `)
        return rows;
    }
    catch (error) {
        throw error;
    }
}

const addActivities = async (routines) => {

    const { rows: routine_activities } = await client.query(`
        SELECT * 
        FROM routine_activities;
    `)

    routines.map(routine => {
        routine.activities = [];

        routine_activities.map(activity => {
            let workoutData = {
                id: activity.id,
                count: activity.count,
                duration: activity.duration
            }
            if (activity.routineId === routine.id) {
                routine.activities.push(workoutData);
            }
        });
    });
    return routines;
}

const getAllRoutines = async () => {
    try {
        const { rows: routines } = await client.query(`
            SELECT routines.*, users.username AS "creatorName"
            FROM routines 
            INNER JOIN users
            ON routines."creatorId"=users.id;
        `);

        const completeRoutines = await addActivities(routines);

        //    console.log(util.inspect(completeRoutines, false, 5, true));

        return completeRoutines;

    }
    catch (error) {
        throw error;
    }
}

const getAllPublicRoutines = async () => {
    try {
        const { rows: routines } = await client.query(`
            SELECT routines.*, users.username AS "creatorName"
            FROM routines 
            INNER JOIN users
            ON routines."creatorId"=users.id
            WHERE routines."isPublic"=true;
        `)

        const completeRoutines = await addActivities(routines);

        //    console.log(util.inspect(completeRoutines, false, 5, true));

        return completeRoutines;
    }
    catch (error) {
        throw error
    }
}

const getAllRoutinesByUser = async ({ username }) => {

    try {
        const { rows: routines } = await client.query(`
        SELECT routines.*, users.username AS "creatorName"
        FROM routines 
        INNER JOIN users
        ON routines."creatorId"=users.id
        WHERE users.username=$1;
        `, [username]);

        const completeRoutines = await addActivities(routines);

        //    console.log(util.inspect(completeRoutines, false, 5, true));

        return completeRoutines;

    }
    catch (error) {
        throw error;
    }
}

const getPublicRoutinesByUser = async ({ username }) => {

    try {
        const { rows: routines } = await client.query(`
            SELECT routines.*, users.username AS "creatorName"
            FROM routines 
            INNER JOIN users
            ON routines."creatorId"=users.id
            WHERE routines."isPublic"=true
            AND users.username=$1;
        `, [username]);

        const completeRoutines = await addActivities(routines);

        //    console.log(util.inspect(completeRoutines, false, 5, true));

        return completeRoutines;
    }
    catch (error) {
        throw error
    }
}

const getPublicRoutinesByActivity = async ({ id }) => {

    // console.log("----->", id);

    try {
        const { rows: routines } = await client.query(`
            SELECT routines.*, users.username AS "creatorName"
            FROM routines 
            INNER JOIN users
            ON routines."creatorId"=users.id
            WHERE routines."isPublic"=true
        `);

        const { rows: routine_activities } = await client.query(`
        SELECT * 
        FROM routine_activities;
    `)

        routines.map(routine => {
            routine.activities = [];

            routine_activities.map(activity => {
                let workoutData = {
                    id: activity.id,
                    activityId: activity.activityId,
                    count: activity.count,
                    duration: activity.duration
                }
                if (activity.routineId === routine.id) {
                    if (activity.activityId === id);
                    routine.activities.push(workoutData);
                }
            });
        });

        // console.log(util.inspect(routines, false, 5, true));

        return routines;
    }
    catch (error) {
        throw error;
    }
}

const updateRoutine = async ({ id, isPublic, name, goal }) => {

    try {

        const routine = await getRoutineById(id);

        if (!isPublic) {
            isPublic = routine.isPublic;
        }

        if (!name) {
            name = routine.name;
        }

        if (!goal) {
            goal = routine.goal;
        }

        const { rows: [routines] } = await client.query(`
        UPDATE routines
        SET "isPublic"=$1, name=$2, goal=$3
        WHERE id=${id}
        RETURNING *;
    `, [isPublic, name, goal])

        // console.log(routines);

        return routines;

    }
    catch (error) {
        throw error;
    }
}

const destroyRoutine = async (id) => {
    try {

        const { rows: [routine] } = await client.query(`
            DELETE FROM routines
            WHERE id=$1
            RETURNING *;
        `, [id]);

        await client.query(`
            DELETE FROM routine_activities
            WHERE "routineId"=$1
            RETURNING *;
        `, [id]);

        return routine;
    }
    catch (error) {
        throw error;
    };
};



module.exports = {
    createRoutine,
    getRoutinesWithoutActivities,
    getRoutineById,
    updateRoutine,
    getAllRoutines,
    getAllPublicRoutines,
    getAllRoutinesByUser,
    getPublicRoutinesByUser,
    getPublicRoutinesByActivity,
    destroyRoutine
}