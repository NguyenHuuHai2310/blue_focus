// window._ = require('lodash');
//
// try {
//     require('bootstrap');
// } catch (e) {}
//
// /**
//  * We'll load the axios HTTP library which allows us to easily issue requests
//  * to our Laravel back-end. This library automatically handles sending the
//  * CSRF token as a header based on the value of the "XSRF" token cookie.
//  */
//
// window.axios = require('axios');
//
// window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
//
// /**
//  * Echo exposes an expressive API for subscribing to channels and listening
//  * for events that are broadcast by Laravel. Echo and event broadcasting
//  * allows your team to easily build robust real-time web applications.
//  */
//
// import Echo from 'laravel-echo';
//
// // window.Pusher = require('pusher-js');
//
// window.Echo = new Echo({
//     // broadcaster: 'pusher',
//     // key: process.env.MIX_PUSHER_APP_KEY,
//     // cluster: process.env.MIX_PUSHER_APP_CLUSTER,
//     // forceTLS: true
//
//     broadcaster: 'socket.io',
//     host: `${window.location.protocol}//${window.location.hostname}:6001`
// });



/**
 * User functions
 */

$(function () {
    if ($('#notifyModal').length > 0) $('#notifyModal').modal('show');

    // Thong bao nap tien thanh cong
    // setInterval(function() {
    //     callAjaxPost('/new_payments').then(function(response) {
    //         if (response && response.data && response.data.total) {
    //             swalSuccess(`Bạn đã nạp thành công ${formatMoney(response.data.total)} đ${response.data.note} Chúc bạn 1 ngày tốt lành !`);
    //         }
    //     });
    // }, 20000);

    let path = window.location.pathname;
    var arrPath = path.split('/');
    if (arrPath.length > 1 && ['s2', 's3'].indexOf(arrPath[1]) != -1 && path.indexOf('tickets') == -1) {
        setInterval(function() {
            callAjaxPost('/new_message?type=' + arrPath[1]).then(function(data) {
                if (data.data.total > 0) {
                    swalConfirm(`Có ${data.data.total} Ticket chờ bạn Phản hồi, Đóng Ticket nếu không cần Hỗ trợ nữa hoặc Xem ngay?`)
                    .then(function(confirm) {
                        if (!confirm) return;
                        window.location.href = `/${arrPath[1]}/tickets`;
                    })
                }
            });
        }, 30000);
    }

    // Thong bao co new notifications
    // setInterval(function() {
    //     callAjaxPost('/new_notifications').then(function(data) {
    //         if (data && data.title) {
    //             swalSuccess(data.title, data.content.replace(/\n/g, '<br />'));
    //         }
    //     });
    // }, 45000);

    // Init select2
    if (typeof $().select2 !== "undefined") $('.select2').select2();
});

