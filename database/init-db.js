/**
 * OpenVPN Management System Database Initialization Script
 * 数据库初始化脚本
 */

const mysql = require('mysql');
const fs = require('fs');
const path = require('path');

class DatabaseInitializer {
    constructor(config) {
        this.config = config;
        this.connection = mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password
        });

        this.pool = mysql.createPool({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database,
            connectionLimit: 10,
            acquireTimeout: 10000
        });
    }

    /**
     * 执行SQL文件
     */
    async executeSQLFile(filePath) {
        return new Promise((resolve, reject) => {
            const sql = fs.readFileSync(filePath, 'utf8');

            // 分割SQL语句
            const statements = sql.split(';').filter(stmt => stmt.trim());

            let completed = 0;
            const results = [];

            statements.forEach((statement, index) => {
                this.pool.query(statement, (error, result) => {
                    if (error) {
                        console.error(`执行SQL语句 ${index + 1} 时出错:`, error.message);
                        // 对于INSERT IGNORE，重复插入错误可以忽略
                        if (!error.message.includes('Duplicate entry')) {
                            reject(error);
                            return;
                        }
                    }

                    results.push(result);
                    completed++;

                    if (completed === statements.length) {
                        resolve(results);
                    }
                });
            });
        });
    }

    /**
     * 初始化数据库
     */
    async initialize() {
        try {
            console.log('开始初始化数据库...');

            // 创建数据库（如果不存在）
            await new Promise((resolve, reject) => {
                this.connection.connect((err) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    const createDbSQL = `CREATE DATABASE IF NOT EXISTS ${this.config.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;
                    this.connection.query(createDbSQL, (error) => {
                        if (error) {
                            reject(error);
                            return;
                        }
                        console.log(`数据库 ${this.config.database} 创建/验证完成`);
                        resolve();
                    });
                });
            });

            // 执行初始化SQL
            const initFile = path.join(__dirname, 'init.sql');
            if (fs.existsSync(initFile)) {
                console.log('执行数据库初始化脚本...');
                await this.executeSQLFile(initFile);
                console.log('数据库初始化完成');
            } else {
                console.log('初始化脚本不存在，跳过数据插入');
            }

            return true;
        } catch (error) {
            console.error('数据库初始化失败:', error);
            throw error;
        } finally {
            if (this.connection) {
                this.connection.end();
            }
            if (this.pool) {
                this.pool.end();
            }
        }
    }

    /**
     * 仅插入种子数据（不创建表结构）
     */
    async seedData() {
        try {
            console.log('开始插入种子数据...');

            const seedFile = path.join(__dirname, 'seed.sql');
            if (fs.existsSync(seedFile)) {
                await this.executeSQLFile(seedFile);
                console.log('种子数据插入完成');
            } else {
                console.log('种子数据脚本不存在');
            }

            return true;
        } catch (error) {
            console.error('种子数据插入失败:', error);
            throw error;
        }
    }
}

module.exports = DatabaseInitializer;