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
                alert('权限错误，跳转到对应页面...');
                console.log('普通用户');
                window.location.href = '/user/';
                break;
            case 2:
                alert('权限错误，跳转到对应页面...');
                console.log('管理员');
                window.location.href = '/admin/';
                break;
            default:
                alert('权限错误，跳转到登录页面...');
                console.log('无权限');
                localStorage.removeItem('authToken');
                window.location.href = '/';
                break;
        }
    })
    .fail(function(xhr, status, error) {
        alert('权限错误，跳转到登录页面...');
        window.location.href = '/';
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
                alert('系统出错' + res.msg);
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