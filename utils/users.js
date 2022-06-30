const usersRoom = [];

// Join user to chat
function userJoin(id, username, room_name) {
    const user = { id, username, room_name };

    //======== remove the user if already in some other group ============
    const indexx = usersRoom.findIndex(user => user.id === id);
    if (indexx !== -1) {
        usersRoom.splice(indexx, 1)[0];
    }
    //======== remove the user if already in some other group ============

    usersRoom.push(user);

    return user;
}

// Get current user
function getCurrentUser(id) {
    return usersRoom.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
    const index = usersRoom.findIndex(user => user.id === id);

    if (index !== -1) {
        return usersRoom.splice(index, 1)[0];
    }
}

// Get room users
function getRoomUsers(room_name) {
    return usersRoom.filter(user => user.room_name === room_name);
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
};