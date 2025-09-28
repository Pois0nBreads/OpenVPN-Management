#!/usr/bin/env node

require('./env.js');
const config = require('./config.js');
//导入DAO包
const UserDAO = require('./dao/userDAO.js');
const RoleDAO = require('./dao/roleDAO.js');


let userDao = new UserDAO(config.dataBase);
let roleDAO = new UserDAO(config.dataBase);


// userDao.addUser("admini2", "23333", (err, result) => {
// 	if (err)
// 		console.error(err);
// 	else
// 		console.log(result);
// })

// userDao.getUserByName('admin2', (err, result) => {
// 	console.log(result);
// });

// userDao.getAllUsers((err, result) => {
// 	console.log(result);
// });

// userDao.delUserByName('test', (err, result) => {
// 	if (err)
// 		console.error(err);
// 	else
// 		console.log(result);
// });

// userDao.changePassByName('admin', 'ppppp', (err, result) => {
// 	if (err)
// 		console.error(err);
// 	else
// 		console.log(result);
// });

// userDao.getUserByName('admin', (err, result) => {
// 	console.log(result);
// });

// userDao.authLogin('admin', 'ppppp', (err, state, msg) => {
// 	if (err)
// 		console.log(err.message)
// 	console.log(state);
// });

// userDao.changeNicknameByName('admin', '你妈妈买的', (err, result) => {
// 	console.log(result);
// });

// let roles = [1, 99, 2342];

// userDao.changeRolesByName('admin', roles, (err, result) => {
// 	console.log(result);
// });

// userDao.getUserByName('admin', (err, result) => {
// 	console.log(result);
// });