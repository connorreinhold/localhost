import React, { Component } from 'react'
import { View, FlatList, StyleSheet, Dimensions, Text, TouchableWithoutFeedback, Image } from 'react-native'
import {Icon} from 'react-native-elements'
import { Header } from 'react-navigation'
import GuestEntry from '../Components/GuestList/GuestEntry.js'
import { getTopBarColor} from '../Functions/ColorFuncs.js'
import StaticGlobal from '../Functions/StaticGlobal'

const heightPixel = (Dimensions.get('window').height - Header.HEIGHT) / 667
const widthPixel = Dimensions.get('window').width / 375

export default class GuestList extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: '',
            headerTintColor: 'white',
            headerStyle: {
                backgroundColor: getTopBarColor()
            },
        }
    }

    async componentDidMount () {
        this._onRefresh()
    }

    constructor (props) {
        super(props)
        this.state = {
            guests: [],
            isFetching: true
        }
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
            if (myResponse.isSuccess) {
                let updated_guests = guests
                for (let i = 0; i < updated_guests.length; i++) {
                    let guestIndex = myResponse.imageOrder.indexOf(updated_guests[i].id)
                    updated_guests[i].guestPic = myResponse.imageData[guestIndex]
                }
                this.setState({
                    guests: updated_guests,
                    isFetching: false
                })
            }
        }.bind(this))
    }

    _onRefresh () {
        this.setState({
            isFetching: true
        })
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
            if (getAttendeesResponse.isSuccess) {
                let toParse = getAttendeesResponse.value
                this._addGuestPictures(this._guestsFromJson(toParse))
            }
        }.bind(this));
    }

    _renderItem (item) {
        return (
            <View style={{ flexDirection: 'row' }}>
                <View style={{ width: 20 * widthPixel }} />
                <View style={{ width: 325 * widthPixel }}>
                    <GuestEntry
                        guestName={item.guestName}
                        guestPic={item.guestPic}
                        guestId={item.id}
                        navigation={this.props.navigation}
                    />
                    <View style={{ height: 1 * heightPixel, width: '100%', borderBottomWidth: 1 * heightPixel, borderBottomColor: 'rgb(240,240,240)' }} />
                </View>
            </View>
        )
    }
    
    render () {
        return (
            <View>
                <FlatList
                    style={{ width: '100%', minHeight: '100%' }}
                    data={this.state.guests}
                    extraData={this.state}
                    renderItem={({ item }) => (
                        this._renderItem.bind(this)(item)
                    )}
                    onRefresh={() => this._onRefresh()}
                    refreshing={this.state.isFetching}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={true}
                    initialNumToRender={3}
                    ListFooterComponent= {
                        <View style = {{width: '100%', alignItems: 'center'}}>
                            <View style = {{height: 20*heightPixel}}/>
                            <Text style = {{fontFamily: 'Avenir', fontWeight: '800', fontSize: 15*widthPixel}}>
                                {"Max capacity: "+this.props.navigation.state.params.maxPeople+" people"}
                            </Text>
                        </View>
                    }
                    maxToRenderPerBatch={10}
                />
            </View>
        )
    }
}