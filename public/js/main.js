const instance = axios.create({
    baseURL: '/',
    headers: {
        'Content-Type': 'application/json',
    },
});

instance.interceptors.request.use((config) => {
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Prevent
window.onload = function () {
    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    }, false);

    document.addEventListener("keydown", function (e) {
        if (e.ctrlKey && e.shiftKey && e.key === "I") {
            disabledEvent(e);
        }

        if (e.ctrlKey && e.shiftKey && e.key === "J") {
            disabledEvent(e);
        }

        if (e.key === "s" && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            disabledEvent(e);
        }

        if (e.ctrlKey && e.key === "u") {
            disabledEvent(e);
        }

        if (e.key === "F12") {
            disabledEvent(e);
        }
    }, false);

    function disabledEvent(e) {
        e.preventDefault();
        e.stopPropagation();
    }
};
