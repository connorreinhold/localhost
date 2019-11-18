import React, { Component } from 'react';
import { AsyncStorage, View, Button, Text } from 'react-native'
import EventListings from './Screens/EventListings.js'
import * as Font from 'expo-font';
import { getRootNavigator } from './AppNavigator.js'
import { Constants, Location, Permissions, Notifications } from 'expo'
import getPermission from './Functions/getPermission';
import StaticGlobal from './Functions/StaticGlobal'
import NotificationFromTop from './Components/NotificationFromTop'

class main extends Component {
    async componentDidMount () {
        await Font.loadAsync({
            'Montserrat': require('../assets/fonts/Montserrat-Medium.ttf'),
        })
    }
    constructor (props) {
        super(props)
        this.state = {
            loggedIn: false,
            loading: true,
        }
        this.updatedData = false
        this._setLoggedIn = this._setLoggedIn.bind(this)
        global._setLoggedIn = this._setLoggedIn
    }

    _setLoggedIn (loggedIn) {
        this.setState({
            loggedIn: loggedIn,
        })
        this.updatedData = false
    }

    async componentWillMount () {
        AsyncStorage.getItem('myLongitude', (err, longitude) => {
            AsyncStorage.getItem('myLatitude', (err, latitude) => {
                global.myLongitude = parseFloat(longitude)
                global.myLatitude = parseFloat(latitude)
            });
        });
        AsyncStorage.getItem('token', (err, token) => {
            AsyncStorage.getItem('email', (err, email) => {
                loggedIn = false
                if (token != null && email != null) {
                    global.session_id = token
                    global.email = email
                    loggedIn = true
                }
                this.setState({
                    loggedIn: loggedIn,
                    loading: false
                })
            });
        });
    }

    _updateLocationAsync = async () => {
        const status = await getPermission(Permissions.LOCATION);
        if (status) {
            let location = await Location.getCurrentPositionAsync({
            });
            global.myLatitude = location.coords.latitude
            global.myLongitude = location.coords.longitude
            AsyncStorage.setItem('myLatitude', global.myLatitude + "", () => {
                AsyncStorage.setItem('myLongitude', global.myLongitude + "", () => {
                    this._registerForPushNotificationsAsync()
                })
            });
        }
    };

    _registerForPushNotificationsAsync = async () => {
        const { status: existingStatus } = await Permissions.getAsync(
            Permissions.NOTIFICATIONS
        );
        let finalStatus = existingStatus;

        // only ask if permissions have not already been determined, because
        // iOS won't necessarily prompt the user a second time.
        if (existingStatus !== 'granted') {
            // Android remote notification permissions are granted during the app
            // install, so this will only ask on iOS
            const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
            finalStatus = status;
        }

        // Stop here if the user did not grant permissions
        if (finalStatus !== 'granted') {
            this._updateToken("")
            return;
        }

        // Get the token that uniquely identifies this device
        let pushToken = await Notifications.getExpoPushTokenAsync();
        this._updateToken(pushToken)
    };
    _updateToken (pushToken) {
        fetch(StaticGlobal.database_url + '/pushToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: global.email,
                token: global.session_id,
                pushToken: pushToken
            }),
        }).then(function (response) {
            let updateTokenResponse = JSON.parse(response._bodyInit);
            this.updatedData = true
        }.bind(this));
    }

    render () {
        if (this.state.loading) {
            return (<View />)
        }
        else {
            if (this.state.loggedIn) {
                if (!this.updatedData) {
                    this._updateLocationAsync()
                }
            }
            else {
                if(!this.updatedData) {
                    this._updateToken("")
                }
            }
            const RootNavigator = getRootNavigator(this.state.loggedIn);
            return (
                <View style={{ width: '100%', height: '100%' }}>
                    <NotificationFromTop/>
                    <RootNavigator />
                </View>
            )

        }
    }
}
export default main;
