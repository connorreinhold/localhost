import React, { Component } from 'react';
import {
    AsyncStorage, View, Button, Text,
    Dimensions, Animated
} from 'react-native'
import DropdownAlert from 'react-native-dropdownalert';
import { Constants, Location, Permissions, Notifications } from 'expo'


const heightPixel = (Dimensions.get('window').height) / (667);
const widthPixel = (Dimensions.get('window').width) / (375);


class main extends Component {
    constructor (props) {
        super(props)
        this.state = {
            notification: {},
            notificationZIndex: -1
        }
    }

    async componentDidMount () {
        this._notificationSubscription = Notifications.addListener(this._handleNotification);
    }
    _handleNotification = (notification) => {

        if (global.viewingChatEventId != null && notification.data.messageEventId === global.viewingChatEventId) {
            // Don't display a notification
        }
        else {
            this.setState({ notificationZIndex: 3 }, () => {
                this.dropdown.alertWithType('custom', notification.data.title, notification.data.body)
            })
        }
    }

    render () {
        return (
            <View style={{ zIndex: this.state.notificationZIndex, position: 'absolute', width: '100%', height: 100 }}>
                <DropdownAlert
                    ref={ref => this.dropdown = ref}
                    imageSrc={require('../../assets/icon.png')}
                    containerStyle={{ backgroundColor: 'rgb(60,120,200)', width: '100%', height: 90, padding: 16 }}
                    onClose={() => { this.setState({ notificationZIndex: -1 }) }}
                />
            </View>
        )

    }
}
export default main;
