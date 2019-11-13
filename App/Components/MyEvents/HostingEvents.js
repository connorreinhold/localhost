import React, { Component } from 'react'
import { Text, View, TextInput, Image, FlatList, Dimensions, TouchableOpacity,  Modal, TouchableHighlight } from 'react-native'
import { Icon } from 'react-native-elements'
import { withNavigation } from 'react-navigation';
import Event from './Event.js'
import { getTopBarColor } from '../../Functions/ColorFuncs.js'
import StaticGlobal from '../../Functions/StaticGlobal.js'
import {parseDate} from '../../Functions/TimeFuncs.js'
import InviteeModal from './InviteeModal.js'

const widthPixel = Dimensions.get('window').width / 375
const heightPixel = Dimensions.get('window').height / 667
export default withNavigation(class HostingEvents extends Component {

    async componentDidMount () {
        this._onRefresh()
    }

    constructor (props) {
        super(props)
        this.state = {
            isFetching: true,
            events: [
            ],
            modalVisible: false,
            modalEventId: "",
            modalEventTitle: "",
        }
        this._appendEventsFromJson = this._appendEventsFromJson.bind(this)
        this._removeEventUI = this._removeEventUI.bind(this)
        this._onEventChange = this._onEventChange.bind(this)
        this._updateApplicationsViewed = this._updateApplicationsViewed.bind(this)
        this._updateMessagesViewed = this._updateMessagesViewed.bind(this)
        this._launchModal = this._launchModal.bind(this)
        this._triggerModalVisible = this._triggerModalVisible.bind(this)
    }

    // add either createdevents or joinedevents to the current eventlist (events), parse through json and create a
    // unique event
    _appendEventsFromJson (events, toParse) {
        for (var i = 0; i < toParse.length; i++) {
            let newEvent = {
                title: toParse[i].name,
                msgNotification: false,
                creator: toParse[i].creator,
                location: toParse[i].location,
                hostPic: "",
                unseenMessages: toParse[i].unseenMessages, 
                unseenApplications: toParse[i].unseenApplications, 
                time: parseDate(toParse[i].time),
                guests: toParse[i].attendees,
                applications: toParse[i].applications,
                maxPeople: toParse[i].capacity,
                description: toParse[i].description,
                anonymous: toParse[i].anonymous,
                privacySetting: toParse[i].privacySetting,
                id: toParse[i]._id,
            }
            events.unshift(newEvent)
        }
        return events
    }

    _updateHostPictures (events) {
        let creatorIds = events.map(function (event) { return event.creator })
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
                let updated_events = events // search bar was removed with events.shift() above
                for (let i = 0; i < updated_events.length; i++) {
                    let hostIndex = myResponse.imageOrder.indexOf(updated_events[i].creator)
                    updated_events[i].hostPic = myResponse.imageData[hostIndex]
                }
                this.setState({
                    events: updated_events,
                    isFetching: false,
                })
            }
        }.bind(this))
    }

    _removeEventUI (eventId) {
        let updatedEvents = this.state.events
        updatedEvents = updatedEvents.filter(event => {
            return event.id != eventId
        })
        this.setState({
            events: updatedEvents
        })
    }

    _updateMessagesViewed(eventId) {
        let updated_events = this.state.events.map((event)=> {
            if(event.id===eventId) {
                event.unseenMessages = 0
                return event
            }
            else {
                return event
            }
        })
        this.setState({
            events: updated_events
        })
    }

    _updateApplicationsViewed(eventId) {
        let updated_events = this.state.events.map((event)=> {
            if(event.id===eventId) {
                event.unseenApplications = 0
                return event
            }
            else {
                return event
            }
        })
        this.setState({
            events: updated_events
        })
    }

    _onEventChange () {
        this.setState({
            events: []
        }, () => {
            this._onRefresh()
        })
    }

    _onRefresh () {
        this.setState({
            isFetching: true
        })
        fetch(StaticGlobal.database_url + '/getCreatedEvents', {
            // Fetch all events that you have created
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                email: global.email
            })
        }).then(function (response) {
            let myEventsResponse = JSON.parse(response._bodyInit);
            if (myEventsResponse.isSuccess) {
                let updatedEvents = []
                let toParse = myEventsResponse.value;
                updatedEvents = this._appendEventsFromJson(updatedEvents, toParse)
                this._updateHostPictures(updatedEvents)
            }
        }.bind(this));
    }

    _launchModal(modalEventId, modalEventTitle) {
        this.setState({
            modalEventId: modalEventId,
            modalEventTitle: modalEventTitle
        }, ()=>{
            this._triggerModalVisible()
        })
    }

    _triggerModalVisible () {
        this.setState({ modalVisible: !this.state.modalVisible });
    }


    render () {
        this.navigation = this.props.navigation
        return (
            <View style={{ height: '100%' }}>
                <Modal
                    style={{ height: '100%' }}
                    animationType="slide"
                    transparent={true}
                    visible={this.state.modalVisible}>
                    <InviteeModal
                        _triggerModalVisible = {this._triggerModalVisible}
                        eventId = {this.state.modalEventId}
                        eventTitle={this.state.modalEventTitle}
                    />
                </Modal>
                <FlatList
                    style={{ width: '100%' }}
                    data={this.state.events}
                    extraData={this.state}
                    ListHeaderComponent={
                        <View style = {{alignItems: 'center'}}>
                            {
                                this.state.events.length == 0 && !this.state.isFetching
                                    ?
                                    <View style={{ width: '80%' }}>
                                        <View style={{ height: 30 * heightPixel }} />
                                        <Text style = {{fontFamily: 'Avenir', textAlign: 'center', fontWeight: '400', fontSize: 15*widthPixel}}>
                                            You are not hosting any events.
                                        </Text>
                                    </View>
                                    :
                                    <View />
                            }
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={{ alignItems: 'center' }}>
                            <View style={{ height: 10 * heightPixel }} />
                            <Event
                                title={item.title}
                                msgNotification={item.msgNotification}
                                applications={item.applications}
                                creator={item.creator}
                                hosting={true}
                                hostPic={item.hostPic}
                                unseenApplications = {item.unseenApplications}
                                time={item.time}
                                unseenMessages={item.unseenMessages}
                                guests={item.guests}
                                maxPeople={item.maxPeople}
                                location={item.location}
                                description={item.description}
                                anonymous = {item.anonymous}
                                privacySetting={item.privacySetting}
                                eventId={item.id}
                                navigation={this.navigation}
                                _removeEventUI={this._removeEventUI}
                                _onEventChange={this._onEventChange}
                                _launchModal = {this._launchModal}
                                _updateApplicationsViewed = {this._updateApplicationsViewed}
                                _updateMessagesViewed = {this._updateMessagesViewed}
                            />
                            <View style={{ height: 5 * heightPixel }} />
                        </View>
                    )}
                    ListFooterComponent={
                        <View style={{ width: '100%', alignItems: 'center' }}>
                            <View style={{ height: 10 * heightPixel }} />
                            <TouchableOpacity onPress={() => this.props.navigation.navigate({
                                routeName: 'CreateEvent',
                                params: {
                                    editing: false,
                                    _onEventChange: this._onEventChange
                                },
                            })}>
                                <View style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: 50 * widthPixel,
                                    height: 50 * widthPixel,
                                    borderRadius: 25 * widthPixel,
                                    backgroundColor: getTopBarColor(),

                                    shadowColor: "#a2a2a2",
                                    shadowOpacity: 0.5,
                                    shadowRadius: 8,
                                    shadowOffset: {
                                        height: 2,
                                        width: 0
                                    },
                                }}>
                                    <Icon
                                        name="plus"
                                        type="font-awesome"
                                        size={25 * widthPixel}
                                        color={'white'}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>}
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
})