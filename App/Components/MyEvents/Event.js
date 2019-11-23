import React, { Component } from 'react'
import { Text, View, Image, StyleSheet, Dimensions, TouchableWithoutFeedback, TouchableOpacity, Animated } from 'react-native'
import { Icon } from 'react-native-elements'
import CircleBar from '../CircleBar.js'
import { getTopBarColor, dimCalculate, Calculate } from '../../Functions/ColorFuncs.js';
import StaticGlobal from '../../Functions/StaticGlobal.js';

import { _getAvatar, _getAnonAvatar } from '../../Functions/AvatarGen'


const heightPixel = (Dimensions.get('window').height) / (667);
const widthPixel = (Dimensions.get('window').width) / 375;

const circle_radius = 27 * widthPixel
const component_width = 319 * widthPixel
const msg_size = 26 * heightPixel
export default class Event extends Component {
    constructor (props) {
        super(props)
        this.state = {
            largerExpandedHeight: 999,
            nonExpandedHeight: 9999,
            expanded: true,
            animating: false,
            showConfirmDelete: false,
            deleteBoxOpacity: new Animated.Value(0),
            fadeAnim: new Animated.Value(1),
            heightAnim: new Animated.Value(),
            expandedAnim: new Animated.Value(),
            spinAnim: new Animated.Value(0),
            initializedExpandedAnim: false,
            initializedHeightAnim: false,
        }
    }

    componentDidMount () {
        this._mounted = true
    }
    componentWillUnmount () {
        this._mounted = false
    }
    _setMaxHeight (event) {
        if (this._mounted) {
            if (this.state.largerExpandedHeight == 999) {
                this.setState({
                    largerExpandedHeight: event.nativeEvent.layout.height,
                }, () => {
                    this.state.expandedAnim.setValue(0)
                    this.setState({
                        initializedExpandedAnim: true,
                        expanded: false,
                    })

                })
            }
        }
    }

    _setNonExpandedHeight (event) {
        if (this._mounted) {
            if (event.nativeEvent.layout.height < this.state.nonExpandedHeight) {
                this.setState({
                    nonExpandedHeight: event.nativeEvent.layout.height,
                })
            }
        }
    }

    _expandText () {
        if (!this.state.animating) {
            this.setState({ animating: true })
            if (this.state.expanded) {
                this.setState({
                    expanded: false,
                }, () => {
                    Animated.spring(
                        this.state.spinAnim,
                        {
                            friction: 3,
                            tension: 8,
                            toValue: 0,
                        }
                    ).start()
                    Animated.timing(
                        this.state.expandedAnim,
                        {
                            toValue: 0,
                            duration: 200
                        }
                    ).start(() => { this.setState({ animating: false }) })
                })
            }
            else {
                Animated.spring(
                    this.state.spinAnim,
                    {
                        friction: 3,
                        tension: 8,
                        toValue: 1,
                    }
                ).start()
                Animated.timing(
                    this.state.expandedAnim,
                    {
                        toValue: this.state.largerExpandedHeight,
                        duration: 200
                    }
                ).start(() => {
                    this.setState({
                        expanded: true,
                        animating: false
                    })
                }
                )
            }
        }
    }
    _renderMessageNotification (unseenMessages) {
        if (unseenMessages > 0) {
            return (
                <View style={{ position: 'absolute', right: -2 * widthPixel, top: -2 * heightPixel }}>
                    <View style={{ backgroundColor: 'rgb(120,200,255)', width: 18 * widthPixel, height: 18 * widthPixel, borderRadius: 9 * widthPixel, justifyContent: 'center', alignItems: 'center' }}>
                        <View>
                            <Text style={{ fontSize: 10 * widthPixel, fontFamily: 'Avenir', color: 'white', fontWeight: '900' }}>
                                {unseenMessages}
                            </Text>
                        </View>
                    </View>
                </View>
            )
        }
    }

    _executeRemoveAnimation (_removeEventUI, eventId) {
        Animated.timing(
            this.state.fadeAnim,
            {
                toValue: 0,
                duration: 300
            }).start(() => {
                this.state.heightAnim.setValue(this.state.largerExpandedHeight + this.state.nonExpandedHeight)
                this.setState({
                    initializedHeightAnim: true
                }, () => {
                    Animated.timing(
                        this.state.heightAnim,
                        {
                            toValue: 0,
                            duration: 300
                        }
                    ).start(() => {
                        _removeEventUI(eventId)
                    })
                })
            })
    }

    _deleteEvent (eventId, _removeEventUI) {
        fetch(StaticGlobal.database_url + '/deleteEvent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                email: global.email,
                eventId: eventId
            })
        }).then(function (response) {
            return response.json();
        })
            .then(function (response) {
                let deleteResponse = response;
                if (deleteResponse.isSuccess) {
                    this._executeRemoveAnimation(_removeEventUI, eventId)
                }
            }.bind(this));
    }

    _leaveEvent (eventId, _removeEventUI) {
        fetch(StaticGlobal.database_url + '/leaveEvent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                email: global.email,
                eventId: eventId
            })
        }).then(function (response) {
            return response.json();
        }).then(function (response) {
            let leaveResponse = response;
            if (leaveResponse.isSuccess) {
                this._executeRemoveAnimation(_removeEventUI, eventId)
            }
        }.bind(this));
    }
    _openDeletePage () {
        this.setState({
            showConfirmDelete: true
        }, () => {
            Animated.timing(
                this.state.deleteBoxOpacity,
                {
                    toValue: 1,
                    duration: 300
                }).start()
        })
    }
    _closeDeletePage () {
        Animated.timing(
            this.state.deleteBoxOpacity,
            {
                toValue: 0,
                duration: 300
            }).start(() => {
                this.setState({
                    showConfirmDelete: false
                })
            })

    }

    _renderExpandedDetails (location, description, hosting, eventId, unseenApplications) {
        return (
            <View style={{ width: '100%' }}>
                <Text style={styles.locationFont}>
                    {location}
                </Text>
                {description.length > 0 ?
                    <View style={{ width: '100%' }}>
                        <View style={{ height: 15 * heightPixel }} />
                        <Text style={styles.descriptionFont}>
                            {description}
                        </Text>
                        <View style={{ height: 25 * heightPixel }} />
                    </View>
                    : <View />}
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
                    {hosting ?
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={() => {
                                this.props.navigation.navigate({
                                    routeName: 'Applications',
                                    params: {
                                        _updateApplicationsViewed: this.props._updateApplicationsViewed,
                                        _onEventChange: this.props._onEventChange,
                                        eventId: eventId,
                                        numPeople: this.props.guests.length,
                                        maxPeople: this.props.maxPeople,
                                    },
                                })
                            }}>
                                <View style={{ flexDirection: 'row' }}>
                                    {unseenApplications > 0 ?
                                        <View style={{ position: 'absolute', right: -3 * widthPixel, top: -2 * widthPixel, height: 10 * widthPixel, width: 10 * widthPixel, borderRadius: 5 * widthPixel, borderWidth: 3 * widthPixel, borderColor: "rgb(120,200,255)", backgroundColor: "white", zIndex: 3 }}>
                                        </View> : <View />
                                    }
                                    <Icon
                                        name="id-card"
                                        type="font-awesome"
                                        color="rgb(200,120,255)"
                                        size={22 * widthPixel}
                                    />
                                </View>
                            </TouchableOpacity>
                            <View style={{ width: 40 * widthPixel }} />
                        </View>
                        : <View />
                    }
                    <TouchableOpacity onPress={() => {
                        this.props._launchModal(eventId, this.props.title)
                    }}>
                        <Icon
                            name="paper-plane-o"
                            type="font-awesome"
                            color="rgb(120,200, 255)"
                            size={23.5 * widthPixel}
                        />
                    </TouchableOpacity>
                    {
                        hosting ? <View style={{ width: 70 * widthPixel }} />
                            :
                            <View style={{ width: 120 * widthPixel }} />
                    }
                    {hosting ?
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={() => {
                                this.props.navigation.navigate({
                                    routeName: 'CreateEvent',
                                    params: {
                                        editing: true,
                                        eventId: eventId,
                                        _onEventChange: this.props._onEventChange
                                    },
                                })
                            }}>
                                <Icon
                                    name="dashboard"
                                    type="font-awesome"
                                    color="rgba(0,130,130, 0.5)"
                                    size={26.5 * widthPixel}
                                />
                            </TouchableOpacity>
                            <View style={{ width: 40 * widthPixel }} />
                        </View>
                        : <View />
                    }
                    <TouchableOpacity onPress={this._openDeletePage.bind(this)}>
                        <Icon
                            name={hosting ? "trash" : "hand-peace-o"}
                            type="font-awesome"
                            color="rgba(209,0,0, 0.5)"
                            size={28 * widthPixel}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
    render () {
        let title = this.props.title
        let time = this.props.time
        let description = this.props.description
        let privacySetting = this.props.privacySetting
        let guests = this.props.guests
        let maxPeople = this.props.maxPeople
        let creator = this.props.creator
        let anonymous = this.props.anonymous
        let hostPic = this.props.hostPic;
        let location = this.props.location
        let hostName = this.props.hostName
        let unseenMessages = this.props.unseenMessages
        let unseenApplications = this.props.unseenApplications
        let eventId = this.props.eventId
        let hosting = this.props.hosting
        let _removeEventUI = this.props._removeEventUI

        let shouldShowOpacity = this.state.nonExpandedHeight === 9999 ? 0 : 1
        return (
            <View style={{ width: '100%', alignItems: 'center', opacity: shouldShowOpacity }}>
                <Animated.View onLayout={this._setNonExpandedHeight.bind(this)} style={[{ opacity: this.state.fadeAnim }, this.state.initializedHeightAnim ? { height: this.state.heightAnim } : {}]}>
                    {this.state.showConfirmDelete ?
                        // This part is the confirmation delete part that pops up in the same place
                        <Animated.View style={{
                            opacity: this.state.deleteBoxOpacity,
                            shadowColor: "#a2a2a2",
                            borderRadius: 10 * widthPixel,
                            shadowOpacity: 0.5,
                            shadowRadius: 8,
                            shadowOffset: {
                                height: 2,
                                width: 0
                            },
                            zIndex: 5,
                            width: '94%',
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'absolute',
                            backgroundColor: 'white'
                        }}>
                            <Text style={{
                                position: 'absolute',
                                top: '20%',
                                fontSize: 19 * widthPixel,
                                fontWeight: '900',
                                fontFamily: 'Avenir'
                            }}>
                                {
                                    hosting ?
                                        "Are you sure you want to delete:"
                                        : "Are you sure you want to leave:"
                                }
                            </Text>
                            <Text style={{
                                fontFamily: 'Avenir',
                                fontWeight: '300',
                                fontSize: widthPixel * 33
                            }}>
                                {title}
                            </Text>
                            <View style={{ position: 'absolute', bottom: '12%', right: '12%', flexDirection: 'row' }}>
                                {
                                    hosting ?
                                        <TouchableOpacity onPress={() => this._deleteEvent.bind(this)(eventId, _removeEventUI)}>
                                            <View style={{
                                                borderRadius: 3 * widthPixel,
                                                minWidth: 70 * widthPixel,
                                                minHeight: 27 * heightPixel,
                                                backgroundColor: '#FA8072',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}>
                                                <Text style={{
                                                    color: 'white',
                                                    fontFamily: 'Avenir',
                                                    fontWeight: '500',
                                                    fontSize: 14 * widthPixel,
                                                }}>
                                                    Delete
                                    </Text>
                                            </View>
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity onPress={() => this._leaveEvent.bind(this)(eventId, _removeEventUI)}>
                                            <View style={{
                                                borderRadius: 3 * widthPixel,
                                                minWidth: 70 * widthPixel,
                                                minHeight: 27 * heightPixel,
                                                backgroundColor: '#FA8072',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}>
                                                <Text style={{
                                                    color: 'white',
                                                    fontFamily: 'Avenir',
                                                    fontWeight: '500',
                                                    fontSize: 14 * widthPixel,
                                                }}>
                                                    Leave
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                }
                                <View style={{ width: 15 * widthPixel }} />
                                <TouchableOpacity onPress={this._closeDeletePage.bind(this)}>
                                    <View style={{
                                        borderRadius: 3 * widthPixel,
                                        borderWidth: 1 * heightPixel,
                                        borderColor: 'rgb(150,150,150)',
                                        minWidth: 70 * widthPixel,
                                        minHeight: 27 * heightPixel,
                                        backgroundColor: 'white',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        <Text style={{
                                            color: 'rgb(150,150,150)',
                                            fontFamily: 'Avenir',
                                            fontWeight: '500',
                                            fontSize: 14 * widthPixel,
                                        }}>
                                            Cancel
                                    </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                        : <View />
                    }
                    <TouchableWithoutFeedback onPress={this._expandText.bind(this)}>
                        <View style={{
                            shadowColor: "#a2a2a2",
                            borderRadius: 10 * widthPixel,
                            shadowOpacity: 0.5,
                            shadowRadius: 8,
                            shadowOffset: {
                                height: 2,
                                width: 0
                            },
                            width: '94%',
                            backgroundColor: 'white',
                        }}>
                            {
                                privacySetting === 2 ?
                                    <View style={{ position: 'absolute', left: 5 * widthPixel, alignItems: 'center', top: 5 * heightPixel }}>
                                        <View style={{
                                            width: 30 * widthPixel,
                                            height: 30 * widthPixel,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            shadowColor: "#a2a2a2",
                                            borderRadius: 15 * widthPixel,
                                            shadowOpacity: 0.5,
                                            shadowRadius: 3,
                                            shadowOffset: {
                                                height: 1,
                                                width: 0
                                            },
                                            backgroundColor: "black"
                                        }}>
                                            <Icon
                                                name='mail'
                                                type='octicon'
                                                size={17 * widthPixel}
                                                color={'white'}
                                            />
                                        </View>
                                    </View>
                                    : <View />
                            }
                            <View style={{ height: 14 * heightPixel }} />
                            <View style={{ flexDirection: 'row', width: '100%' }}>
                                <View style={{ width: 10 * widthPixel }} />
                                <TouchableWithoutFeedback onPress={() => {
                                    if (!anonymous) {
                                        this.props.navigation.navigate({
                                            routeName: 'Profile',
                                            params: { userId: creator },
                                            key: Math.random() * 10000,
                                            // key allows react-native to differentiate between different instances of the same route
                                        })
                                    }
                                }}>
                                    <Image
                                        style={styles.hostPic}
                                        source={
                                            anonymous ? _getAnonAvatar(title)
                                                :
                                                hostPic.length === 0 ? _getAvatar(hostName, 1) :
                                                    { uri: `data:image/gif;base64,${hostPic}` }}
                                    />

                                </TouchableWithoutFeedback>
                                <View style={{ flex: 1, justifyContent: 'center', left: 10 * widthPixel, width: component_width - 2 * circle_radius }}>
                                    <Text style={styles.titleFont}>
                                        {title}
                                    </Text>
                                    <Text style={styles.timeFont}>
                                        {time}
                                    </Text>
                                </View>
                                <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('GuestList', { eventId: eventId, maxPeople: maxPeople, hosting: hosting, title: title })}>
                                    <View style={{ right: 10 * widthPixel }}>
                                        <Animated.View style={{
                                            transform:
                                                [{
                                                    rotate: this.state.spinAnim.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: ['0deg', '360deg']
                                                    })
                                                }]
                                        }}>
                                            <CircleBar
                                                numPeople={guests.length}
                                                maxPeople={maxPeople}
                                                radius={circle_radius}
                                            />
                                        </Animated.View>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                            <View style={{ height: 5 * heightPixel }} />
                            <Animated.View style={[{ left: "6%", minWidth: '88%', maxWidth: '88%' },
                            this.state.initializedExpandedAnim ? { height: this.state.expandedAnim } : {}]}>
                                <View onLayout={this._setMaxHeight.bind(this)}>
                                    <View style={{ height: 2 * heightPixel }} />
                                    {
                                        this.state.expanded ?
                                            this._renderExpandedDetails(location, description, hosting, eventId, unseenApplications)
                                            : <View />
                                    }
                                </View>
                            </Animated.View>
                            <View style={{ height: 8 * heightPixel }} />
                            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center' }}>
                                <TouchableWithoutFeedback onPress={() => {
                                    this.props.navigation.navigate({
                                        routeName: 'Messaging',
                                        params: {
                                            eventId: eventId,
                                            title: title,
                                            _updateMessagesViewed: this.props._updateMessagesViewed
                                        },
                                    })
                                }
                                }>
                                    <View style={{ height: 26 * heightPixel, width: 26 * heightPixel }}>
                                        <Icon
                                            name="comments"
                                            color={getTopBarColor()}
                                            type="font-awesome"
                                            size={msg_size}
                                        />
                                        {this._renderMessageNotification(unseenMessages)}
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                            <View style={{ height: 10 * heightPixel }} />
                        </View>
                    </TouchableWithoutFeedback>
                </Animated.View>

            </View >
        )
    }
}
const styles = StyleSheet.create({
    titleFont: {
        fontFamily: 'Avenir',
        fontWeight: '800',
        fontSize: widthPixel * 19
    },
    hostPic: {
        width: heightPixel * 50,
        height: heightPixel * 50,
        borderRadius: heightPixel * 25,
    },
    timeFont: {
        fontFamily: 'Avenir',
        fontWeight: '100',
        fontSize: widthPixel * 16
    },
    locationFont: {
        fontSize: 14 * widthPixel,
        fontWeight: '900',
        fontFamily: 'Avenir'
    },
    descriptionFont: {
        fontFamily: 'Avenir',
        fontSize: 13 * widthPixel,
        color: 'rgb(102,102,102)',

    },
    hostProfilePic: {
        width: widthPixel * 40,
        height: widthPixel * 40,
    },
})