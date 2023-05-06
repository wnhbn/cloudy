document.addEventListener("DOMContentLoaded", function () {
    const path = window.location.pathname;
    const conversationId = path.split('/').pop();
    let userId, email, fullName, token;
    const cookies = document.cookie.split(';');
    if (cookies.length <= 3) {
        const content = document.querySelector('#blur-content')
        content.style.filter = 'blur(5px)';;

        Swal.fire({
            title: "Expired",
            text: "Token Expiration!",
            icon: "error",
            confirmButtonColor: '#707cd0',
        }).then(() => {
            window.location.href = '/auth';
            content.style.filter = '';
        });
    }
    cookies.forEach(function (cookie) {
        const cookieParts = cookie.split('=');
        const key = cookieParts[0].trim();
        switch (key) {
            case 'id':
                userId = decodeURIComponent(cookieParts[1].trim());
                break;
            case 'email':
                email = decodeURIComponent(cookieParts[1].trim());
                break;
            case 'token':
                token = decodeURIComponent(cookieParts[1].trim());
                break;
            default:
                fullName = decodeURIComponent(cookieParts[1].trim());
        }
    });

    // Compare token
    // instance
    //     .get('/chat')
    //     .then(response => {
    //         console.log(response);
    //     })
    //     .catch(error => {
    //         console.log(error);
    //     });

    // Create a new conversation image
    const imageConversation = document.getElementById('img-conversation');
    const inputImageConversation = document.getElementById('upload-chat-photo');
    const iconImageConversation = document.querySelector('.fe-image');
    inputImageConversation.addEventListener('change', () => {
        imageConversation.removeAttribute('hidden');
        iconImageConversation.setAttribute('hidden', '')
        imageConversation.src = URL.createObjectURL(inputImageConversation.files[0]);
    })

    // imageConversation.addEventListener('load', () => {
    //     if (!imageConversation.src.endsWith('.jpg' || '.jpeg' || '.png' || '.gif')) {
    //         Swal.fire({
    //             title: "Error",
    //             text: 'Only image files are allowed!',
    //             icon: "error",
    //             confirmButtonColor: '#707cd0',
    //         });
    //     }
    // })

    // Create a new conversation
    let createGroupButton = document.querySelector('#btn-create-group')

    createGroupButton.addEventListener('click', function (event) {
        event.preventDefault();
        let title = document.querySelector('#title-group input');
        if (!title) {
            Swal.fire({
                position: 'top-end',
                title: "Please add a name for the conversation!",
                icon: "warning",
                showConfirmButton: false,
                timer: 4100,
                toast: true,
            });
        }
        if (inputImageConversation.files.length == 0) {
            // User did not select the file
            Swal.fire({
                position: 'top-end',
                title: "Please add a photo for the conversation!",
                icon: "warning",
                showConfirmButton: false,
                timer: 4100,
                toast: true,
            });
        }
        async function uploadImage() {

            let src = imageConversation.src;

            // Download photos from the link
            const response = await axios.get(src, { responseType: 'arraybuffer' });
            const blob = new Blob([response.data], { type: response.headers['content-type'] });

            const formData = new FormData();
            formData.append('title', title.value);
            formData.append('creatorId', userId);

            // Add members to a conversation
            let users = [userId];
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    const id = checkbox.id.split('-').pop();
                    users.push(id);
                }
            });
            if (users.length == 1) {
                Swal.fire({
                    position: 'top-end',
                    title: "You can't create a conversation with just you!",
                    icon: "warning",
                    showConfirmButton: false,
                    timer: 4100,
                    toast: true,
                });
                return;
            }

            const fileName = inputImageConversation.files[0].name;
            if (!fileName) {
                Swal.fire({
                    position: 'top-end',
                    title: "Please add a photo for the conversation!",
                    icon: "warning",
                    showConfirmButton: false,
                    timer: 4100,
                    toast: true,
                });
            }

            formData.append('participants', users);

            formData.append('image', blob, fileName);

            const uploadResponse = await axios.post(`/conversation/create/${userId}`, formData);

            const resultData = uploadResponse.data;
            Swal.fire({
                title: "Success",
                text: `Create a conversation with the name "${title.value}" successful. If you press "OK" we will redirect you to the conversation you just created!`,
                icon: "success",
                confirmButtonColor: '#707cd0',
            }).then(result => {
                if (result.isConfirmed) {
                    window.location.href = `/chat/${resultData.id}`
                }
                else {
                    reload(resultData.id);
                }
            });

        }

        uploadImage();
    });

    // Invite friends
    const socketFriendship = io('/friendship');

    // Create a new connect socketFriendship
    socketFriendship.on('connect', function () {
        socketFriendship.emit('login', { userId });
    });

    document.querySelector('#submit-invite-friends').addEventListener('click', function (event) {
        event.preventDefault();
        const user2Email = document.querySelector('#invite-email').value;
        const message = document.querySelector('#invite-message').value;
        socketFriendship.emit('friendRequest', { user1: email, user2: user2Email });

        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: `Friend request sent to ${user2Email}`,
            showConfirmButton: false,
            timer: 4100,
            toast: true
        })
    });

    socketFriendship.on('error', (error) => {
        Swal.fire({
            position: 'top-end',
            icon: 'error',
            title: error.message,
            showConfirmButton: false,
            timer: 4100,
            toast: true
        })
    });

    socketFriendship.on('newFriendRequest', (data) => {
        Swal.fire({
            title: 'New friend request!',
            text: data.message,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Accept',
            cancelButtonText: 'Decline'
        }).then((result) => {
            if (result.isConfirmed) {
                socketFriendship.emit('acceptFriendRequest', { user1: data.senderId, user2: +userId, isFriends: true });
            } else if (result.isDismissed) {
                socketFriendship.emit('acceptFriendRequest', { user1: data.senderId, user2: +userId, isFriends: false });
            }
        });
    });

    socketFriendship.on('friendAccepted', (data) => {
        const friendshipFirstElement = document.getElementById('friendship-first-element');
        const friendship2FirstElement = document.getElementById('friendship2-first-element');
        const friendship3FirstElement = document.getElementById('friendship3-first-element');
        const friendshipHTML = `
        <a href="../profile/${data.user.fullName}"
        data-chat-sidebar-toggle="#chat-${data.user.id}-user-profile"
        class="d-block text-reset mr-7 mr-lg-6">
        <div class="avatar avatar-sm avatar-online mb-3">
            <img class="avatar-img" src="/assets/images/avatars/user.png"
                alt="${data.user.fullName}'s photo">
        </div>
        <div class="small">${data.user.fullName}</div>
    </a>
        `
        friendshipFirstElement.insertAdjacentHTML(
            'afterend',
            friendshipHTML
        );

        const friendshipHTML2 = `
        <div class="card mb-6">
        <div class="card-body">

            <div class="media">

                <div class="avatar avatar-online mr-5">
                    <img class="avatar-img"
                        src="/assets/images/avatars/user.png"
                        alt="${data.user.fullName}">
                </div>
                <div class="media-body align-self-center mr-6">
                    <h6 class="mb-0">
                    ${data.user.fullName}</h6>
                    <small class="text-muted">Online</small>
                </div>

                <div class="align-self-center ml-auto">
                    <div class="custom-control custom-checkbox">
                        <input class="custom-control-input"
                            id="id-user-${data.user.id}"
                            type="checkbox">
                        <label class="custom-control-label"
                            for="id-user-${data.user.id}"></label>
                    </div>
                </div>
            </div>

        </div>

        <label class="stretched-label"
            for="id-user-${data.user.id}"></label>
    </div>`
        friendship2FirstElement.insertAdjacentHTML(
            'beforeend',
            friendshipHTML2
        );

        const friendshipHTML3 = `
        <div class="card mb-6">
        <div class="card-body">
            <div class="media">
                <div class="avatar avatar-online mr-5">
                    <img class="avatar-img" src="/assets/images/avatars/user.png"
                        alt="${data.user.fullName}">
                </div>
                <div class="media-body align-self-center">
                    <h6 class="mb-0">${data.user.fullName}
                    </h6>
                    <small class="text-muted">Online</small>
                </div>

                <div class="align-self-center ml-5">
                    <div class="dropdown z-index-max">
                        <a href="#"
                            class="btn btn-sm btn-ico btn-link text-muted w-auto"
                            data-toggle="dropdown" aria-haspopup="true"
                            aria-expanded="false">
                            <i class="fe-more-vertical"></i>
                        </a>
                        <div class="dropdown-menu">
                            <a class="dropdown-item d-flex align-items-center"
                                href="#">
                                New chat <span class="ml-auto fe-edit-2"></span>
                            </a>
                            <a class="dropdown-item d-flex align-items-center"
                                href="#">
                                Delete <span class="ml-auto fe-trash-2"></span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <a href="${data.user.fullName}"
                data-chat-sidebar-toggle="#chat-${data.user.id}-user-profile"
                class="stretched-link"></a>
        </div>
    </div>
        `
        friendship3FirstElement.insertAdjacentHTML(
            'beforeend',
            friendshipHTML3
        );

        Swal.fire({
            title: data.message,
            icon: 'info',
            position: 'top-end',
            showConfirmButton: false,
            timer: 4100,
            toast: true,
        })
    });

    // Chat
    const socketChat = io('/chat');

    // Join conversation
    if (conversationId.length > 10) {
        socketChat.emit('joinConversation', conversationId);
    }

    const text = document.getElementById('chat-id-1-input');
    const messages = document.getElementById('messages');
    const firstElement = document.getElementById('first-element');
    const conversationsFirstElement = document.getElementById('conversations-first-element');
    const submitBtn = document.getElementById('submit-btn');

    scrollToActive(messages);

    // Catch event when clicked keydown
    if (text) {
        text.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                handleSubmitMessage();
                scrollToActive(messages);
            }
        });

        submitBtn.addEventListener("click", function (event) {
            event.preventDefault();
            handleSubmitMessage();
            scrollToActive(messages);
        });
    }

    //Scroll to active messages
    function scrollToActive(event) {
        setTimeout(() => {
            event.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            })
        }, 500)
    }

    const handleSubmitMessage = (conversation, senderId, message, currentFullName) => {
        socketChat.emit('message', {
            conversation: conversationId,
            senderId: userId,
            message: text.value,
            currentFullName: fullName,
        });
        cleanMessage(text);
    };

    socketChat.on('message', (data) => {
        handleNewMessage(data.message, data.senderId, data.currentFullName);
        scrollToActive(messages);
    });

    const handleNewMessage = (message, senderId, currentFullName) => {
        buildNewMessage(message, senderId, currentFullName);
    };
    const buildNewMessage = (message, senderId, currentFullName) => {
        const currentUser = `<div class="message message-right">
        <!-- Avatar -->
        <div class="avatar avatar-sm ml-4 ml-lg-5 d-none d-lg-block">
            <img class="avatar-img" src="/assets/images/avatars/user.png" alt="">
        </div>
    
        <!-- Message: body -->
        <div class="message-body">
    
            <!-- Message: row -->
            <div class="message-row">
                <div class="d-flex align-items-center justify-content-end">
    
                    <!-- Message: dropdown -->
                    <div class="dropdown">
                        <a class="text-muted opacity-60 mr-3" href="#" data-toggle="dropdown" aria-haspopup="true"
                            aria-expanded="false">
                            <i class="fe-more-vertical"></i>
                        </a>
    
                        <div class="dropdown-menu">
                            <a class="dropdown-item d-flex align-items-center" href="#">
                                Edit <span class="ml-auto fe-edit-3"></span>
                            </a>
                            <a class="dropdown-item d-flex align-items-center" href="#">
                                Share <span class="ml-auto fe-share-2"></span>
                            </a>
                            <a class="dropdown-item d-flex align-items-center" href="#">
                                Delete <span class="ml-auto fe-trash-2"></span>
                            </a>
                        </div>
                    </div>
                    <!-- Message: dropdown -->
    
                    <!-- Message: content -->
                    <div class="message-content bg-primary text-white">
                        <div>${message}</div>
    
                        <div class="mt-1">
                            <small class="opacity-65">1 minute ago</small>
                        </div>
                    </div>
                    <!-- Message: content -->
    
                </div>
            </div>
        </div>
        <!-- Message: body -->
    </div>`;
        const otherUser = `
        <div class="message">
        <!-- Avatar -->
        <a class="avatar avatar-sm mr-4 mr-lg-5" href="#"
            data-chat-sidebar-toggle="#chat-${senderId}-user-profile">
            <img class="avatar-img" src="/assets/images/avatars/user.png" alt="">
        </a>
    
        <!-- Message: body -->
        <div class="message-body">
    
            <!-- Message: row -->
            <div class="message-row">
                <div class="d-flex align-items-center">
    
                    <!-- Message: content -->
                    <div class="message-content bg-light">
                        <h6 class="mb-2">${currentFullName}</h6>
                        <div>${message}</div>
    
                        <div class="mt-1">
                            <small class="opacity-65">1 minute ago</small>
                        </div>
                    </div>
                    <!-- Message: content -->
                </div>
            </div>
            <!-- Message: row -->
    
        </div>
        <!-- Message: Body -->
    </div>
          `;
        return firstElement.insertAdjacentHTML(
            'beforeend',
            userId == senderId ? currentUser : otherUser,
        );
    };

    const cleanMessage = (message) => {
        return (message.value = '');
    };

    socketChat.on('error', (error) => {
        Swal.fire({
            position: 'top-end',
            icon: 'error',
            title: error.message,
            showConfirmButton: false,
            timer: 4100,
            toast: true
        })
    });

    // Hidden Settings
    document.querySelector('a[href="#tab-settings-chat"]').addEventListener('click', function () {
        var tabSettingsChat = document.getElementById('tab-settings-chat');
        var tabChatCloudy = document.getElementById('tab-chat-cloudy');
        if (tabSettingsChat.hasAttribute('hidden')) {
            tabSettingsChat.removeAttribute('hidden');
            tabChatCloudy.setAttribute('hidden', true);
        } else {
            tabSettingsChat.setAttribute('hidden', true);
            tabChatCloudy.removeAttribute('hidden');
        }
    });

    // Edit Profile
    const form = document.querySelector('#edit-profile');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const fullName = document.querySelector('#profile-name').value;
        const email = document.querySelector('#profile-email').value;
        const data = { fullName, email };
        try {
            const response = await axios.patch('/profile/edit', data);
            Swal.fire({
                position: 'top-end',
                title: response.data.message,
                icon: "success",
                showConfirmButton: false,
                timer: 4100,
                toast: true,
            });
        } catch (error) {
            Swal.fire({
                position: 'top-end',
                title: error,
                icon: "error",
                showConfirmButton: false,
                timer: 4100,
                toast: true,
            });
        }
    });

    // Edit Password
    // const formPassword = document.querySelector('#edit-password');
    // formPassword.addEventListener('submit', async (event) => {
    //     event.preventDefault();
    //     const currentPassword = document.querySelector('#current-password').value;
    //     const password = document.querySelector('#new-password').value;
    //     const verifyPassword = document.querySelector('#verify-password').value;
    //     if(password!==verifyPassword){
    //         Swal.fire({
    //             position: 'top-end',
    //             title: 'New password and verification password are not the same',
    //             icon: "error",
    //             showConfirmButton: false,
    //             timer: 4100,
    //             toast: true,
    //         });
    //         return;
    //     }
    //     const data = { currentPassword, password };
    //     try {
    //         const response = await axios.patch('/profile/edit', data);
    //         Swal.fire({
    //             position: 'top-end',
    //             title: 'Successfully updated!',
    //             icon: "success",
    //             showConfirmButton: false,
    //             timer: 4100,
    //             toast: true,
    //         });
    //     } catch (error) {
    //         Swal.fire({
    //             position: 'top-end',
    //             title: error,
    //             icon: "error",
    //             showConfirmButton: false,
    //             timer: 4100,
    //             toast: true,
    //         });
    //     }
    // });

    // Conversation
    // const socketConversation = io('/conversation');
    // socketConversation.on('handleNotification', (payload) => {
    //     console.log('data: ' + payload.conversation)
    //     Swal.fire({
    //         title: 'Created a new group',
    //         text: payload.conversation.id,
    //         icon: 'info',
    //         showCancelButton: true,
    //         confirmButtonText: 'Accept',
    //         cancelButtonText: 'Decline'
    //     })
    // })
    socketFriendship.on('handleNotification', (payload) => {
        // Swal.fire({
        //     title: 'A new conversation!',
        //     text: `${payload.conversation.creatorId.fullName} added you to a conversation named ${payload.conversation.title}`,
        //     icon: 'info',
        //     confirmButtonText: 'Accept',
        // }).then((result) => {
        //     if (result.isConfirmed) {
        //         window.location.href = `/chat/${payload.conversation.id}`;
        //     } else if (result.isDismissed) {
        //         window.location.href = `/chat/${payload.conversation.id}`;
        //     }
        // });

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: "info",
            showConfirmButton: false,
            confirmButtonText: 'Go to',
            onOpen: () => {
                navigator.vibrate([200, 100, 200]);
            },
            // preConfirm: () => {
            //     window.location.href = `/chat/${payload.conversation.id}`;
            // },
            timer: 4100,
            title: `${payload.conversation.creatorId.fullName} added you to ${payload.conversation.title} 🤍`
        });

        const conversationHTML = `<a class="text-reset nav-link p-0 mb-6" href="${payload.conversation.id}">
        <div class="card card-active-listener">
            <div class="card-body">
                <div class="media">
                    <div class="avatar mr-5">
                        <img class="avatar-img" src="/images/${payload.conversation.image}"
                            alt="Cloudy">
                    </div>
                    <div class="media-body overflow-hidden">
                        <div class="d-flex align-items-center mb-1">
                            <h6 class="text-truncate mb-0 mr-auto">${payload.conversation.title}
                            </h6>
                            <p class="small text-muted text-nowrap ml-4">
                                Waiting...
                            </p>
                        </div>
                        <div class="text-truncate">
                            Enter a new message ❤
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </a>`

        conversationsFirstElement.insertAdjacentHTML(
            'beforeend',
            conversationHTML
        );
    })

    // Upload files
    // const fileInput = document.querySelector('#file-input');
    // const uploadButton = document.querySelector('#chat-upload-btn-1');

    // uploadButton.addEventListener('click', () => {
    //     fileInput.click();
    // });

    // fileInput.addEventListener('change', () => {
    //     const files = Array.from(fileInput.files);
    //     const readers = files.map((file) => {
    //         const reader = new FileReader();
    //         reader.readAsDataURL(file);
    //         return reader;
    //     });

    //     Promise.all(readers.map((reader) => new Promise((resolve) => {
    //         reader.onload = () => resolve(reader.result);
    //     }))).then((results) => {
    //         socketChat.emit('sendFiles', results);
    //     });
    // });
});

// Search messages
function searchOnPage(event) {
    event.preventDefault();
    const keyword = document.getElementById('searchInput').value;
    const keyword2 = document.getElementById('searchInput2').value;
    const keyword3 = document.getElementById('searchInput3').value;
    const keyword4 = document.getElementById('searchInput4').value;
    const keyword5 = document.getElementById('searchInput5').value;
    const keyword6 = document.getElementById('searchInput6').value;

    const messages = document.querySelectorAll('.message');
    const media = document.querySelectorAll('.mb-0');

    const markInstance = new Mark(messages);
    const markInstance2 = new Mark('.message, .media');
    const markInstance3 = new Mark(media);

    markInstance.unmark();
    markInstance2.unmark();

    markInstance.mark(keyword);
    markInstance2.mark(keyword2);
    markInstance2.mark(keyword3);
    markInstance2.mark(keyword4);
    markInstance3.mark(keyword5);
    markInstance2.mark(keyword6);
}

function reload(id) {
    document.querySelector('.icon-lg.fe-refresh-cw').style.color = 'brown';

    document.querySelector('.nav-item-reload').addEventListener('click', () => {
        window.location.href = `/chat/${id}`;
    });
}

function logout(event) {
    event.preventDefault();
    window.location.href = '/logout';
}

