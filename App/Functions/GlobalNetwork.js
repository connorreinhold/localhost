
import StaticGlobal from './StaticGlobal'

// Fetch the profile name for later user in showing anonymous pictures
export function _retrieveProfileName () {
    fetch(StaticGlobal.database_url + '/getUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token: global.session_id,
            email: global.email
        }),
    }).then(function (response) {
        return response.json()
    }).then(function (response) {
        let profileResponse = response
        if (profileResponse.isSuccess) {
            let name = profileResponse.value.firstName + " " + profileResponse.value.lastName
            global.profile_name = name;
        }
    }.bind(this));
}