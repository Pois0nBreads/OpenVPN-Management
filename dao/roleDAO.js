/**
 * package dao/roleDAO.js
 * Struct Role {
 *      int uid,                    //角色唯一ID
 *      varchar(255) role_name,     //角色名称
 *      varchar(255) networks,      //角色所有网络组
 * }
 * 
 */
const mysql = require('mysql');

const ROLE_TABLE_NAME = "role";

class RoleDAO {
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
     *  获取全部角色
    * @param {function} callback 
    */
    getAllRoles(callback) {
        let pool = this.pool;
        let sql = `SELECT * FROM ${ROLE_TABLE_NAME}`;
        pool.query(sql, (err, data) => {
            if (err)
                return callback(err, null);
            for (let i = 0; i < data.length; i++)
                data[i].networks = data[i].networks.split(',').filter(Boolean);
            callback(null, data);
        });
    }

    /**
     *  根据角色ID获取信息
    * @param {number} uid UID
    * @param {function} callback 
    */
    getRoleByUID(uid, callback) {
        let pool = this.pool;
        let sql = `SELECT * FROM ${ROLE_TABLE_NAME} WHERE uid = ?`;
        pool.query(sql, [uid], (err, result) => {
            if (err)
                return callback(err, null);
            let data = result[0];
            if (!data)
                return callback(null, null);
            data.networks = data.networks.split(',').filter(Boolean);
            callback(null, data);
        });
    }

    /**
     *  创建角色
    * @param {string} roleName 角色名
    * @param {Array} networks 网络组数组
    * @param {function} callback 
    */
    addRole(roleName, networks, callback) {
        let pool = this.pool;
        let networkstr = '';
        for (let network of networks)
            networkstr += network + ',';
        const sql = `INSERT INTO ${ROLE_TABLE_NAME} (role_name, networks) VALUES (?, ?)`;
        pool.query(sql, [roleName, networkstr], (err, result) => {
            callback(err, result);
        });
    }

    /**
     *  根据角色UID删除
    * @param {uid} uid UID
    * @param {function} callback 
    */
    delRoleByUId(uid, callback) {
        let pool = this.pool;
        this.getRoleByUID(uid, (er, res) => {
            if (er) {
                callback(er);
                return;
            }
            if (!res) {
                callback(new Error("Failed to delete role. Role does not exist!"));
                return;
            }
            let sql = `DELETE FROM ${ROLE_TABLE_NAME} WHERE uid = ?`;
            pool.query(sql, [uid], (err, result) => {
                callback(err, result);
            });
        });
    }

    /**
     *  根据UID修改角色名称
    * @param {uid} uid UID
    * @param {string} roleName 角色名
    * @param {function} callback 
    */
    changeRolenameByUID(uid, roleName, callback) {
        let pool = this.pool;
        this.getRoleByUID(uid, (er, res) => {
            if (er) {
                callback(er);
                return;
            }
            if (!res) {
                callback(new Error("Failed to modify role. Role does not exist!"));
                return;
            }
            let sql = `UPDATE ${ROLE_TABLE_NAME} SET role_name = ? WHERE uid = ?`;
            pool.query(sql, [roleName, uid], (err, result) => {
                callback(err, result);
            });
        });
    }

    /**
     *  根据UID修改所拥有网络组
    * @param {uid} uid UID
    * @param {Array} networks 网络组数组
    * @param {function} callback 
    */
    changeRoleByUID(uid, networks, callback) {
        let pool = this.pool;
        this.getRoleByUID(uid, (er, res) => {
            if (er) {
                callback(er);
                return;
            }
            if (!res) {
                callback(new Error("Failed to modify role. Role does not exist!"));
                return;
            }
            let networkstr = '';
            for (let network of networks)
                networkstr += network + ',';
            let sql = `UPDATE ${ROLE_TABLE_NAME} SET networks = ? WHERE uid = ?`;
            pool.query(sql, [networkstr, uid], (err, result) => {
                callback(err, result);
            });
        });
    }
}
module.exports = RoleDAO;