/**
*	package env.js
**/
//导入包
global.run_path = "/root/OpenVPN-Management/";
global.onExitTask = [];
process.on('SIGINT', () => process.exit(0));
process.on('exit', code => {
	for (let task of global.onExitTask)
		try {
			task();
		} catch(e) {
			console.log(`异常: ${e}`);
		}
});