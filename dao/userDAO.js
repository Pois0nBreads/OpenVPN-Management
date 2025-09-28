/**
 * package dao/userDAO.js
 * Struct User {
 *      int uid,                    //用户id
 *      varchar(255) username,      //用户名
 *      varchar(255) password,      //密码
 *      varchar(255) nickname,      //昵称
 *      varchar(255) roles,         //拥有角色
 *      int(255) last_login,        //最后登陆时间
 * }
 * 
 */
const mysql = require('mysql');
const crypto = require('crypto');

const USER_TABLE_NAME = "user";

function sha256Hash(str) {
    const hash = crypto.createHash('sha256');
    hash.update(str);
    return hash.digest('hex');
}

class UserDAO {
    constructor(options) {
        this.pool = mysql.createPool({
            host: options.host,
            port: options.port,
            user: options.user,
            password: options.password,
            database: options.database,
            connectionLimit: 10,
            acquireTimeout: 10000
        });
    }

    /**
     * 获取全部用户
     * @param {Function} callback 
     */
    getAllUsers(callback) {
        let pool = this.pool;
        let sql = `SELECT * FROM ${USER_TABLE_NAME}`;
        pool.query(sql, (err, data) => {
            if (err)
                return callback(err, null);
            for (let i=0;i < data.length;i++)
                data[i].roles = data[i].roles.split(',').filter(Boolean);
            callback(null, data);
        });
    }

    /**
     * 根据用户名获取信息
     * @param {string} name 
     * @param {Function} callback 
     */
    getUserByName(name, callback) {
        let pool = this.pool;
        let sql = `SELECT * FROM ${USER_TABLE_NAME} WHERE username = ?`;
        pool.query(sql, [name], (err, result) => {
            if (err)
                return callback(err, null);
            let data = result[0];
            if (!data)
                return callback(null, null);
            data.roles = data.roles.split(',').filter(Boolean);
            callback(null, data);
        });
    }

    /**
     *  验证用户登录, 如果成功 记录登录时间 
     * @param {string} user 用户名
     * @param {string} pass 密码
     * @param {function} callback 回调(Error, Result {-1:Error, 0:Ok, 1:Fail})
     */
    authLogin(user, pass, callback) {
        let pool = this.pool;
        this.getUserByName(user, (err, result) => {
            if (err) 
                return callback(err, -1);
            if (!result) {
                return callback(null, 1);
            }
            const passSha256 = result.password;
            if (passSha256 !== sha256Hash(pass))
                return callback(null, 1);
            let sql = `UPDATE ${USER_TABLE_NAME} SET last_login = ? WHERE username = ?`;
            pool.query(sql, [new Date().getTime(), user], (err, ig) => {if (err) console.error(err)});
            return callback(null, 0);
        });
    }

    /**
     *  创建用户
    * @param {string} user 用户名
    * @param {string} pass 密码
    * @param {function} callback 
    */
    addUser(name, pass, callback) {
        let pool = this.pool;
        this.getUserByName(name, (er, res) => {
            if (er) {
                callback(er);
                return;
            }
            if (res) {
                callback(new Error("Failed to add user. User already exists!"));
                return;
            }
            const sql = `INSERT INTO ${USER_TABLE_NAME} (username, password) VALUES (?, ?)`;
            pool.query(sql, [name, sha256Hash(pass)], (err, result) => {
                callback(err, result);
            });
        });
    }

    //根据用户名删除
    delUserByName(name, callback) {
        let pool = this.pool;
        this.getUserByName(name, (er, res) => {
            if (er) {
                callback(er);
                return;
            }
            if (!res) {
                callback(new Error("Failed to delete user. User does not exist!"));
                return;
            }
            let sql = `DELETE FROM ${USER_TABLE_NAME} WHERE username = ?`;
            pool.query(sql, [name], (err, result) => {
                callback(err, result);
            });
        });
    }

    //根据用户名修改密码
    changePassByName(name, newpass, callback) {
        let pool = this.pool;
        this.getUserByName(name, (er, res) => {
            if (er) {
                callback(er);
                return;
            }
            if (!res) {
                callback(new Error("Failed to modify user. User does not exist!"));
                return;
            }
            let sql = `UPDATE ${USER_TABLE_NAME} SET password = ? WHERE username = ?`;
            pool.query(sql, [sha256Hash(newpass), name], (err, result) => {
                callback(err, result);
            });
        });
    }

    //根据用户名修改昵称
    changeNicknameByName(name, nickname, callback) {
        let pool = this.pool;
        this.getUserByName(name, (er, res) => {
            if (er) {
                callback(er);
                return;
            }
            if (!res) {
                callback(new Error("Failed to modify user. User does not exist!"));
                return;
            }
            let sql = `UPDATE ${USER_TABLE_NAME} SET nickname = ? WHERE username = ?`;
            pool.query(sql, [nickname, name], (err, result) => {
                callback(err, result);
            });
        });
    }

    //根据用户名修改所拥有角色组
    changeRolesByName(name, roles, callback) {
        let pool = this.pool;
        this.getUserByName(name, (er, res) => {
            if (er) {
                callback(er);
                return;
            }
            if (!res) {
                callback(new Error("Failed to modify user. User does not exist!"));
                return;
            }
            let rolestr = '';
            for (let role of roles)
                rolestr += role + ',';
            let sql = `UPDATE ${USER_TABLE_NAME} SET roles = ? WHERE username = ?`;
            pool.query(sql, [rolestr, name], (err, result) => {
                callback(err, result);
            });
        });
    }
}
module.exports = UserDAO;