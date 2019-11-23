import React, { Component } from 'react'
import {
    Text,
    View,
    Image,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
    FlatList
} from 'react-native'

import ProfilePictures from '../Components/Profile/ProfilePictures.js'
import MyCollegeTrophy from '../Components/MyCollegeTrophy.js'
import EventDetails from '../Components/EventListings/EventDetails.js'
import Bio from '../Components/Profile/Bio.js'
import { getTopBarColor } from '../Functions/ColorFuncs.js'
import StaticGlobal from '../Functions/StaticGlobal.js'
import { parseDate } from '../Functions/TimeFuncs.js'
import { Icon } from 'react-native-elements';

const heightPixel = (Dimensions.get('window').height) / (667);
const widthPixel = (Dimensions.get('window').width) / (375);

const top_margin = 22 * heightPixel
const icon_size = 21 * heightPixel

export default class Profile extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.state.params && navigation.state.params.userId ?
                ""
                : "My Profile",
            headerTintColor: 'white',
            headerStyle: {
                backgroundColor: getTopBarColor()
            },
            headerRight: (
                <View>
                    {
                        navigation.state.params && navigation.state.params.userId ?
                            <View /> :
                            <View style={{ flexDirection: 'row' }}>
                                <TouchableOpacity onPress={() =>
                                    navigation.state.params.settingsNavigation()
                                }>
                                    <Icon
                                        name="md-settings"
                                        type="ionicon"
                                        size={24 * widthPixel}
                                        color={'white'}
                                    />
                                </TouchableOpacity>
                                <View style={{ width: 15 * widthPixel }} />
                            </View>
                    }

                </View>
            )
        }
    }
    componentWillMount () {
        if (!this.props.navigation.state.params) {
            this.props.navigation.setParams({
                settingsNavigation: this._settingsPressed
            })
        }
    }

    async componentDidMount () {
        if (this.props.navigation.state.params) {
            this.setState({
                userId: this.props.navigation.state.params.userId
            }, () => {
                this._onRefresh(this.props.navigation.state.params.userId)
            })
        } else {
            this._onRefresh()
        }
    }

    constructor (props) {
        super(props)
        this.state = {
            isFetching1: true,
            isFetching2: true,
            loadedPics: false,
            userId: "",
            source_one: "",
            source_two: "",
            source_three: "",
            source_four: "",
            profile_name: global.profile_name,
            bio: "",
            college: "Cornell",
            join_date: "",
            pastEvents: [
            ]
        }
        this._informationUpdated = this._informationUpdated.bind(this)
        this._settingsPressed = this._settingsPressed.bind(this)
    }

    _settingsPressed () {
        this.props.navigation.navigate('Settings',
            {
                source_one: this.state.source_one,
                source_two: this.state.source_two,
                source_three: this.state.source_three,
                source_four: this.state.source_four,
                bio: this.state.bio,
                profile_name: this.state.profile_name,
                _informationUpdated: this._informationUpdated
            })
    }

    _retrievePastEventHostPictures (events) {
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
        }).then(function(response) {
            return response.json()
        }).then(function (response) {
            let myResponse = response
            if (myResponse.isSuccess) {
                let updated_events = events
                for (let i = 0; i < updated_events.length; i++) {
                    let hostIndex = myResponse.imageOrder.indexOf(updated_events[i].hostId)
                    updated_events[i].hostPic = myResponse.imageData[hostIndex]
                }
                this.setState({
                    pastEvents: updated_events,
                    isFetching2: false
                })
            }
        }.bind(this))
    }

    _retrievePastEvents (pastEvents) {
        fetch(StaticGlobal.database_url + '/getPastEvents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                email: global.email,
                eventIds: pastEvents
            })
        }).then(function(response) {
            return response.json()
        }).then(function (response) {
            let getEventResponse = response
            if (getEventResponse.isSuccess) {
                let pastEvents = getEventResponse.value;
                let updatedPastEvents = []
                for (i = 0; i < pastEvents.length; i++) {
                    let pastEvent = pastEvents[i]
                    let newobj = {
                        title: pastEvent.name,
                        description: pastEvent.description,
                        time: parseDate(pastEvent.time),
                        guests: pastEvent.attendees,
                        applications: pastEvent.applications,
                        maxPeople: pastEvent.capacity,
                        hostId: pastEvent.creator,
                        hostPic: "",
                        privacySetting: pastEvent.privacySetting,
                        id: pastEvent._id
                    }
                    updatedPastEvents.unshift(newobj)

                }
                this._retrievePastEventHostPictures(updatedPastEvents)
            }
        }.bind(this));
    }

    _retrieveProfileInformation (userId) {
        fetch(StaticGlobal.database_url + '/getUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                email: global.email,
                userId: userId
            }),
        }).then(function(response) {
            return response.json()
        }).then(function (response) {
            let profileResponse = response
            if (profileResponse.isSuccess) {
                let bio = profileResponse.value.bio
                let name = profileResponse.value.firstName + " " + profileResponse.value.lastName
                let joinDate = profileResponse.value.joinDate
                let college = profileResponse.value.college
                this._retrievePastEvents()
                this.setState({
                    bio: bio,
                    profile_name: name,
                    userId: userId,
                    join_date: joinDate,
                    college: college
                })
            }
        }.bind(this));
    }

    _retrieveProfilePictures (userId) {
        fetch(StaticGlobal.database_url + '/getUserProfilePictures', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                email: global.email,
                userId: userId
            }),
        }).then(function(response) {
            return response.json()
        }).then(function (response) {
            let profileResponse = response
            if (profileResponse.isSuccess) {
                this.setState({
                    source_one: profileResponse.imageData[0],
                    source_two: profileResponse.imageData[1],
                    source_three: profileResponse.imageData[2],
                    source_four: profileResponse.imageData[3],
                    isFetching1: false,
                    loadedPics: true,
                })
            }
        }.bind(this));
    }

    _onRefresh (userId) {
        this.setState({
            isFetching1: true,
            isFetching2: true,
        })
        this._retrieveProfileInformation(userId)
        this._retrieveProfilePictures(userId)
    }
    _informationUpdated () {
        this._onRefresh()
    }

    _renderItem (item) {
        return (
            <EventDetails
                attendance={item.attendance}
                title={item.title}
                description={item.description}
                time={item.time}
                guests={item.guests}
                maxPeople={item.maxPeople}
                hostPic={item.hostPic}
                hostId={item.hostId}
                eventId={item.id}
                privacySetting={item.privacySetting}
                navigation={this.props.navigation}
                lockSwiping={true}
                lockPressPic={item.hostId === this.state.userId}
            // If the user is a host
            />
        )
    }
    render () {
        return (
            <View style={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <FlatList
                    style={{ height: '100%', width: '100%' }}
                    data={this.state.pastEvents}
                    extraData={this.state}
                    renderItem={({ item }) =>
                        this._renderItem(item)
                    }
                    ListHeaderComponent={
                        <View style={{ width: '100%', alignItems: 'center' }}>
                            <View style={{ height: top_margin }} />
                            <ProfilePictures
                                source_one={this.state.source_one}
                                source_two={this.state.source_two}
                                source_three={this.state.source_three}
                                source_four={this.state.source_four}
                                profile_name = {this.state.profile_name}
                                loadedPics = {this.state.loadedPics}
                            />
                            <View style={{ height: 18.5 * heightPixel }} />
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={styles.name_style}>
                                    {this.state.profile_name}
                                </Text>
                            </View>
                            <View style={{ height: 5 * heightPixel }} />
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <View style={{ width: 3 * widthPixel }} />
                                <MyCollegeTrophy
                                    college={this.state.college}
                                />
                            </View>
                            <View style={{ height: 5 * heightPixel }} />
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Bio text={this.state.bio} />
                                <View style={{ height: 25 * heightPixel }} />
                            </View>
                            {this.state.pastEvents.length > 0
                                ?
                                <View style={{ width: '100%', alignItems: 'center' }}>
                                    <Text style={{ fontFamily: "Avenir", fontSize: 15 * widthPixel, fontWeight: '700' }}>
                                        Event History
                                </Text>
                                </View>
                                : <View />
                            }
                        </View>}
                    ListFooterComponent={
                        <View style={{ width: '100%' }}>
                            <View style={{ height: 17 * heightPixel }} />
                            <View style={{ width: '100%', alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'Avenir', fontWeight: '600', fontSize: 17 * widthPixel }}>
                                    {this.state.join_date === ""
                                        ? "" : "Joined " + this.state.join_date
                                    }
                                </Text>
                            </View>
                            <View style={{ height: 20 * heightPixel }} />
                        </View>
                    }
                    refreshing={false}
                    onRefresh={() => this._onRefresh(this.state.userId)}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        )
    }
}
const styles = StyleSheet.create({
    name_style: {
        fontFamily: 'Avenir',
        fontSize: widthPixel * 27,

    },
    information_style: {
        fontFamily: "Avenir",
        fontSize: widthPixel * 20,
    }
})