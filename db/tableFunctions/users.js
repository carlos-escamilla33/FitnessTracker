const util = require("util");
const client = require("../client");
const bcrypt = require('bcrypt');

const createUser = async ({ username, password }) => {

    try {

        const SALT_COUNT = 10;
        const cryptedPass = await bcrypt.hash(password, SALT_COUNT);

        const { rows: [user] } = await client.query(`
            INSERT INTO users(username, password)
            VALUES($1,$2)
            ON CONFLICT (username) DO NOTHING
            RETURNING *;
        `, [username, cryptedPass]);

        delete user.password;

        return user;
    }
    catch (error) {
        throw error;
    }
}

const getUserByUsername = async (username) => {

    try {
        const { rows: [user] } = await client.query(`
        SELECT *
        FROM users
        WHERE username=$1;
    `, [username]);

        return user;
    }
    catch (error) {
        throw error;
    }
}

const getUser = async ({ username, password }) => {
    try {
        const user = await getUserByUsername(username);

        const matches = await bcrypt.compare(password, user.password);

        if (matches) {
            delete user.password;
            return user;
        }
    }
    catch (error) {
        throw error;
    }
}

const getUserById = async (userId) => {
    try {
        const { rows: [user] } = await client.query(`
            SELECT *
            FROM users
            WHERE id=${userId};
        `);

        if (!user) {
            return null
        }

        return user;
    }
    catch (error) {
        throw error
    }
}

module.exports = {
    createUser,
    getUserByUsername,
    getUser,
    getUserById
};