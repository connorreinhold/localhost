import React, { Component } from 'react'
import {
    Text, View, StyleSheet, FlatList, Button, Platform, Modal, ActivityIndicator,
    Dimensions, TextInput, TouchableWithoutFeedback, TouchableOpacity, Animated
} from 'react-native'
import { Icon } from 'react-native-elements'
import { Constants, Location, Permissions } from 'expo'

import EventDetails from '../Components/EventListings/EventDetails.js'
import { getTopBarColor } from '../Functions/ColorFuncs.js'
import StaticGlobal from '../Functions/StaticGlobal.js'
import { parseDate } from '../Functions/TimeFuncs.js'

const heightPixel = (Dimensions.get('window').height) / (667);
const widthPixel = (Dimensions.get('window').width) / (375);

export default class EventListings extends Component {
    //https://reactnavigation.org/docs/en/headers.html
    static navigationOptions = ({ navigation }) => {
        return {
            title: 'Nearby Events',
            headerTintColor: 'white',
            headerStyle: {
                backgroundColor: getTopBarColor()
            },
        }
    }
    constructor (props) {
        super(props)
        this.state = {
            isFetching: true,
            eventListings: [
            ],
            queryText: "",
            appliedModalVisible: false,
            appliedModalOpacity: new Animated.Value(0),
            // Is the event last applied to an open event?
            eventOpen: false,
        }
        this._handleLeft = this._leftSwipeHandler.bind(this)
        this._handleRight = this._rightSwipeHandler.bind(this)
        this._showModalApplied = this._showModalApplied.bind(this)
    }

    _onDeleteQuery () {
        this.setState({ queryText: "" }, () => {
            this._onRefresh()
        })

    }

    componentDidMount () {
        if (Platform.OS === 'android' && !Constants.isDevice) {
            console.log('Oops, this will not work on Sketch in an Android emulator. Try it on your device!')
        } else {
            this._onRefresh();
        }
    }

    _setQueryText (text) {
        this.setState({ queryText: text }, () => {
            if (this.state.queryText === "") {
                this._onRefresh()
            }
            else {
                fetch(StaticGlobal.database_url + '/queryEvents', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token: global.session_id,
                        email: global.email,
                        query: this.state.queryText,
                        myLat: global.myLatitude,
                        myLng: global.myLongitude,
                    })
                }).then(function (response) {
                    let queryResponse = JSON.parse(response._bodyText);
                    if (queryResponse.isSuccess) {
                        let toParse = queryResponse.value
                        let searchedEvents = this._parseEventJson(toParse)
                        this._updateHostPictures(searchedEvents)
                    }
                }.bind(this));
            }
        })
    }

    _updateHostPictures (events) {
        let creatorIds = events.map(function (event) { return event.hostId })
        fetch(StaticGlobal.database_url + "/getPictures", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                email: global.email,
                userIds: creatorIds
            })
        }).then(function (response) {
            let myResponse = JSON.parse(response._bodyInit);
            if (myResponse.isSuccess) {
                let updated_events = events
                for (let i = 0; i < updated_events.length; i++) {
                    let hostIndex = myResponse.imageOrder.indexOf(updated_events[i].hostId)
                    updated_events[i].hostPic = myResponse.imageData[hostIndex]
                }
                this.setState({
                    eventListings: updated_events,
                    isFetching: false
                })
            }
        }.bind(this))
    }

    _parseEventJson (jsonObj, isInvited) {
        let to_return = []
        for (i = 0; i < jsonObj.length; i++) {
            let thisEvent = jsonObj[i]
            let newobj = {
                title: thisEvent.name,
                description: thisEvent.description,
                time: parseDate(thisEvent.time),
                guests: thisEvent.attendees,
                applications: thisEvent.applications,
                maxPeople: thisEvent.capacity,
                hostId: thisEvent.creator,
                hostPic: "",
                anonymous: thisEvent.anonymous,
                privacySetting: thisEvent.privacySetting,
                invited: isInvited,
                id: thisEvent._id,
            }
            to_return.unshift(newobj)
        }
        return to_return
    }

    _loadGeneralEvents (invited_events) {
        fetch(StaticGlobal.database_url + '/getEvents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                email: global.email,
                myLat: global.myLatitude,
                myLng: global.myLongitude,
            })
        }).then(function (response) {
            let getEventResponse = JSON.parse(response._bodyText);
            if (getEventResponse.isSuccess) {
                // false here is for whether the event was an event invited by someone
                let general_events = this._parseEventJson(getEventResponse.value, false)
                let updated_events = invited_events.concat(general_events)
                this._updateHostPictures(updated_events)

            }
        }.bind(this));
    }
    _onRefresh () {
        this.setState({
            isFetching: true
        })
        if (this.state.queryText === "") {
            fetch(StaticGlobal.database_url + '/getInvitedEvents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: global.session_id,
                    email: global.email,
                })
            }).then(function (response) {
                let getInvitedResponse = JSON.parse(response._bodyText);
                if (getInvitedResponse.isSuccess) {
                    let invited_events = this._parseEventJson(getInvitedResponse.value, true)
                    this._loadGeneralEvents(invited_events)
                }
            }.bind(this));
        }
        else {
            this._setQueryText(this.state.queryText)
        }
    }

    _leftSwipeHandler (eventId) {
        // remove an event by a specific id
        fetch(StaticGlobal.database_url + '/ignoreEvent', {
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
            let ignoreResponse = JSON.parse(response._bodyInit);
            if (ignoreResponse.isSuccess) {
                var new_data = this.state.eventListings.filter(x => {
                    return x.id != eventId;
                })
                this.setState({ eventListings: new_data })
            }
        }.bind(this));

    }

    _showModalApplied (eventOpen) {
        this.setState({eventOpen : eventOpen}, ()=> {
            this.state.appliedModalOpacity.setValue(0)
            this.setState({
                appliedModalVisible: true
            }, () => {
                Animated.timing(
                    this.state.appliedModalOpacity,
                    {
                        toValue: 1,
                        duration: 500
                    }
                ).start(() => {
                    Animated.timing(
                        this.state.appliedModalOpacity,
                        {
                            toValue: 1,
                            duration: 300
                        }
                    ).start(() => {
                        Animated.timing(
                            this.state.appliedModalOpacity,
                            {
                                toValue: 0,
                                duration: 1000
                            }).start(() => {
                                this.setState({
                                    appliedModalVisible: false
                                })
                            })
                    })
                })
            })
        })
    }
    _rightSwipeHandler (eventId) {
        // remove an event by a specific id
        var isOpen = false
        var new_data = this.state.eventListings.filter(x => {
            if (x.id === eventId) {
                // Keep track of whether the removed event is open or not
                isOpen = x.privacySetting === "open"
            }
            return x.id != eventId;
        })
        this.setState({ eventListings: new_data })

        // If it is open, just join the event, otherwise apply for the event
        var endpointUrl = isOpen ? "/joinEvent" : "/applyEvent"
        fetch(StaticGlobal.database_url + endpointUrl, {
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
            let applyResponse = JSON.parse(response._bodyInit);
            if (applyResponse.isSuccess) {
                console.log("EventListings.js - Applied/Joined - " + eventId)
            } else {
            }
        }.bind(this));
    }
    render () {
        return (
            <View style={styles.container}>
                {
                    this.state.appliedModalVisible ?
                        <Animated.View style={{
                            width: 300 * widthPixel,
                            position: 'absolute',
                            zIndex: 5,
                            height: 130 * heightPixel,
                            top: 100 * heightPixel,
                            shadowColor: "#a2a2a2",
                            borderRadius: 10 * widthPixel,
                            shadowOpacity: 0.5,//this.state.appliedModalOpacity,
                            shadowRadius: 8,
                            shadowOffset: {
                                height: 2,
                                width: 0
                            },
                            left: 37.5 * widthPixel,
                            backgroundColor: 'white',
                            opacity: this.state.appliedModalOpacity,
                            alignItems: 'center'
                        }}>
                            <View style={{ height: 15 * heightPixel }} />
                            <Icon
                                name='envelope'
                                type='font-awesome'
                                size={60 * widthPixel}
                                color={this.state.eventOpen ? "rgba(90, 219, 143, 0.4)" : "rgba(120, 200, 255, 0.4)"}
                            />
                            <View style={{ height: 8 * heightPixel }} />
                            <Text style={{
                                fontSize: 30 * widthPixel,
                                color: this.state.eventOpen ? "rgb(90, 219, 143)" : "rgb(120, 200, 255)",
                                fontWeight: '600',
                                fontFamily: 'Avenir'
                            }}>
                                {this.state.eventOpen ? "Joined!" : "Applied!"}
                        </Text>
                        </Animated.View>
                        : <View />
                }
                <FlatList
                    contentContainerStyle={{ paddingBottom: 45 * heightPixel }}
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode='on-drag'
                    style={{ width: '100%' }}
                    data={this.state.eventListings}
                    extraData={this.state}
                    ListHeaderComponent={
                        <View style={{ alignItems: 'center' }}>
                            <View style={{ height: 5 * heightPixel }} />
                            <View style={styles.searchView}>
                                <View style={{ width: 10 * heightPixel }} />
                                <View>
                                    <Icon
                                        name="search"
                                        type="font-awesome"
                                        size={12 * heightPixel}
                                        color={'rgb(100,100,100)'}
                                    />
                                    <View style={{ height: 1.5 * heightPixel }} />
                                </View>
                                <View style={{ width: 7 * widthPixel }} />
                                <TextInput
                                    style={{ height: '100%', width: '75%', color: 'rgb(100,100,100)' }}
                                    placeholder={"Search"}
                                    onChangeText={this._setQueryText.bind(this)}
                                    value={this.state.queryText}
                                />
                                {this.state.queryText != "" ?
                                    <TouchableWithoutFeedback onPress={this._onDeleteQuery.bind(this)}>
                                        <View style={{ height: '100%', width: 15 * widthPixel, justifyContent: 'center', alignItems: 'center' }}>
                                            <Icon
                                                name="times"
                                                type="font-awesome"
                                                size={12 * heightPixel}
                                                color={'rgb(100,100,100)'}
                                            />
                                        </View>
                                    </TouchableWithoutFeedback>
                                    :
                                    <View></View>
                                }
                            </View>
                            <View style={{ height: 10 * heightPixel }} />
                        </View>
                    }
                    ListFooterComponent={
                        <View style={{ alignItems: 'center' }}>
                            {
                                this.state.eventListings.length == 0 && !this.state.isFetching
                                    ?
                                    <View style={{ width: '80%' }}>
                                        <View style={{ height: 30 * heightPixel }} />
                                        <Text style={{ fontFamily: 'Avenir', textAlign: 'center', fontWeight: '700', fontSize: 15 * widthPixel }}>
                                            Looks like there are no events available! Why don't you create one?
                                        </Text>
                                    </View>
                                    :
                                    <View />
                            }
                        </View>
                    }
                    renderItem={({ item }) => (
                        this.state.queryText === "" || item.title.includes(this.state.queryText) ?
                            <View>
                                <EventDetails
                                    description={item.description}
                                    title={item.title}
                                    guests={item.guests}
                                    applications={item.applications}
                                    maxPeople={item.maxPeople}
                                    time={item.time}
                                    invitationPerson={item.invitationPerson}
                                    hostPic={item.hostPic}
                                    hostId={item.hostId}
                                    navigation={this.props.navigation}
                                    eventId={item.id}
                                    anonymous = {item.anonymous}
                                    privacySetting={item.privacySetting}
                                    invited={item.invited}
                                    _handleLeft={this._handleLeft}
                                    _handleRight={this._handleRight}
                                    _showModalApplied={this._showModalApplied}
                                />
                            </View>
                            : <View />
                    )}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    onRefresh={() => this._onRefresh()}
                    refreshing={this.state.isFetching}
                    initialNumToRender={3}
                    maxToRenderPerBatch={10}

                />

            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center'
    },
    searchView: {
        backgroundColor: 'rgb(236,236,236)',
        top: 10 * heightPixel,
        width: '93%',
        height: 30 * heightPixel,
        borderRadius: 8 * widthPixel,
        flexDirection: 'row',
        alignItems: 'center',
    }
});