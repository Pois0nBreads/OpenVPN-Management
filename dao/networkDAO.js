/**
 * package dao/networkDAO.js
 * Struct Network {
 *      int uid,                    //网络组唯一ID
 *      varchar(255) network_name,  //网络组名称
 *      varchar(255) networks,      //网络组集合
 * }
 * 
 */
const mysql = require('mysql');

const NETWORK_TABLE_NAME = "network";

class NetworkDAO {
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
     *  获取全部网络组
    * @param {function} callback 
    */
    getAllNetworks(callback) {
        let pool = this.pool;
        let sql = `SELECT * FROM ${NETWORK_TABLE_NAME}`;
        pool.query(sql, (err, data) => {
            if (err)
                return callback(err, null);
            for (let i = 0; i < data.length; i++)
                data[i].networks = data[i].networks.split(',').filter(Boolean);
            callback(null, data);
        });
    }

    /**
     *  根据网络组ID获取信息
    * @param {number} uid UID
    * @param {function} callback 
    */
    getNetworkByUID(uid, callback) {
        let pool = this.pool;
        let sql = `SELECT * FROM ${NETWORK_TABLE_NAME} WHERE uid = ?`;
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
     *  创建网络组
    * @param {string} networkName 网络组名
    * @param {Array} networks 网络组数组
    * @param {function} callback 
    */
    addNetwork(networkName, networks, callback) {
        let pool = this.pool;
        let networkstr = '';
        for (let network of networks)
            networkstr += network + ',';
        const sql = `INSERT INTO ${NETWORK_TABLE_NAME} (network_name, networks) VALUES (?, ?)`;
        pool.query(sql, [networkName, networkstr], (err, result) => {
            callback(err, result);
        });
    }

    /**
     *  根据网络组UID删除
    * @param {uid} uid UID
    * @param {function} callback 
    */
    delNetworkByUId(uid, callback) {
        let pool = this.pool;
        this.getNetworkByUID(uid, (er, res) => {
            if (er) {
                callback(er);
                return;
            }
            if (!res) {
                callback(new Error("Failed to delete network. Network does not exist!"));
                return;
            }
            let sql = `DELETE FROM ${NETWORK_TABLE_NAME} WHERE uid = ?`;
            pool.query(sql, [uid], (err, result) => {
                callback(err, result);
            });
        });
    }

    /**
     *  根据UID修改网络组名称
    * @param {uid} uid UID
    * @param {string} networkName 网络组名
    * @param {function} callback 
    */
    changeNetworkNameByUID(uid, networkName, callback) {
        let pool = this.pool;
        this.getNetworkByUID(uid, (er, res) => {
            if (er) {
                callback(er);
                return;
            }
            if (!res) {
                callback(new Error("Failed to modify network. Network does not exist!"));
                return;
            }
            let sql = `UPDATE ${NETWORK_TABLE_NAME} SET network_name = ? WHERE uid = ?`;
            pool.query(sql, [networkName, uid], (err, result) => {
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
    changeNetworkByUID(uid, networks, callback) {
        let pool = this.pool;
        this.getNetworkByUID(uid, (er, res) => {
            if (er) {
                callback(er);
                return;
            }
            if (!res) {
                callback(new Error("Failed to modify network. Network does not exist!"));
                return;
            }
            let networkstr = '';
            for (let network of networks)
                networkstr += network + ',';
            let sql = `UPDATE ${NETWORK_TABLE_NAME} SET networks = ? WHERE uid = ?`;
            pool.query(sql, [networkstr, uid], (err, result) => {
                callback(err, result);
            });
        });
    }
}
module.exports = NetworkDAO;