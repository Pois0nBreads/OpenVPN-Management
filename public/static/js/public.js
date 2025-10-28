//登出接口
function logout() {
    $.ajax({
        url: '/api/user/logout',
        method: 'POST',
        contentType: 'application/json',
        timeout: 10000
    });
    
    localStorage.removeItem('authToken');
    window.location.href = '/';
}

//错误弹窗通用处理函数
function alertError(msg, next) {
    if (typeof errorModal !== 'undefined') {
        errorModal.show(msg, next);
    } else {
        alert(msg);
        if (next)
            next();
    }
};

//Xhr通用处理函数
function handleXhrFail(xhr, status, error) {
    let errorMsg = '网络错误，请稍后重试。';
    if (xhr.responseJSON && xhr.responseJSON.msg) {
        errorMsg = xhr.responseJSON.msg;
    } else if (status === 'timeout') {
        errorMsg = '请求超时，请检查网络连接。';
    }
    alertError(errorMsg);
    console.error('登录请求失败:', status, error);
}

//检查token权限，跳转到对应网页
function checkPermission() {
    const savedToken = localStorage.getItem('authToken');
    if (!savedToken) {
        window.location.href = '/';
        return;
    }
    $.ajax({
        url: '/api/user/mylevel',
        method: 'POST',
        contentType: 'application/json',
        headers: { "Authorization": savedToken},
        timeout: 10000
    })
    .done(function(response) {
        $('#loadingModal').modal('hide');
        switch (response.level) {
            case 1:
                alertError('权限错误，跳转到对应页面...', ()=>{
                    window.location.href = '/user/';
                });
                console.log('普通用户');
                break;
            case 2:
                alertError('权限错误，跳转到对应页面...', ()=>{
                    window.location.href = '/admin/';
                });
                console.log('管理员');
                break;
            default:
                alertError('权限错误，跳转到登录页面...', ()=>{
                    localStorage.removeItem('authToken');
                    window.location.href = '/';
                });
                console.log('无权限');
                break;
        }
    })
    .fail(function(xhr, status, error) {
        alertError('权限错误，跳转到登录页面...', ()=>{
            window.location.href = '/';
        });
    });
}

//检查权限
function checkResCode(next, err) {
    return function(res) {
        if (res.code == 401) {
            checkPermission();
            return;
        }
        if (res.code != 0) {
            if (err)
                err(res);
            else
                alertError('系统出错' + res.msg);
            return;
        }
        next(res);
    }
}

function getMyname() {
    $.ajax({
        url: "/api/user/myinfo",
        method: "POST",
        timeout: 10000,
        headers: { "authorization": localStorage.getItem('authToken') }
    ,}).done(checkResCode(res => {
        let data = res.data;
        $('#myname').text(data.username)
    }));
}
getMyname();

//刷新网页
function reflush() {
    window.location.href = '?';
}