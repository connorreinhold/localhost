import React, { Component } from 'react';
import {
    Dimensions,
    Text,
    View,
    TextInput,
    Platform,
    ActivityIndicator
} from 'react-native'
import { Header, SafeAreaView } from 'react-navigation'

import { Font } from 'expo'
import { GiftedChat, Message, Bubble, Avatar, Composer, Send } from 'react-native-gifted-chat';
import { getTopBarColor } from '../Functions/ColorFuncs.js'
import { Icon } from 'react-native-elements'
import StaticGlobal from '../Functions/StaticGlobal.js'

const heightPixel = (Dimensions.get('window').height) / (667);
const widthPixel = (Dimensions.get('window').width) / (375);

export default class Messaging extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: "",
            headerTintColor: 'white',
            headerStyle: {
                backgroundColor: getTopBarColor()
            },
        }
    }
    constructor (props) {
        super(props);
        this.state = {
            isLoading: true,
            messages: [],
            messageText: "",
        };
        this._isMounted = false
        this.refreshTimer = null
        this._onSend = this._onSend.bind(this);
    }
    componentWillMount () {
        this.setState({
            messages: [
            ],
            guests: [
            ],
            userMe: {
                _id: -1,
                name: "Not Connected",
                avatar: ""
            }
        });
    }
    componentDidMount () {
        this._isMounted = true
        global.viewingChatEventId = this.props.navigation.state.params.eventId
        this._loadEventGuests()

    }

    componentWillUnmount () {
        global.viewingChatEventId = null
        clearInterval(this.refreshTimer)
        this._isMounted = false
    }

    _addGuestPictures (guests) {
        let guestIds = guests.map(function (guest) { return guest.id })
        fetch(StaticGlobal.database_url + "/getPictures", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                email: global.email,
                userIds: guestIds
            })
        }).then(function(response) {
            return response.json()
        }).then(function (response) {
            let myResponse = response
            if (myResponse.isSuccess && this._isMounted) {
                let updated_guests = guests
                for (let i = 0; i < updated_guests.length; i++) {
                    let guestIndex = myResponse.imageOrder.indexOf(updated_guests[i].id)
                    updated_guests[i].guestPic = myResponse.imageData[guestIndex]
                }
                this.setState({
                    guests: updated_guests
                }, () => {
                    this._getMyInformation()
                })
            }
        }.bind(this))
    }

    _guestsFromJson (toParse) {
        let guestList = []
        for (let i = 0; i < toParse.length; i++) {
            let newGuest = {
                guestName: toParse[i].firstName + " " + toParse[i].lastName,
                guestPic: "",
                id: toParse[i]._id
            }
            guestList.push(newGuest)
        }
        return guestList
    }

    // creating a mapping system of names, ids, and pictures to be used for the chat system
    _loadEventGuests () {
        this.setState({ isLoading: true })
        fetch(StaticGlobal.database_url + '/getEventAttendees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                email: global.email,
                eventId: this.props.navigation.state.params.eventId
            })
        }).then(function(response) {
            return response.json()
        }).then(function (response) {
            let getAttendeesResponse = response
            if (getAttendeesResponse.isSuccess && this._isMounted) {
                let toParse = getAttendeesResponse.value
                this.setState({
                    guests: this._guestsFromJson(toParse)
                }, () => {
                    this._addGuestPictures(this.state.guests)
                })
            }
        }.bind(this))
    }

    _readMessages () {
        // Remove message notification upon visiting the messaging page
        fetch(StaticGlobal.database_url + '/readMessages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                email: global.email,
                eventId: this.props.navigation.state.params.eventId,
            })
        }).then(function(response) {
            return response.json()
        }).then(function (response) {
            let messageResponse = response
            if (messageResponse.isSuccess && this._isMounted) {
                this.props.navigation.state.params._updateMessagesViewed(this.props.navigation.state.params.eventId)
            }
        }.bind(this))
    }
    _onSend (message) {
        this.setState({ messageText: "" })
        fetch(StaticGlobal.database_url + '/sendMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                email: global.email,
                eventId: this.props.navigation.state.params.eventId,
                messageBody: message[0].text,
                messageTime: message[0].createdAt
            })
        }).then(function(response) {
            return response.json()
        }).then(function (response) {
            let messageResponse = response
            if (messageResponse.isSuccess && this._isMounted) {
                this.setState({
                    messages: GiftedChat.append(this.state.messages, message),
                })
            }
        }.bind(this))
    }

    _getGuestFromId (userId) {
        for (let i = 0; i < this.state.guests.length; i++) {
            if (this.state.guests[i].id === userId) {
                return this.state.guests[i]
            }
        }
        return {
            id: userId,
            guestName: "!!",
            guestPic: "",
        }
    }
    _parseMessagesFromJson (messages) {
        let updatedMessages = []
        if (messages.length > 0) {
            for (let i = 0; i < messages.length; i++) {
                let senderData = this._getGuestFromId(messages[i].userId)
                let newMessage = {
                    _id: i,
                    text: messages[i].textBody,
                    createdAt: new Date(messages[i].createdAt),
                    user: {
                        _id: senderData.id,
                        name: senderData.guestName,
                        avatar: `data:image/gif;base64,${senderData.guestPic}`
                    },
                }
                updatedMessages.push(newMessage)
            }
            this.setState({
                isLoading: false,
                messages: updatedMessages
            })

        }
        else {
            this.setState({
                isLoading: false
            })

        }
    }

    _onRefresh () {
        fetch(StaticGlobal.database_url + '/getMessages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                email: global.email,
                eventId: this.props.navigation.state.params.eventId
            })
        }).then(function(response) {
            return response.json()
        }).then(function (response) {
            let messageResponse = response
            if (messageResponse.isSuccess && this._isMounted) {
                this._parseMessagesFromJson(messageResponse.value)
                this._readMessages()
            }
        }.bind(this));
    }

    _renderMessage (props) {
        return (
            <Message
                {...props} />
        )
    }
    _renderBubble (props) {
        return (
            <Bubble
                wrapperStyle={{
                    right: {
                        backgroundColor: getTopBarColor()
                    },
                    left: {
                        backgroundColor: 'rgb(235,243,250)'
                    },
                }}
                textStyle={{
                    right: {
                        color: "white",
                        fontWeight: '700',
                        fontFamily: 'Montserrat',
                        fontSize: 14
                    },
                    left: {
                        color: "rgb(55,50,50)",
                        fontWeight: '700',
                        fontFamily: 'Montserrat',
                        fontSize: 14
                    }
                }}
                {...props} />
        )
    }
    _renderComposer (props) {
        return (
            <Composer
                {...props}
                text={this.state.messageText}
                onTextChanged={(text) => {
                    this.setState({ messageText: text })

                }}
                textInputStyle={{
                    fontFamily: 'Montserrat',
                    fontSize: 14 * widthPixel,
                    fontWeight: '700',
                    color: 'rgb(55,50,50)',
                    lineHeight: 20 * widthPixel
                }}
            />
        )
    }

    _renderSend (props) {
        return (
            <Send
                {...props}
                text={this.state.messageText}
            >
                <View style={{
                    height: '100%',
                    width: 50 * widthPixel,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <View style={{
                        borderRadius: 15 * widthPixel,
                        width: 27 * widthPixel,
                        height: 27 * widthPixel,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: getTopBarColor(),
                    }}>

                        <Icon
                            name="arrow-up"
                            type="font-awesome"
                            size={17 * widthPixel}
                            color='white'
                        />
                    </View>
                </View>
            </Send>
        )
    }

    _getMyInformation () {
        fetch(StaticGlobal.database_url + '/getUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                email: global.email,
            })
        }).then(function(response) {
            return response.json()
        }).then(function (response) {
            let userResponse = response
            if (userResponse.isSuccess && this._isMounted) {
                let myId = userResponse.value._id
                let guestInfo = this._getGuestFromId(myId)
                this.setState({
                    userMe: {
                        _id: guestInfo.id,
                        name: guestInfo.guestName,
                        avatar: `data:image/gif;base64,${guestInfo.guestPic}`
                    }
                }, () => {
                    this._onRefresh()
                    this.refreshTimer = setInterval(this._onRefresh.bind(this), 2000)
                })
            }
        }.bind(this));
    }

    _onPressAvatar (user) {
        this.props.navigation.navigate({
            routeName: 'Profile',
            params: { userId: user._id },
            key: Math.random() * 10000,
            // key allows react-native to differentiate between different instances of the same route
        })
    }
    _isIphoneX () {
        const { width, height } = Dimensions.get('window');
        return (
            Platform.OS === 'ios' &&
            !Platform.isPad &&
            !Platform.isTVOS &&
            ((height === 812 || width === 812) || (height === 896 || width === 896))
        );
    }
    render () {
        return (
            <View style={{ width: '100%', height: '100%' }}>
                {this.state.isLoading ?
                    <View style={{ position: 'absolute', width: '100%', height: '90%', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={'#999999'} />
                    </View>
                    :
                    <View />
                }
                <GiftedChat
                    messages={this.state.messages}
                    onSend={this._onSend}
                    user={
                        this.state.userMe
                    }
                    listViewProps={{
                        refreshing: false,
                        onRefresh: this._onRefresh.bind(this)
                    }}
                    isAnimated={true}
                    keyboardShouldPersistTaps={'handled'}
                    refreshing={false}
                    bottomOffset={this._isIphoneX() ? 82 : 46}
                    renderMessage={this._renderMessage.bind(this)}
                    renderBubble={this._renderBubble.bind(this)}
                    renderComposer={this._renderComposer.bind(this)}
                    renderSend={this._renderSend.bind(this)}
                    onPressAvatar={this._onPressAvatar.bind(this)}
                />
            </View>
        );
    }
}