const util = require("util");
const client = require("../client");

const addActivityToRoutine = async ({ routineId, activityId, count, duration }) => {
    try {
        const { rows: [routine_activitiy] } = await client.query(`
            INSERT INTO routine_activities("routineId", "activityId", count, duration)
            VALUES($1,$2,$3,$4)
            RETURNING *;
        `, [routineId, activityId, count, duration])

        return routine_activitiy;
    }
    catch (error) {
        throw error
    }
}

const getRoutineActivitiesByRoutine = async ({ id }) => {

    try {
        const { rows: routines } = await client.query(`
            SELECT *
            FROM routine_activities
            WHERE "routineId" = ${id};
        `);

        return routines;
    }
    catch (error) {
        throw error;
    }
}

const updateRoutineActivity = async ({ id, count, duration }) => {

    try {
        const { rows: [activity] } = await client.query(`
            UPDATE routine_activities
            SET count=$1, duration=$2
            WHERE id=${id}
            RETURNING *;
        `, [count, duration]);

        return activity;
    }
    catch (error) {
        throw error;
    }
}

const getRoutineActivityById = async (id) => {
    try {
        const {rows: [routine]} = await client.query(`
            SELECT *
            FROM routine_activities
            WHERE id=${id};
        `)
        return routine;
    }
    catch (error) {
        throw error;
    }
}

const destroyRoutineActivity = async (id) => {
    try {
        const { rows: [routine] } = await client.query(`
        DELETE
        FROM routine_activities
        WHERE id=$1
        RETURNING *;
    `, [id]);
        return routine;
    }
    catch (error) {
        throw error;
    }
}

module.exports = {
    addActivityToRoutine,
    updateRoutineActivity,
    getRoutineActivitiesByRoutine,
    destroyRoutineActivity,
    getRoutineActivityById
}