const avatarArray = [
    require("../../assets/avatars/avatar1.png"),
    require("../../assets/avatars/avatar2.png"),
    require("../../assets/avatars/avatar3.png"),
    require("../../assets/avatars/avatar4.png"),
    require("../../assets/avatars/avatar5.png"),
    require("../../assets/avatars/avatar6.png"),
    require("../../assets/avatars/avatar7.png"),
    require("../../assets/avatars/avatar8.png"),
    require("../../assets/avatars/avatar9.png"),
    require("../../assets/avatars/avatar10.png"),
    require("../../assets/avatars/avatar11.png"),
    require("../../assets/avatars/avatar12.png"),
    require("../../assets/avatars/avatar13.png"),
    require("../../assets/avatars/avatar14.png")
]

export function _getAnonAvatar(eventName) {
    let finalVal = 0;
    for(var i = 0; i < eventName.length; i++ ) {
        finalVal += eventName.charAt(i).charCodeAt(0)
    }
    let avatarNum = finalVal % avatarArray.length
    return avatarArray[avatarNum]
}

export function _getAvatar(name, avatarNum) {
    let finalVal = 0;
    if (avatarNum === 1) {
        for(var i = 0; i < name.length; i++ ) {
            finalVal += 3*name.charAt(i).charCodeAt(0)
        }
    }
    else if (avatarNum === 2) {
        for(var i = 0; i < name.length; i++ ) {
            finalVal += 5*name.charAt(i).charCodeAt(0)
        }
    }
    else if (avatarNum === 3) {
        for(var i = 0; i < name.length; i++ ) {
            finalVal += 7*name.charAt(i).charCodeAt(0)
        }
    }
    else if (avatarNum === 4) {
        for(var i = 0; i < name.length; i++ ) {
            finalVal += 11*name.charAt(i).charCodeAt(0)
        }
    }
    let pictureNum = finalVal % avatarArray.length
    return avatarArray[pictureNum]
}