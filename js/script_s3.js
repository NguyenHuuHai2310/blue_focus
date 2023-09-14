var exportField = {
    uid: 'ID',
    password: 'Mật khẩu',
    '2fa_code': '2FA',
    email: 'Email',
    email_password: 'Pass Email',
    access_token: 'Token',
    cookie: 'Cookie',
    birthday: 'Ngày sinh',
    friend_count: 'Bạn bè',
    name: 'Tên Facebook',
    note: 'Ghi chú',
    year_created: 'Năm tạo',
    backup_link: 'Link Backup',
    link_facebook: 'Link Facebook',
    gender: 'Giới tính',
    other_info: 'Thông tin khác',
    email_recover_email: 'Mail khôi phục Email'
};

/**
 * Get user readable export format base on string export format
 * @param format
 * @returns {string|*}
 */
function getExportFormat(format) {
    try {
        return format.split(' | ').map(x => exportField[x]).join(' | ');
    } catch (e) {
        console.error(e);
        return 'NULL';
    }
}

function getFieldText(field) {
    return exportField[field] || 'NULL';
}

/**
 * Create link and download a file by provided text
 * @param filename
 * @param text
 */
function downloadFile(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

/**
 * Create link and download a file by provided text (version 2)
 * @param filename
 * @param text
 * @param typeFile
 */
function downloadFileV2(filename, text, typeFile) {
    const data = new Blob([text], { type: typeFile });
    var textFile = "text";
    window.URL.revokeObjectURL(textFile);
    textFile = window.URL.createObjectURL(data);
    var element = document.createElement("a");
    element.setAttribute("href", textFile);
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

/**
 * Show sweetalert with text input
 * @param title
 * @param inputValue
 * @returns {Promise<Object>}
 */
function swalText(title, inputValue = '') {
    return new Promise((resolve) => {
        Swal.fire({
            title: title,
            inputValue: inputValue,
            input: 'text',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Không',
        }).then(action => {
            return resolve((action['isConfirmed'] && action['value']) ? resolve(action['value']) : false);
        })
    });
}

function touchBottom(delta = 90) {
    return (window.innerHeight + window.scrollY) < document.body.offsetHeight - delta;
}
