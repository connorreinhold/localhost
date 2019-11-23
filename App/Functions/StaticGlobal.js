export default class StaticGlobal{
    static database_url = "http://10.129.0.47:4000"
}
 
// Things that are global (accessed with global.<var>)
// global.email - email which is the username
// global.session_id - token for the user
// global.myLatitude
// global.myLongitude
// global.viewingChatEventId - null if not viewing a chat, 
// the eventId of the message chat if it is currently open
// global._setLoggedIn - method to control whether the user is logged in or not (takes a boolean)
// global.name - name of the user (needed for calculating anonymous views)