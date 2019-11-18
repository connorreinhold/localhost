import React, { Component } from 'react'
import {
    Text, View, Image, FlatList, Dimensions, ActivityIndicator,
    TouchableWithoutFeedback, TouchableOpacity, TextInput
} from 'react-native'
import { withNavigation } from 'react-navigation';
import { getTopBarColor } from '../../Functions/ColorFuncs.js'
import StaticGlobal from '../../Functions/StaticGlobal.js'
import InviteeEntry from './InviteeEntry.js'

const widthPixel = Dimensions.get('window').width / 375
const heightPixel = Dimensions.get('window').height / 667
export default withNavigation(class InviteeModal extends Component {
    componentWillMount () {
        this._queryTextChanged("")
    }
    constructor (props) {
        super(props)
        this.state = {
            isFetching: true,
            invitees: [
            ],
            searchQuery: "",
            oldSearchQuery: "",
        }
        this._onInvite = this._onInvite.bind(this)
    }

    _addInviteePictures (invitees) {
        let inviteeIds = invitees.map(function (invitee) { return invitee.inviteeId })
        fetch(StaticGlobal.database_url + "/getPictures", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                email: global.email,
                userIds: inviteeIds
            })
        }).then(function (response) {
            let myResponse = JSON.parse(response._bodyInit);
            if (myResponse.isSuccess) {
                let updated_invitees = invitees
                for (let i = 0; i < updated_invitees.length; i++) {
                    let inviteeIndex = myResponse.imageOrder.indexOf(updated_invitees[i].inviteeId)
                    updated_invitees[i].inviteePic = myResponse.imageData[inviteeIndex]
                }
                this.setState({
                    invitees: updated_invitees,
                    isFetching: false
                })
            }
        }.bind(this))
    }

    _inviteesFromJson (toParse) {
        let inviteeList = []
        for (let i = 0; i < toParse.length; i++) {
            let newInvitee = {
                inviteeName: toParse[i].firstName + " " + toParse[i].lastName,
                inviteePic: "",
                inviteeId: toParse[i]._id,
                invitedStatus: 1,
                //invitedStatus - 0 part of the event, 1 - can invite, 2 - already been invited
            }
            inviteeList.push(newInvitee)
        }
        return inviteeList
    }

    _determineAlreadyGuests (possiblePeople) {
        fetch(StaticGlobal.database_url + '/getEventAttendees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                email: global.email,
                eventId: this.props.eventId
            })
        }).then(function (response) {
            let queryResponse = JSON.parse(response._bodyText);
            if (queryResponse.isSuccess) {
                let idGuests = (queryResponse.value).map((guest) => { return guest._id })
                for (let i = 0; i < possiblePeople.length; i++) {
                    if (idGuests.includes(possiblePeople[i].inviteeId)) {
                        possiblePeople[i].invitedStatus = 0
                    }
                }
                this._addInviteePictures(possiblePeople)
            }
        }.bind(this));
    }

    _determineAlreadyInvited (possiblePeople) {
        fetch(StaticGlobal.database_url + '/getEventInvitees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                email: global.email,
                eventId: this.props.eventId
            })
        }).then(function (response) {
            let queryResponse = JSON.parse(response._bodyText);
            if (queryResponse.isSuccess) {
                let idInvitees = queryResponse.value
                for (let i = 0; i < possiblePeople.length; i++) {
                    if (idInvitees.includes(possiblePeople[i].inviteeId)) {
                        possiblePeople[i].invitedStatus = 2
                    }
                }
                this._determineAlreadyGuests(possiblePeople)
            }
        }.bind(this));
    }

    _queryTextChanged (text) {
        this.setState({
            oldSearchQuery: this.state.searchQuery,
            searchQuery: text
        }, () => {
            if (this.state.searchQuery.length <= this.state.oldSearchQuery.length || this.state.invitees.length != 0) {
                this.setState({
                    isFetching: true,
                })
                fetch(StaticGlobal.database_url + '/queryUsers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token: global.session_id,
                        email: global.email,
                        query: text,
                    })
                }).then(function (response) {
                    let queryResponse = JSON.parse(response._bodyText);
                    if (queryResponse.isSuccess) {
                        let toParse = queryResponse.value
                        if (queryResponse.query === this.state.searchQuery) {
                            let possiblePeople = this._inviteesFromJson(toParse)
                            this._determineAlreadyInvited(possiblePeople)
                        }
                    }
                }.bind(this));
            }
        })
    }

    _onInvite (userId) {
        fetch(StaticGlobal.database_url + '/inviteUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                email: global.email,
                eventId: this.props.eventId,
                userId: userId,
            })
        }).then(function (response) {
            let inviteResponse = JSON.parse(response._bodyText);
            if (inviteResponse.isSuccess) {
                let to_update = this.state.invitees
                for (let i = 0; i < to_update.length; i++) {
                    if (to_update[i].inviteeId === userId) {
                        to_update[i].invitedStatus = 2
                    }
                }
                this.setState({
                    invitees: to_update
                })
            }
        }.bind(this));
    }

    render () {
        let eventTitle = this.props.eventTitle
        return (
            <View style={{ opacity: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{
                    top: '10%',
                    height: '80%',
                    opacity: 1,
                    width: 325 * widthPixel,
                    backgroundColor: 'white',
                    shadowColor: "#a2a2a2",
                    borderRadius: 10 * widthPixel,
                    shadowOpacity: 0.7,
                    shadowRadius: 12,
                    shadowOffset: {
                        height: 3,
                        width: 0
                    },
                    alignItems: 'center',
                }}>

                    <TouchableOpacity
                        style={{ zIndex: 5, position: 'absolute', borderRadius: 5 * widthPixel, backgroundColor: 'rgb(60,100,255)', right: 13 * widthPixel, bottom: 9 * heightPixel }}
                        onPress={() => {
                            this.props._triggerModalVisible();
                        }}>
                        <View style={{ paddingLeft: 12 * widthPixel, paddingRight: 12 * widthPixel, paddingTop: 8 * heightPixel, paddingBottom: 8 * heightPixel, borderRadius: 5 * widthPixel }}>
                            <Text style={{ color: 'white', fontFamily: 'Avenir', fontWeight: '800' }}>
                                Done
                             </Text>
                        </View>
                    </TouchableOpacity><View style={{ width: '100%', alignItems: 'center' }}>
                        <View style={{ height: 20 * heightPixel }} />
                        <Text style={{ fontFamily: 'Avenir', fontWeight: '700', fontSize: 18 * widthPixel }}>
                            {eventTitle}
                        </Text>
                        <View style={{ height: 15 * heightPixel }} />
                        <TextInput
                            autoFocus={true}
                            autoCorrect={false}
                            style={{ width: 270 * widthPixel, fontFamily: 'Avenir', fontSize: 16 * widthPixel, borderBottomWidth: 1, borderColor: 'rgb(220,220,220)' }}
                            placeholder={"Search"}
                            onChangeText={this._queryTextChanged.bind(this)}
                            value={this.state.searchQuery}
                        />
                    </View>
                    <View style={{ height: 10 * heightPixel }} />
                    {
                        this.state.isFetching ?
                            <ActivityIndicator size="small" color="#777777" />
                            : <View />
                    }
                    <FlatList
                        style={{ width: '100%', height: '100%' }}
                        data={this.state.invitees}
                        extraData={this.state}
                        keyboardShouldPersistTaps='always'
                        ListFooterComponent={
                            <View style={{ width: '100%', alignItems: 'center' }}>
                                <View style={{ height: 15 * heightPixel }} />
                                <View style={{ height: 15 * heightPixel }} />
                                {this.state.invitees.length === 0 && !this.state.isFetching ?
                                    <Text style={{ maxWidth: '70%', fontFamily: "Avenir", fontSize: 15 * widthPixel, fontWeight: '300' }}>
                                        {"No person found"}
                                    </Text>
                                    : <View />
                                }
                            </View>
                        }
                        renderItem={({ item }) => (
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ width: 30 * widthPixel }} />
                                <View style={{ width: 285 * widthPixel }}>
                                    <InviteeEntry
                                        inviteeId={item.inviteeId}
                                        inviteeName={item.inviteeName}
                                        inviteePic={item.inviteePic}
                                        invitedStatus={item.invitedStatus}
                                        _onInvite={this._onInvite}
                                        _triggerModalVisible={this.props._triggerModalVisible}

                                    />
                                </View>
                            </View>

                        )}
                        keyExtractor={item => item.inviteeId}
                        showsVerticalScrollIndicator={true}
                        initialNumToRender={3}
                        maxToRenderPerBatch={10}
                    />
                </View>
            </View>
        )
    }
})