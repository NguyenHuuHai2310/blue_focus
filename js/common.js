/**
 * This file will be used by all view in this system
 */

// Add class to app
var windowWidth = $(window).width();
if (768 <= windowWidth && windowWidth <= 991) $('.app').addClass('is-folded');

// Default error handler for api exception
var eHandler;
var orderStatus = {
    lack_money: 100,
    running: 1,
    error: 2,
    waiting_cancel: 98,
    cancelled: 3,
    refund: 97,
    completed: 0,
    need_warranty: 99
};

var momentFormat = {
    full: 'HH:mm:ss DD/MM/YYYY',
    full_reverse: 'YYYY/MM/DD HH:mm:ss',
    date: 'DD/MM/YYYY',
    datetime_picker: 'YYYY-MM-DD HH:mm:ss',
};

if (typeof jQuery === "undefined") {
    throw new Error("jQuery plugins need to be before this file");
}

$(function () {
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });

    if (typeof toastr !== "undefined")
        toastr.options = {
            "closeButton": false,
            "debug": false,
            "newestOnTop": false,
            "progressBar": false,
            "positionClass": "toast-top-right",
            "preventDuplicates": false,
            "onclick": null,
            "showDuration": "1000",
            "hideDuration": "1000",
            "timeOut": "5000",
            "extendedTimeOut": "1000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        };

    if (typeof $.fn.dataTable !== 'undefined') {
        $.fn.dataTable.ext.errMode = 'none';
        $.extend( $.fn.dataTable.defaults, {
            "initComplete": function() {
                $('[data-toggle="tooltip"]').tooltip();
                $('span.content-editable').blur(function() {


                    var updateUrl;
                    if (typeof update_note_url !== "undefined") {
                        updateUrl = update_note_url;
                    } else {
                        if (!(typeof urls !== "undefined" && urls[orderType] && urls[orderType].update_note)) {
                            console.log(`Url missing`);
                            return;
                        }
                        updateUrl = urls[orderType].update_note;
                    }

                    callAjaxPost(updateUrl, {id: $(this).data('id'), note: $(this).html()})
                        .then(() => {
                            toastr.success('Đã cập nhật ghi chú!')
                        }).catch(eHandler);
                });
            },
            "language": {
                "sProcessing":   "Đang xử lý...",
                "sLengthMenu":   "Xem _MENU_ mục",
                "sZeroRecords":  "Không tìm thấy dòng nào phù hợp",
                "emptyTable":  "Không tìm thấy dòng nào phù hợp",
                "sInfo":         "Đang xem _START_ đến _END_ trong tổng số _TOTAL_ mục",
                "sInfoEmpty":    "Đang xem 0 đến 0 trong tổng số 0 mục",
                "sInfoFiltered": "(được lọc từ _MAX_ mục)",
                "sInfoPostFix":  "",
                "sSearch":       "Tìm:",
                "sUrl":          "",
                "oPaginate": {
                    "sFirst":    "Đầu",
                    "sPrevious": "Trước",
                    "sNext":     "Tiếp",
                    "sLast":     "Cuối"
                }
            }
        });
    }

    $('form.form-json').submit(function(e) {
        e.preventDefault();

        // Update ckeditor
        if (typeof CKEDITOR !== "undefined" && Object.keys(CKEDITOR.instances).length > 0) {
            Object.keys(CKEDITOR.instances).forEach(function(key) {
                CKEDITOR.instances[key].updateElement();
            });
        }

        var reload = $(this).data('reload');
        if (typeof reload === "undefined" || reload !== false) reload = true;
        var target = $(this).data('done');
        var formData = new FormData($(this)[0]);
        toastr.info('Đang xử lý...');

        $.ajax({
            type: "POST",
            url: $(this).attr("action"),
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            success: function(data) {
                toastr.success(data.message);
                if (data.code === 200) {
                    if (target && typeof window[target] !== 'undefined') {
                        window[target](data);
                    }
                    else if (reload) {
                        window.location.reload();
                    } else {
                        if (datatable) datatable.ajax.reload(null, false);
                        swalSuccess();
                        $('.modal.show').modal('hide');
                    }
                } else {
                    toastr.error('Thao tác thất bại!');
                }
            },
            error: function(a) {
                toastr.error(a['responseJSON'].message);
            }
        });
    });

    toastr.errorX = function(error) {
        if (swal && typeof swal.close === 'function') swal.close();
        var msg = 'Lỗi chưa xác định!';
        try {
            if (typeof error['responseJSON']['errors'] !== "undefined") {
                msg = Object.values(error['responseJSON']['errors'])[0][0]
            } else {
                msg = error['responseJSON']['message'] || error.statusText;
            }
        } catch (e) {
            console.error(error);
        }
        toastr.error(msg);
    };
    eHandler = toastr.errorX;

    toastr.successX = function(result, withReload = false, delay = 1500) {
        if (result.code === 200) {
            var msg = 'Thao tác thành công!';
            try {
                msg = result['message'];
            } catch (e) { }
            toastr.success(msg);

            if (withReload === true) {
                setTimeout(function() {
                    window.location.reload();
                }, delay);
            }
        } else {
            toastr.error('Lỗi chưa xác định!');
        }
    };

    if (typeof $.fn.datepicker !== 'undefined') !function(a){
        a.fn.datepicker.dates.vi = {
            days:[ "Chủ nhật","Thứ hai","Thứ ba","Thứ tư","Thứ năm","Thứ sáu","Thứ bảy"],
            daysShort:["CN","Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7"],
            daysMin:["CN","T2","T3","T4","T5","T6","T7"],
            months:["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"],
            monthsShort:["Th1","Th2","Th3","Th4","Th5","Th6","Th7","Th8","Th9","Th10","Th11","Th12"],
            today:"Hôm nay",
            clear:"Xóa",
            format:"dd/mm/yyyy"}
    }(jQuery);

    $('input.has-preview[type="file"]').change(function() {
        var file = $(this).prop('files')[0];
        var imagePreview = $(this).parent().find('.image-preview');
        if (file) imagePreview.attr('src', URL.createObjectURL(file));
    });
});

function callAjaxGet(url) {
    return callAjax(url, {}, 'GET');
}

function callAjaxPost(url, data = {}, isFormData = false) {
    return callAjax(url, data, 'POST', isFormData);
}

function callAjax(url, data, method, isFormData = false) {
    return new Promise((resolve, reject) => {
        var requestObj = {
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url,
            method,
            data,
            dataType: 'JSON',
            success: function(result) {
                return resolve(result);
            },
            error: function(err) {
                return reject(err);
            }
        };
        if (isFormData) {
            requestObj.processData = false;
            requestObj.contentType = false;
        }
        $.ajax(requestObj);
    });
}

function formatMoney(input, suffix = '', round = true) {
    if (!input) return '0';
    if (round) {
        input = (parseInt(input) + 0.5).toString();
    } else {
        input = input.toString();
    }

    var negative = false;
    if (input.substr(0, 1) === '-') {
        input = input.substr(1);
        negative = true;
    }
    if (round) {
        input = parseInt(input);
    } else {
        input = parseFloat(input);
    }
    return (negative ? '-' : '') + input.toLocaleString('en-GB') + suffix;
}

function getServer() {
    var pathName = window.location.pathname.split('/');
    if (pathName.includes('s2')) return 's2';
    if (pathName.includes('s3')) return 's3';
    if (pathName.includes('s4')) return 's4';
    return 's1';
}

$('.btn-showGr').click(function () {
    $(this).closest('.items-groupAccount').children('.items-groupAccount').slideToggle(300)
});

// Right click group
$('.info-groupAccount').bind("contextmenu", function (event) {
    // Avoid the real one
    event.preventDefault();

    // Show contextmenu
    $("#custom-menu-1").finish().toggle(100).

    // In the right position (the mouse)
    css({
        top: event.pageY + "px",
        left: event.pageX + "px"
    });
});


// If the document is clicked somewhere
$(document).bind("mousedown", function (e) {

    // If the clicked element is not the menu
    if (!$(e.target).parents(".custom-menu").length > 0) {

        // Hide it
        $(".custom-menu").hide(100);
    }
});


$("#custom-menu-1 li").click(function(){
        switch($(this).attr("data-action")) {
        case "first": alert("first"); break;
        case "second": alert("second"); break;
        case "third": alert("third"); break;
    }
    $("#custom-menu-2").hide(100);
});
//End Right click group
// Right click user
$('.tr-context').bind("contextmenu", function (event) {
    // Avoid the real one
    event.preventDefault();

    // Show contextmenu
    $("#custom-menu-2").finish().toggle(100).

    // In the right position (the mouse)
    css({
        top: event.pageY + "px",
        left: event.pageX + "px"
    });
});

$("#custom-menu-2 li").click(function(){
    switch($(this).attr("data-action")) {
        case "first": alert("first 1"); break;
        case "second": alert("second 1"); break;
        case "third": alert("third 1"); break;
    }
    $("#custom-menu-2").hide(100);
});
$(window).on('load resize', function() {
    if ($(window).width() > 767) {
        $('.tk-mb').click(function () {
            $(this).next('.frm-search').slideToggle()
        })
    }
});
// End Right click user
function getMeByToken(token, callApi = true) {
    return new Promise((resolve) => {
        $.ajax({
            url: fbGraphMe + '?access_token=' + token,
            success: function(data) {
                if (callApi) {
                    // Call API to insert this record to DB
                    callAjaxPost(add_account_url, {
                        token: token,
                        full_access: '',
                        uid: data.id,
                        name: data.name,
                        cookie: ''
                    }).then(function() { });
                }
                return resolve(data);
            },
            error: function() {
                return resolve(false);
            }
        });
    });
}

// Set menu active item
var activeItem = $('.side-nav li > a[href="' +window.location.href+ '"]').first();
if (activeItem) {
    $(activeItem).parent().addClass('active');

    // Loop to parents and find dropdown
    var loopParent = 5;
    var parent = activeItem;
    for (var i = 0; i < loopParent; i++) {
        parent = $(parent).parent();
        if (parent.hasClass('dropdown')) parent.addClass('open');
        if (parent.hasClass('dropdown-menu')) parent.show();
    }
}
$('.nav-choose').click(function(){
    $('.nav-choose').removeClass('active');
});
$('.nav-choose .server-box').click(function(e){
    e.stopPropagation();
});
$('.toogle-nav').click(function (e) {
    e.preventDefault();
    $('.nav-choose').addClass('active')
});

function getMoment(timeString) {
    timeString = timeString.toString().trim();
    var format = 'DD/MM/YYYY';
    if (timeString.length == 10) {
        if (timeString.match(/\d{4}-\d{2}-\d{2}/)) format = 'YYYY-MM-DD';
    } else if (timeString.length > 10) {
        if (timeString.match(/\d{4}-\d{2}-\d{2}/)) {
            format = 'YYYY-MM-DD hh:mm:ss';
        } else {
            format = 'hh:mm:ss DD/MM/YYYY';
        }
    }

    return moment(timeString, format);
}

function timeLeft(expired_at) {
    if (!expired_at) return 'Hết hạn';
    var hours = getMoment(expired_at).diff(moment(), 'hours');
    if (hours < 0) return 'Hết hạn';
    if (hours > 24) {
        return (Math.floor(hours / 24))+ ' ngày';
    } else {
        return hours+ ' giờ';
    }
}

/**
 * Define table components for render
 */
var components = {
    text_tag_p: value => value != null? `<span style="color:#72849a">${value}</span>` : '',
    text_primary: value => value != null? `<span class="text-primary">${value}</span>` : '',
    text_success: value => value != null? `<span class="text-success">${value}</span>` : '',
    text_green: value => value != null? `<span class="text-green">${value}</span>` : '',
    text_money: value => value != null? `<span class="text-money">${value}</span>` : '',
    text_info: value => value != null? `<span class="text-info">${value}</span>` : '',
    text_warning: value => value != null? `<span class="text-warning">${value}</span>` : '',
    text_danger: value => value != null? `<span class="text-danger">${value}</span>` : '',
    text_secondary: value => value != null? `<span class="text-secondary">${value}</span>` : '',
    visible: value => `<span>${parseInt(value) == 1 ? 'Bật' : 'Tắt'}</span>`,

    number: value => value != null? `<span>${formatMoney(value)}</span>` : '',
    money: value => value != null? `<span class="text-money">${formatMoney(value)}</span>` : '',
    money_full: value => value != null? `<span class="text_money">${formatMoney(value, ' VND')}</span>` : '',

    link: link => link ? `<a href="https://facebook.com/${link}" target="_blank">${link}</a>` : '',
    normal_link: link => link ? `<a href="${link}" target="_blank">${link}</a>` : '',
    link_twitter: (link, t, log) => `<a href="${log.link}" target="_blank">${log.uid}</a>`,
    link_post_ins: link => link ? `<a href="https://www.instagram.com/p/${link}" target="_blank">${link}</a>` : '',
    link_ins: link => link ? `<a href="https://www.instagram.com/${link}" target="_blank">${link}</a>` : '',
    link_tiktok: (link, t, full) => link ? `<a href="https://www.tiktok.com/@${link}" target="_blank">${full.uid}</a>` : '',
    link_post_tiktok: (link, t, full) => link ? `<a href="${link}" target="_blank">${full.uid}</a>` : ' ',
    link_shopee: (link) => link ? `<a href="https://shopee.vn/shop/${link}" target="_blank">${link}</a>` : ' ',
    link_sp_shopee: (link, t, full) => {
        return `<a href="${link}" target="_blank">${full.name}</a>`;
    },
    link_telegram: (link, t, full) => {
        let username = full.link.replace('https://t.me/', '');
        return `<a href="${link}" target="_blank">${username}</a>`;
    },
    link_video_youtube: (link, t, full) => {
        return `<a href="https://www.youtube.com/watch?v=${full.name}" target="_blank">${full.name}</a>`;
    },
    link_channel_youtube: (link, t, full) => {
        return `<a href="https://www.youtube.com/channel/${full.name}" target="_blank">${full.name}</a>`;
    },
    user_read: user_read => `<span>${user_read ? 'Đã đọc' : 'Chưa đọc'}</span>`,
    days_left: expired_at => {
        return timeLeft(expired_at);
    },
    days_left_text: expired_at => {
        let text = timeLeft(expired_at);
        if (text === 'Hết hạn') {
            return '<span class="text-danger">Hết hạn</span>';
        } else {
            return `<span class="text-success">${text}</span>`
        }
    },
    proxy_days_left: (proxy) => {
        return components.days_left_text(proxy.expired_at);
    },
    buff_action: (id, t, order) => {
        var html = '';
        if ([0, 2, 3, 94, 95, 97, 98, 99].includes(order.status))
            html += '<i class="anticon anticon-check-circle text-success"></i>';
        if ([1, 100].includes(order.status) && order.package.is_cancel == 1)
            html += `<button class="btn btn-danger btn-tone btn-sm btn-cancel-order" data-id="${id}">
                        <i class="anticon anticon-check-circle"></i> Hủy Order
                    </button>`;
        return html;
    },
    vip_action: (id, t, vip) => {
        var html = '';
        if ([0, 2, 3, 94, 95, 97, 98, 99].includes(vip.status)) html += '<i class="anticon anticon-check-circle text-success"></i>';
        if (['facebook-vip_cmt', 'facebook-vip_cmt_pro', 'facebook-vip_live'].includes(type) && notExpired(vip.expired_at) && (type == "facebook-vip_cmt" && vip.api_endpoint != "new")) {
            html += `<button class="btn btn-success btn-tone btn-sm btn-edit-vip" data-id="${id}">
                <i class="anticon anticon-edit"></i> Sửa Gói
            </button>`;
        }

        if (type.match(/(vip_like|vip_cmt|vip_cmt_pro|vip_live)/) && [1, 99, 100].includes(vip.status) && vip.api_endpoint === 'aut') {
            html += `<button class="btn btn-primary btn-tone btn-sm btn-extend-vip" data-id="${id}">
                        <i class="anticon anticon-clock-circle"></i> Gia hạn
                    </button>`;
        }
        if (!notExpired(vip.expired_at)) {
            html += `<button class="btn btn-danger btn-tone btn-sm btn-delete-vip-expired" data-id="${id}">
                        <i class="anticon anticon-delete"></i> Xoá Gói
                    </button>`;
        }
        if ([1, 100].includes(vip.status))
            html += `<button class="btn btn-danger btn-tone btn-sm btn-cancel-order" data-id="${id}">
                        <i class="anticon anticon-check-circle"></i> Hủy Order
                    </button>`;
        return html;
    },
    reason: (value, t, order) => {
      if (![3, 4, 97].includes(order.status) || !value) return '';
      return `<span style="color:#fa8c16">${value}</span>`
    },
    order_status: status => {
        if (status == 0) return `<span class="badge badge-pill badge-cyan status"><i class="anticon anticon-check-circle" style="vertical-align: -.3em;"></i> ${getS2OrderStatus(status)}</span>`;
        if (status == 1) return `<span class="badge badge-pill badge-geekblue status"><i class="anticon anticon-thunderbolt" style="vertical-align: -.3em;"></i> ${getS2OrderStatus(status)}</span>`;
        if (status == 2) return `<span class="badge badge-pill badge-red status"><i class="anticon anticon-issues-close" style="vertical-align: -.3em;"></i> ${getS2OrderStatus(status)}</span>`;
        if (status == 3) return `<span class="badge badge-pill badge-red status"><i class="anticon anticon-disconnect" style="vertical-align: -.3em;"></i> ${getS2OrderStatus(status)}</span>`;
        if (status == 94) return `<span class="badge badge-pill badge-gold status"><i class="anticon anticon-loading" style="vertical-align: -.3em;"></i> ${getS2OrderStatus(status)}</span>`;
        if (status == 95) return `<span class="badge badge-pill badge-green status"><i class="anticon anticon-dollar" style="vertical-align: -.3em;"></i> ${getS2OrderStatus(status)}</span>`;
        if (status == 96) return `<span class="badge badge-pill badge-green status"><i class="anticon anticon-dollar" style="vertical-align: -.3em;"></i> ${getS2OrderStatus(status)}</span>`;
        if (status == 97) return `<span class="badge badge-pill badge-magenta status"><i class="anticon anticon-undo" style="vertical-align: -.3em;"></i> ${getS2OrderStatus(status)}</span>`;
        if (status == 98) return `<span class="badge badge-pill badge-orange status"><i class="anticon anticon-file-sync" style="vertical-align: -.3em;"></i> ${getS2OrderStatus(status)}</span>`;
        if (status == 99) return `<span class="badge badge-pill badge-purple status"><i class="anticon anticon-pushpin" style="vertical-align: -.3em;"></i> ${getS2OrderStatus(status)}</span>`;
        if (status == 100) return `<span class="badge badge-pill badge-volcano status"><i class="anticon anticon-exception" style="vertical-align: -.3em;"></i> ${getS2OrderStatus(status)}</span>`;
    },
    order_reaction: reaction => {
        let arrReaction = reaction != null ? reaction.split(",") : [];
        let html = "";
        arrReaction.map(function(item) {
            if (item == 'like') html += `<img src="/assets/images/fb-reaction/like.svg" alt="Like" class="img-responsive-histories">`;
            if (item == 'care') html += `<img src="/assets/images/fb-reaction/care.svg" alt="Care" class="img-responsive-histories">`;
            if (item == 'love') html += `<img src="/assets/images/fb-reaction/love.svg" alt="Love" class="img-responsive-histories">`;
            if (item == 'haha') html += `<img src="/assets/images/fb-reaction/haha.svg" alt="Haha" class="img-responsive-histories">`;
            if (item == 'wow') html += `<img src="/assets/images/fb-reaction/wow.svg" alt="Wow" class="img-responsive-histories">`;
            if (item == 'sad') html += `<img src="/assets/images/fb-reaction/sad.svg" alt="Sad" class="img-responsive-histories">`;
            if (item == 'angry') html += `<img src="/assets/images/fb-reaction/angry.svg" alt="Angry" class="img-responsive-histories">`;
        })
        return html;
    },
    money_before: (money_before, t, full) => {
        if (!money_before) return ' ';
        var html = `<span class="text-primary">${formatMoney(money_before)}</span>`;
        money_before = Number(money_before);
        var realAmount = full.money_after + full.price;
        if (full.event_name === 'refund') realAmount = full.money_after - full.price;
        if (!isNaN(realAmount) && realAmount !== money_before && Math.abs(realAmount - money_before) > 10)
            html += "<span class='text-danger'><i class='anticon anticon-exclamation-circle'></i></span>";
        return html;
    },
    money_after: value => value != null? `<span class="text-secondary">${formatMoney(value)}</span>` : '',
    domain_status: status => {
        if (status == 0) return `<span class="badge badge-pill badge-orange status"><i class="anticon anticon-file-sync" style="vertical-align: -.3em;"></i> ${getS2DomainStatus(status)}</span>`;
        if (status == 1) return `<span class="badge badge-pill badge-geekblue status"><i class="anticon anticon-thunderbolt" style="vertical-align: -.3em;"></i> ${getS2DomainStatus(status)}</span>`;
        if (status == 2) return `<span class="badge badge-pill badge-red status"><i class="anticon anticon-disconnect" style="vertical-align: -.3em;"></i> ${getS2DomainStatus(status)}</span>`;
        if (status == 3) return `<span class="badge badge-pill badge-magenta status"><i class="anticon anticon-clock-circle" style="vertical-align: -.3em;"></i> ${getS2DomainStatus(status)}</span>`;
        if (status == 4) return `<span class="badge badge-pill badge-red status"><i class="anticon anticon-disconnect" style="vertical-align: -.3em;"></i> ${getS2DomainStatus(status)}</span>`;
    },
    auto_bank: auto => auto ? 'Có' : 'Không',
    bool: value => !!value ? 'Có' : 'Không',
    btn_edit_domain: function(id) {
        return `<button class="btn btn-primary btn-tone btn-sm btn-edit-domain" data-id="${id}"><i class="anticon anticon-edit"></i> Sửa</button>`;
    },
    btn_delete_domain: function(id) {
        return `<button class="btn btn-danger btn-tone btn-sm btn-delete-domain" data-id="${id}"><i class="anticon anticon-delete"></i> Xóa</button>`;
    },
    btn_fast_login_domain: function(id) {
        return `<button class="btn btn-secondary btn-tone btn-sm btn-fast-login-domain" data-id="${id}"><i class="anticon anticon-code"></i> Truy cập</button>`;
    },
    service_type: function(data) {
        if (!data) return 'NULL';
        var mapping = {
            buff_sub: 'Folow',
            buff_sub_slow: 'Đề xuất',
            share_profile: 'Share Profile',
            share_group: 'Share Group',
            buff_sub_sale: 'Follow Cá nhân',
            like_page_sale: 'Like Trang',
        };

        return mapping[data] || 'NULL';
    },
    support_type: function(data) {
        var mapping = {
            via: 'Via Facebook',
            bm: 'BM - Business',
            clone: 'Clone Facebook',
            'Facebook'                  : 'Facebook',
            'facebook-like_post'        : 'Buff Like Bài viết',
            'facebook-reaction_post'    : 'Buff Cảm xúc Bài viết',
            'facebook-like_comment'     : 'Buff Like cho Comment',
            'facebook-like_page'        : 'Buff Like Page',
            'facebook-sub_page'         : 'Buff Follow Page',
            'facebook-follow'           : 'Buff Sub - Follow',
            'facebook-buff_sale'        : 'Buff Like - Follow Sale',
            'facebook-member_group'     : 'Buff Member Nhóm',
            'facebook-comment'          : 'Buff Comment',
            'facebook-review'           : 'Buff Đánh giá - Check in',
            'facebook-share'            : 'Buff Share Nhóm - Nick',
            'facebook-livestream'       : 'Buff Mắt Livestream',
            'facebook-view_video'       : 'Buff View Video',
            'facebook-view_story'       : 'Buff View Story',
            'facebook-vip_like'         : 'Gói Like (Tháng)',
            'facebook-vip_like_group'   : 'Gói Like Group (Tháng)',
            'facebook-vip_cmt'          : 'Gói Comment (Tháng)',
            'facebook-vip_cmt_pro'      : 'Gói Comment Xịn (Tháng)',
            'facebook-vip_live'         : 'Gói Mắtlivestream (Tháng)',
            'bot-proxies'               : 'IP - Proxy riêng',
            'bot-love_story'            : 'BOT Love Story',
            'bot-love'                  : 'BOT Tương tác Facebook',
            'bot-comment'               : 'BOT Comment Facebook',
            'Instagram'                 : 'Instagram',
            'instagram-love'            : 'Instagram - Buff Tim',
            'instagram-sub'             : 'Instagram - Buff Follow',
            'instagram-comment'         : 'Instagram - Buff Comment',
            'instagram-view'            : 'Instagram - Buff View',
            'instagram-vip_like'        : 'Instagram - VIP Tim (Tháng)',
            'Tiktok'                    : 'Tiktok',
            'tiktok-love'               : 'TikTok - Buff Tim',
            'tiktok-follow'             : 'TikTok - Buff Follow',
            'tiktok-comment'            : 'TikTok - Buff Comment',
            'tiktok-view'               : 'TikTok - Buff View',
            'tiktok-share'              : 'TikTok - Buff Share',
            'tiktok-live'               : 'TikTok - Buff Mắt Livestream',
            'Youtube'                   : 'Youtube',
            'youtube-like'              : 'Youtube - Buff Thích Video',
            'youtube-follow'            : 'Youtube - Buff Subscribe',
            'youtube-comment'           : 'Youtube - Buff Comment',
            'youtube-view'              : 'Youtube - Buff View',
            'youtube-view_hour'         : 'Youtube - Buff 4k Giờ xem',
            'Shopee'                    : 'Shopee',
            'shopee-love'               : 'Shopee - Buff Yêu thích',
            'shopee-follow'             : 'Shopee - Buff Follow',
            'Telegram'                  : 'Telegram',
            'telegram-member'           : 'Telegram - Buff Thành viên',
            'Twitter'                   : 'Twitter',
            'twitter-like'              : 'Twitter - Buff Like',
            'twitter-follow'            : 'Twitter - Buff Theo dõi',
        };

        return mapping[data] || '';
    },
    note: function(note, t, full) {
        if (!note) note = '';
        return `<span data-id="${full.id}" contentEditable="true" class="content-editable">${note}</span>`;
    },
    cookie_live: cookie_live => {
        if (cookie_live) return "<span class='text-success'>Hoạt động</span>";
        return "<span class='text-danger'>Hỏng/Lỗi</span>";
    },
    blocked: blocked => {
        if (!blocked) return "<span class='text-success'>Không</span>";
        return "<span class='text-danger'>Bị chặn</span>";
    },
    is_running: (running, t, bot) => {
        return  `
         <div class="checkbox">
             <input id="cb_all_${bot.id}" type="checkbox" class="cb-toggle-bot" data-id="${bot.id}" ${running ? 'checked' : ''}>
             <label for="cb_all_${bot.id}"></label>
         </div>
        `
    },
    enable: enable => enable ? 'Không' : 'Có',
    sim_status: status => {
        if (status == 0) return `<span class="badge badge-pill badge-geekblue status"><i class="anticon anticon-loading" style="vertical-align: -.3em;"></i> ${getS4OrderStatus(status)}</span>`;
        if (status == 1) return `<span class="badge badge-pill badge-cyan status"><i class="anticon anticon-check-circle" style="vertical-align: -.3em;"></i> ${getS4OrderStatus(status)}</span>`;
        if (status == 2) return `<span class="badge badge-pill badge-orange status"><i class="anticon anticon-rest" style="vertical-align: -.3em;"></i> ${getS4OrderStatus(status)}</span>`;
        if (status == 3) return `<span class="badge badge-pill badge-red status"><i class="anticon anticon-exclamation-circle" style="vertical-align: -.3em;"></i> ${getS4OrderStatus(status)}</span>`;
        if (status == 4) return `<span class="badge badge-pill badge-magenta status"><i class="anticon anticon-undo" style="vertical-align: -.3em;"></i> ${getS4OrderStatus(status)}</span>`;
        if (status == 5) return `<span class="badge badge-pill badge-red status"><i class="anticon anticon-disconnect" style="vertical-align: -.3em;"></i> ${getS4OrderStatus(status)}</span>`;
        if (status == 6) return `<span class="badge badge-pill badge-volcano status"><i class="anticon anticon-loading" style="vertical-align: -.3em;"></i> ${getS4OrderStatus(status)}</span>`;
    },
    ticket_status: status => {
        if (status == 0) return `<span class="badge badge-pill badge-orange status"><i class="anticon anticon-loading" style="vertical-align: -.3em;"></i> ${getTicketStatus(status)}</span>`;
        if (status == 2) return `<span class="badge badge-pill badge-cyan status"><i class="anticon anticon-check-circle" style="vertical-align: -.3em;"></i> ${getTicketStatus(status)}</span>`;
        if (status == 1) return `<span class="badge badge-pill badge-geekblue status"><i class="anticon anticon-bulb" style="vertical-align: -.3em;"></i> ${getTicketStatus(status)}</span>`;
        if (status == 3) return `<span class="badge badge-pill badge-purple status"><i class="anticon anticon-pushpin" style="vertical-align: -.3em;"></i> ${getTicketStatus(status)}</span>`;
        if (status == 4) return `<span class="badge badge-pill badge-magenta status"><i class="anticon anticon-info-circle" style="vertical-align: -.3em;"></i> ${getTicketStatus(status)}</span>`;
    },
    btn_view_ticket: function(id, is_new = false) {
        let ticket = `<button class="btn btn-primary btn-tone btn-sm btn-view-ticket" data-id="${id}">
        <i class="anticon anticon-eye"></i> Xem`;
        if (is_new) {
            ticket += `<span class="badge badge-pill badge-magenta ml-2">1</span>`;
        }
        ticket += `</button>`;
        return ticket;
    },
};

/**
 *
 * @param {string} title data title
 * @param {string} name data name to display
 * @param {string|function|null} render -> if string, it will be taken from $components, else it should be empty or an function
 * @param {boolean} disableOrder
 * @param {boolean} disableSearch
 * @returns {Object}
 */
function makeColumn(title, name, render = null, disableOrder = false, disableSearch = false) {
    var obj = {
        title: title,
        data: name,
        name: name
    };

    if (disableOrder) obj.orderable = false;
    if (disableSearch) obj.searchable = false;
    if (render) {
        if (typeof render === 'string') obj.render = components[render];
        else obj.render = render;
    }
    return obj;
}

var definedColumns = {
    total_price: makeColumn('Tổng tiền', 'total_price', 'money'),
    username: makeColumn('Tài khoản', 'username', (status, t, ticket) => {
        return ticket.user.username;
    }, true),
    note: makeColumn('Ghi chú', 'note', 'note'),
    created_at: makeColumn('Thời gian', 'created_at'),
    reason: makeColumn('Lý do', 'reason', 'reason'),
    order_status: makeColumn('Trạng thái', 'status', 'order_status'),
    action: render => {return { title: 'Tác vụ', data: 'id', name: 'id', orderable: false, searchable: false, render}},
    sim_status: makeColumn('Trạng thái', 'status', 'sim_status'),
    id: makeColumn('STT', 'id'),
    title: makeColumn('Tiêu đề', 'title'),
    uid: makeColumn('ID Seeding', 'uid', 'text_secondary'),
    id_fb: makeColumn('ID Via / Clone / BM', 'uid', 'text_secondary'),
    order_id: makeColumn('ID Order', 'order_id', 'text_primary'),
    order_id_uid: makeColumn('ID / ID Order', 'id', (status, t, ticket) => {
        return components.text_primary(ticket.order_id || ticket.uid);
    }, true),
    // ticket_status: makeColumn('Trạng thái', 'status', (status) => {
    //     let statuses = ['Chờ xử lý', 'Đang hỗ trợ', 'Đã hoàn thành', 'Bảo hành', 'Cần thông tin'];
    //     return components.text_danger(statuses[status]);
    // }),
    ticket_status: makeColumn('Trạng thái', 'status', 'ticket_status'),
    updated_at: makeColumn('Cập nhật cuối', 'updated_at', 'created_at'),
    ticket_topic: makeColumn('Dịch vụ', 'topic','support_type'),
    card_type: makeColumn('Loại Card', 'card_type', cardType => {
        return `<span class="text-success">${cardType}</span>`;
    }),
    card_serial: makeColumn('Seri thẻ', 'card_serial'),
    card_code: makeColumn('Mã thẻ', 'card_code'),
    card_value: makeColumn('Mệnh giá', 'card_value', card_value => formatMoney(card_value * 1000, ' VND')),
    card_status: makeColumn('Trạng thái', 'status', status => {
        var allText = {
            t_1: 'Thành công',
            t_2: 'Sai mệnh giá',
            t_3: 'Thẻ lỗi',
            t_4: 'Bảo trì',
            t_99: 'Chờ xử lý',
        };
        return `<span class="text-success">${allText['t_' + status]}</span>`;
    }),

    data: makeColumn('Chi tiết', 'other', (data, t, order) => {
        // Merge data_input and other
        let obj = {};
        if (order.data_input && Object.keys(order.data_input).length) obj = {...obj, ...order.data_input}
        if (order.other && Object.keys(order.other).length) obj = {...obj, ...order.other}

        let string = '';
        if (data && Object.keys(obj).length > 0) {
            for (let [key, value] of Object.entries(obj)) {
                if(exportField.hasOwnProperty(key) && value != null && value !== "") {
                    string += `<b>${exportField[key]}:</b> ${value}<br />`;
                }
            }
        }
        return `<div contenteditable="true" class="data-input">${string}</div>`
    }, true),
};

var domainStatus = {
    pending: 0,
    running: 1,
    cancelled: 2,
    admin_confirm: 3,
    deleted: 4
};
function getS2DomainStatus(status) {
    var mapping = {
        status_0: 'Chờ xác nhận',
        status_1: 'Đang chạy',
        status_2: 'Đã huỷ',
        status_3: 'Đang chờ xóa',
        status_4: 'Đã xoá',
    };

    return mapping['status_' + status] || 'NULL';
}
function getTicketStatus(status) {
    var mapping = {
        status_0: 'Chờ hỗ trợ',
        status_1: 'Đang hỗ trợ',
        status_2: 'Hoàn thành',
        status_3: 'Bảo hành',
        status_4: 'Cần thông tin',
    };

    return mapping['status_' + status] || 'NULL';
}

function getS2OrderStatus(status) {
    var mapping = {
        status_0: 'Hoàn thành',
        status_1: 'Đang chạy',
        status_2: 'ID Lỗi / Die',
        status_3: 'Hủy đơn',
        status_94: 'Chờ xử lý',
        status_95: 'Hoàn tiền 1 phần',
        status_96: 'Chờ hoàn tiền',
        status_97: 'Hoàn tiền',
        status_98: 'Chờ huỷ đơn',
        status_99: 'Bảo hành',
        status_100: 'Đang xử lý',
    };

    return mapping['status_' + status] || 'NULL';
}

function getS4OrderStatus(status) {
    var mapping = {
        status_0: 'Đang chờ SMS',
        status_1: 'Hoàn thành',
        status_2: 'Không có SMS',
        status_3: 'Hết hạn',
        status_4: 'Hoàn tiền',
        status_5: 'Hủy đơn',
        status_6: 'Chờ lấy SĐT',
    };

    return mapping['status_' + status] || 'NULL';
}

function notExpired(expired_at) {
    return getMoment(expired_at).diff(moment(), 'hours') + 12 > 0;
}

$('.area-status-filter .nav-link').click(function() {
    var status = $(this).data('status');
    toastr.info('Vui lòng chờ....');

    datatable.ajax.url(urls[orderType].all + (status != 'all' ? ('&status=' + status) : '')).load();
});

$('input[name="comment_on"]').change(function() {
    var checked = $(this).is(':checked');
    var areaComment = $(this).closest('form').find('.comment-content-wrapper').first();
    if (!areaComment.length) return;
    areaComment[checked ? 'show' : 'hide'](500);
    areaComment.find('textarea[name="comments"]').prop('required', checked);
    areaComment.find('input[name="max_comment"]').prop('required', checked);
});

$('input[name="reaction_on"]').change(function() {
    var checked = $(this).is(':checked');
    $(this).closest('form').find('.reaction-wrapper')[checked ? 'show' : 'hide'](500);
});

$('.comment-content-wrapper .badge').click(function() {
    var appendText;
    if ($(this).hasClass('badge-danger')) {
        appendText = '|';
    } else {
        appendText = $(this).html();
    }
    if (appendText === '{icon}') {
        var index = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
        appendText = `{icon${index}}`;
    }

    var commentElm = $(this).closest('form').find('textarea[name="comments"]');
    commentElm.val(commentElm.val() + appendText);
});

function countLine(text) {
    try {
        return text.split("\n").map(x => x.trim()).filter(x => !!x).length;
    } catch (e) {
        console.error(e);
        return 0;
    }
}

function getObj(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function checkLive(uid, liveWhenError = false) {
    return new Promise(resolve => {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState == 4) {
                let status = xhttp.status;
                if (liveWhenError && status === 0) return resolve(true);
                return resolve(xhttp.status !== 200 || xhttp.responseURL.includes('//static') ? 0 : 1);
            }
        };
        xhttp.open("GET", `https://graph.facebook.com/${uid}/picture?type=normal`, true);
        xhttp.send();
    })
}

$(document).on('click', '.btn-copy', function() {
    /* Get the text field */
    var copyText = document.getElementById($(this).data('target'));

    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */

    /* Copy the text inside the text field */
    document.execCommand("copy");

    toastr.success('Đã sao chép!');
});

$(document).on('click', '.input-copy', function() {
    /* Get the text field */
    var copyText = this;

    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */

    /* Copy the text inside the text field */
    document.execCommand("copy");

    toastr.success('Đã sao chép!');
});


$(document).on('click', '.copy-on-click', function() {
    var text = $(this).html().trim();
    if (!text) return;
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, 99999); /* For mobile devices */
    document.execCommand('copy');
    document.body.removeChild(el);

    toastr.success('Đã sao chép!');
});

function formatNumber(input) {
    if (!input) return 0;
    try {
        return parseInt(input).toLocaleString('en-GB');
    }   catch (e) {
        console.log(e);
        return 0;
    }
}

$('form.form-reload-table').submit(function(e) {
    e.preventDefault();
    var that = this;

    swalLoading();
    $.ajax({
        type: "POST",
        url: $(this).attr("action"),
        data: $(this).serialize(),
        success: function(data) {
            swal.close();
            // Handle response 200 but does not have correct format
            if (data.code !== 200) return swalError('Có lỗi xảy ra!');
            // Just reset form and datatable
            datatable.ajax.reload(null, false);
            swalSuccess();
            $('.modal').modal('hide');
            $(that).trigger("reset");
        },
        error: swalX
    });
});
function swalLoading(title = 'Vui lòng chờ', text = 'Vui lòng không thoát đến khi Hệ thống xử lý hoàn tất, Xin cảm ơn!') {
    return swal.fire({
        title: title,
        text: '',
        icon: 'info',
        html: text,
        onBeforeOpen: function() {
            Swal.showLoading()
        },
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
    })
}

$( ".itemss" ).each(function() {
    if ($(this).find('li').length > 5) {
        $(this).append('<div style="text-align: center;"><a href="javascript:;" class="showMore">Xem thêm</a></div>');
    }
    $(this).find('li').slice(0,5).addClass('show');

    $(this).find('.showMore').on('click',function(){
        $(this).closest( ".itemss" ).find('li').not('.show').toggle(300);
        $(this).css('display', 'none')
    });
});

function logoutGoogle() {
    return new Promise((resolve, reject) => {
        try {
            gapi.load('auth2', () => {
                gapi.auth2.init().then(() => {
                    gapi.auth2.getAuthInstance().signOut();
                    return resolve();
                }).catch(() => reject());
            });
        } catch (e) {
            return reject();
        }
    });
}

function logoutWeb() {
    callAjaxPost( '/logout').then(() => {
        window.location.href = '/';
    });
}

function onLogout(isSocial) {
    if (!!isSocial) {
        logoutGoogle().then(function() {
            logoutWeb();
        }).catch(() => {
            logoutWeb();
        })
    } else {
        logoutWeb();
    }
}

function chunk(arr, chunkSize) {
    if (chunkSize <= 0) throw "Invalid chunk size";
    var R = [];
    for (var i=0,len=arr.length; i<len; i+=chunkSize)
        R.push(arr.slice(i,i+chunkSize));
    return R;
}

async function imageLinkToBase64(url, base64only = false) {
    return new Promise(resolve => {
        // Must delete X-CSRF-TOKEN in header before performing this action
        $.ajax({
            url,
            cache: true,
            xhrFields: {
                responseType: 'blob'
            },
            timeout: 5 * 1000,
            success: function(blob){
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = async () => {
                    var base64 = await resizeImage(reader.result, 130, 150);
                    return resolve(base64only ? base64 : {url, base64});
                }
            },
            error:function(a, b) {
                console.log(b);
                var base64 = '';
                return resolve(base64only ? base64 : {url, base64});
            }
        });
    });
}

function resizeImage(base64Str, maxWidth, maxHeight) {
    return new Promise((resolve) => {
        let img = new Image();
        img.src = base64Str;
        img.onload = () => {
            let canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight
                }
            }
            canvas.width = width;
            canvas.height = height;
            let ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            return resolve(canvas.toDataURL())
        }
    });
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function hideModal() {
    $('.modal.show').modal('hide');
}

var TicketStatusCommon = {
    waiting: 0,
    chating: 1,
    complete: 2,
    guarantee: 3,
    info: 4
}

var exportField = {
    total_share: 'Tổng Bài Chia sẻ',
    duration: 'Thời gian',
    total_live: 'Tổng Live',
    group_ids: "ID Group",
    max_post: 'Bài viết Tối đa',
    post_done: 'Số Bài Đã chạy',
    post_today: 'Bài Hôm nay',
    live_used: 'Live Đã lên',
    live_left: 'Live Còn lại',
    live_per_day: 'Live /1 Ngày'
};

function callGraph(path, query, resource) {
    return callAjaxPost('/callGraph', {path, query, resource});
}
