import React, { Component } from 'react'
import {
    FlatList, TextInput, Text, Image, View, Platform,
    StyleSheet, Dimensions, TouchableWithoutFeedback, TouchableOpacity, Modal, KeyboardAvoidingView
} from 'react-native'
import DatePicker from 'react-native-datepicker'
import { Header } from 'react-navigation'
import CircleBar, { _calculateNumPeople, _calculateAngle } from '../Components/CircleBar.js'
import { getTopBarColor } from '../Functions/ColorFuncs.js'
import StaticGlobal from '../Functions/StaticGlobal.js'
import { parseDate } from '../Functions/TimeFuncs'

const heightPixel = (Dimensions.get('window').height - Header.HEIGHT) / 667
const widthPixel = Dimensions.get('window').width / 375

const creatorPicMargins = 15 * heightPixel
const pictureSize = 60 * heightPixel

const textLeftMargin = 15 * widthPixel

const titleHeight = 60 * heightPixel
const timeHeight = 50 * heightPixel
const locationHeight = 55 * heightPixel
const descriptionHeight = 100 * heightPixel

const radioIconSize = 24 * widthPixel

const circleRadius = 60 * widthPixel
const circleAreaHeight = 140 * widthPixel
const circleAreaLabelHeight = 30 * heightPixel

export default class CreateEvent extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            title: "",
            headerTintColor: 'white',
            headerStyle: {
                backgroundColor: getTopBarColor()
            },
        }
    }

    async componentDidMount () {
        this._retrieveProfilePicture()
        if (this.state.editing) {
            this._retrieveEditInformation()
        }
    }

    constructor (props) {
        super(props)
        let current = new Date()
        this.nextHour = new Date(current.getFullYear(), current.getMonth(), current.getDate(), current.getHours() + 2)
        this.state = {
            titleText: "",
            keyboardAvoidingEnabled: false,
            date: this.nextHour,
            dateDisplayText: "",
            myPicture: "",
            locationText: "",
            descriptionText: "",
            locationLat: 0,
            locationLng: 0,
            privacySetting: "open",
            numPeople: 3,
            scrollYOffset: 0,
            editing: this.props.navigation.state.params.editing,
            eventId: this.props.navigation.state.params.eventId,
            // an eventid is only passed in if it is currently editing, that is the eventid that will be updated on the database
            page_items: [
                {
                    id: "Top_part"
                },
            ]
        }
    }

    _retrieveEditInformation () {
        let eventIds = [this.state.eventId]
        fetch(StaticGlobal.database_url + '/getEventsById', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                email: global.email,
                eventIds: eventIds,
            }),
        }).then(function (response) {
            let eventResponse = JSON.parse(response._bodyInit);
            if (eventResponse.isSuccess) {
                let event = eventResponse.value[0]
                let capacity = parseInt(event.capacity)
                let description = event.description
                let location = event.location
                let name = event.name
                let time = event.time
                let privacySetting = event.privacySetting
                let newAngle = _calculateAngle(capacity)

                let d = new Date(time)
                this.setState({
                    titleText: name,
                    descriptionText: description,
                    locationText: location,
                    privacySetting: privacySetting,
                    date: d,
                    dateDisplayText: parseDate(time),
                    numPeople: capacity,
                    currentAngleVal: newAngle
                }, () => {
                    this.state.currentAngle.setValue(newAngle)
                })
            }
        }.bind(this));
    }
    _retrieveProfilePicture () {
        fetch(StaticGlobal.database_url + '/getUserProfilePictures', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                email: global.email,
            }),
        }).then(function (response) {
            let profileResponse = JSON.parse(response._bodyInit);
            if (profileResponse.isSuccess) {
                this.setState({ myPicture: profileResponse.imageData[0] })
            }
        }.bind(this));
    }

    _onFirstPress () {
        this.setState({
            privacySetting: "open"
        })
    }

    _onSecondPress () {
        this.setState({
            privacySetting: "public"
        })
    }

    _onThirdPress () {
        this.setState({
            privacySetting: "private"
        })
    }

    _createSaveEventPressed () {
        let route = this.state.editing ? "/updateEvent" : "/createEvent"
        fetch(StaticGlobal.database_url + route, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                eventId: this.state.eventId,
                email: global.email,
                location: this.state.locationText,
                lat: this.state.locationLat,
                lng: this.state.locationLng,
                time: this.state.date,
                name: this.state.titleText,
                capacity: _calculateNumPeople(this.state.currentAngleVal),
                description: this.state.descriptionText,
                privacySetting: this.state.privacySetting
            })
        }).then(function (response) {
            let createEventResponse = JSON.parse(response._bodyInit);
            if (createEventResponse.isSuccess) {
                this.props.navigation.state.params._onEventChange()
                this.props.navigation.goBack(null);
            }
        }.bind(this));
    }

    _renderItem (item) {
        var endDate = new Date();
        if (item.id === "Top_part") {
            let backgroundColor1 = 'rgb(247,247,247)'
            let backgroundColor2 = 'rgb(247,247,247)'
            let backgroundColor3 = 'rgb(247,247,247)'

            if (this.state.privacySetting === "open") {
                backgroundColor1 = getTopBarColor()
            }
            else if (this.state.privacySetting === "public") {
                backgroundColor2 = getTopBarColor()
            }
            else if(this.state.privacySetting === "private") {
                backgroundColor3 = getTopBarColor()
            }
            return (
                <View style={styles.background}>
                    <View style={[styles.background, { opacity: 1 }]}>
                        <View style={{ height: creatorPicMargins }} />
                        <Image
                            source={{ uri: `data:image/gif;base64,${this.state.myPicture}` }}
                            style={styles.creatorPic}
                        />
                        <View style={{ height: creatorPicMargins }} />
                        <View style={[styles.categoryTextArea, { height: titleHeight }]}>
                            <View style={{ width: textLeftMargin }} />
                            <View style={{ justifyContent: 'center', width: 375 * widthPixel - 2 * textLeftMargin }}>
                                <TextInput
                                    multiline={false}
                                    style={styles.titleText}
                                    onFocus={() => this.setState({ keyboardAvoidingEnabled: false })}
                                    onChangeText={(titleText) => this.setState({ titleText })}
                                    value={this.state.titleText}
                                    placeholder="Event title"
                                    placeholderTextColor="rgb(190,190,190)"
                                />
                            </View>
                        </View>
                        <View style={{ height: 10 * heightPixel }} />
                        <View style={{ height: circleAreaLabelHeight }}>
                            <Text style={{ fontSize: 18 * widthPixel, fontFamily: 'Avenir', fontWeight: '800' }}>
                                Event Capacity
                            </Text>
                        </View>
                        <View style={[styles.categoryTextArea, { height: timeHeight }]}>
                            <DatePicker
                                style={{ zIndex: 4, justifyContent: 'center', height: '100%', width: 300 * widthPixel, opacity: 0 }}
                                date={this.state.date}
                                mode="time"
                                minDate={this.nextHour}
                                maxDate={new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 6, 23, 45)}
                                format="YYYY-M-D-H-m"
                                minuteInterval={15}
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                mode="datetime"
                                showIcon={false}
                                customStyles={{
                                    dateInput: {
                                        borderLeftWidth: 0,
                                        borderRightWidth: 0,
                                        borderTopWidth: 0,
                                        borderBottomWidth: 0,
                                        height: 25 * heightPixel,
                                        alignItems: 'flex-start'
                                    },
                                    btnTextConfirm: {
                                        color: getTopBarColor(),
                                        fontWeight: '400'
                                    },
                                }}
                                onDateChange={(date) => {
                                    let timeParts = date.split("-")
                                    let year = parseInt(timeParts[0])
                                    let month = parseInt(timeParts[1])
                                    let day = parseInt(timeParts[2])
                                    let hour = parseInt(timeParts[3])
                                    let minute = parseInt(timeParts[4])
                                    let newDate = new Date(year, month - 1, day, hour, minute)
                                    this.setState({
                                        date: newDate,
                                        dateDisplayText: parseDate(newDate + ""),
                                    })
                                }}
                            />
                            <View style={{ height: timeHeight, justifyContent: 'center', position: 'absolute', left: textLeftMargin }}>
                                {this.state.dateDisplayText === "" ?
                                    <Text style={{
                                        color: 'rgb(170,170,170)',
                                        fontFamily: 'Avenir',
                                        fontSize: 15 * widthPixel,
                                    }}>
                                        Select a date/time
                                    </Text>
                                    :
                                    <Text style={{
                                        fontFamily: 'Avenir',
                                        fontSize: 15 * widthPixel,
                                    }}>
                                        {this.state.dateDisplayText}
                                    </Text>
                                }
                            </View>
                        </View>
                        <View style={[styles.categoryTextArea, { flexDirection: 'row', height: locationHeight }]}>
                            <View style = {{width: textLeftMargin}}/>
                            <View style={{ justifyContent: 'center', width: 375 * widthPixel - 2 * textLeftMargin }}>
                                <TextInput 
                                    onChangeText = {(text) => {
                                        this.setState({
                                            locationText: text
                                        })
                                    }}
                                    value = {this.state.locationText}
                                    placeholder = "Location"
                                    placeholderTextColor = 'rgb(170,170,170)'
                                    style={{
                                        fontFamily: 'Avenir',
                                        fontWeight: '500',
                                        fontSize: 15 * widthPixel,
                                    }}
                                />
                            </View>
                        </View>
                        <View style = {{height: 5*heightPixel}}/>
                        <View style = {{width: '90%'}}>
                            <Text style={styles.descriptiveText}>
                                    Note: Location will only be displayed to event members.
                            </Text>
                        </View>
                        <View style = {{height: 40*heightPixel}}/>
                        <View style = {{width: '100%', flexDirection: 'row'}}>
                            <View style = {{width: textLeftMargin}}/>
                            <Text style = {styles.headerText}>
                                Motivational Speech:
                            </Text>
                        </View>
                        <View style={[styles.categoryTextArea, { height: descriptionHeight }]}>
                            <View style={{ width: textLeftMargin }} />
                            <View style={{ width: 375 * widthPixel - 2 * textLeftMargin }}>
                                <TextInput
                                    multiline={true}
                                    blurOnSubmit={true}
                                    onFocus={() => this.setState({ keyboardAvoidingEnabled: true })}
                                    style={[styles.categoryText, { color: 'rgb(30,164,133)' }]}
                                    onChangeText={(descriptionText) => this.setState({ descriptionText })}
                                    value={this.state.descriptionText}
                                    placeholder="Convince the bums to join your event"
                                    placeholderTextColor="rgb(170,170,170)"
                                />
                            </View>
                        </View>
                        <View style={{ height: 20*heightPixel}} />
                        <View style = {{width: "90%"}}>
                            <View style = {{flexDirection: 'row', alignItems: "center"}}>
                                <TouchableWithoutFeedback onPress={this._onFirstPress.bind(this)}>
                                    <View style = {{width: 24*widthPixel, height: 24*widthPixel, justifyContent: 'center', alignItems: "center", borderWidth: 1*widthPixel, borderColor: 'rgb(200,200,200)', borderRadius: 10*widthPixel}}>
                                        <View style={{ width: 14*widthPixel, height: 14*widthPixel, borderRadius: 7*widthPixel, backgroundColor: backgroundColor1 }}/>
                                    </View>
                                </TouchableWithoutFeedback>
                                <View style = {{width: 5*widthPixel}}/>
                                <Text style={styles.radioIconText}>
                                    Open
                                </Text>
                            </View>
                            <View style = {{height: 4*heightPixel}}/>
                            <Text style={styles.descriptiveText}>
                                Event can be viewed and joined by anyone!
                            </Text>
                            <View style = {{height: 20*heightPixel}}/>
                            <View style = {{flexDirection: 'row', alignItems: "center"}}>
                                <TouchableWithoutFeedback onPress={this._onSecondPress.bind(this)}>
                                    <View style = {{width: 24*widthPixel, height: 24*widthPixel, justifyContent: 'center', alignItems: "center", borderWidth: 1*widthPixel, borderColor: 'rgb(200,200,200)', borderRadius: 10*widthPixel}}>
                                        <View style={{ width: 14*widthPixel, height: 14*widthPixel, borderRadius: 7*widthPixel, backgroundColor: backgroundColor2 }}/>
                                    </View>
                                </TouchableWithoutFeedback>
                                <View style = {{width: 5*widthPixel}}/>
                                <Text style={styles.radioIconText}>
                                    Public
                                </Text>
                            </View>
                            <View style = {{height: 4*heightPixel}}/>
                            <Text style={styles.descriptiveText}>
                                You have the choice of who can join the event.
                            </Text>
                            <View style = {{height: 20*heightPixel}}/>
                            <View style = {{flexDirection: 'row', alignItems: "center"}}>
                                <TouchableWithoutFeedback onPress={this._onThirdPress.bind(this)}>
                                    <View style = {{width: 24*widthPixel, height: 24*widthPixel, justifyContent: 'center', alignItems: "center", borderWidth: 1*widthPixel, borderColor: 'rgb(200,200,200)', borderRadius: 10*widthPixel}}>
                                        <View style={{ width: 14*widthPixel, height: 14*widthPixel, borderRadius: 7*widthPixel, backgroundColor: backgroundColor3 }}/>
                                    </View>
                                </TouchableWithoutFeedback>
                                <View style = {{width: 5*widthPixel}}/>
                                <Text style={styles.radioIconText}>
                                    Private
                                </Text>
                            </View>
                            <View style = {{height: 4*heightPixel}}/>
                            <Text style={styles.descriptiveText}>
                                Members can join by invite only.
                            </Text>
                        </View>
                        <View style={{ height: 20 * heightPixel }} />
                        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end' }}>
                            {
                                this.state.titleText != "" && this.state.dateDisplayText != ""
                                    ?
                                    <TouchableOpacity onPress={this._createSaveEventPressed.bind(this)}>
                                        <View style={{ padding: 10 * widthPixel }}>
                                            <Text style={{ color: 'rgb(60,100,255)', fontFamily: 'Avenir', fontWeight: '600', fontSize: 16 * widthPixel }}>
                                                {
                                                    this.state.editing ?
                                                        "Save"
                                                        : "Create"
                                                }
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                    :
                                    <View style={{ padding: 10 * widthPixel }}>
                                        <Text style={{ color: 'rgb(200,200,200)', fontFamily: 'Avenir', fontWeight: '600', fontSize: 16 * widthPixel }}>
                                            {
                                                this.state.editing ?
                                                    "Save"
                                                    : "Create"
                                            }
                                        </Text>
                                    </View>
                            }
                            <View style={{ width: 30 * widthPixel }} />
                        </View>
                        <View style={{ height: 20 * heightPixel }} />
                    </View>
                </View >
            )
        }
    }

    render () {
        return (
            <View style={{ height: '100%', backgroundColor: 'rgb(247,247,247)' }}>
                <KeyboardAvoidingView
                    keyboardVerticalOffset={77 * heightPixel}
                    style={{ justifyContent: 'flex-end' }} behavior='position'
                    enabled={this.state.keyboardAvoidingEnabled}>
                    <FlatList
                        ref={ref => this.flatlist = ref}
                        style={{ width: '100%' }}
                        data={this.state.page_items}
                        onScroll={({ nativeEvent }) => {
                            this.setState({ scrollYOffset: nativeEvent.contentOffset.y })
                        }}
                        renderItem={({ item }) => (
                            this._renderItem(item)
                        )}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                    />
                </KeyboardAvoidingView>

            </View>
        )
    }
}


const styles = StyleSheet.create({
    background: {
        width: '100%',
        backgroundColor: 'rgb(247,247,247)',
        alignItems: 'center'
    },
    creatorPic: {
        width: pictureSize,
        height: pictureSize,
        borderRadius: pictureSize / 2
    },
    titleText: {
        fontFamily: 'Avenir',
        fontSize: 27 * widthPixel,
        width: 300 * widthPixel,
    },
    categoryTextArea: {
        width: '100%',
        backgroundColor: 'white',
        flexDirection: 'row',
        paddingTop: 10 * heightPixel,
        paddingBottom: 10 * heightPixel,
        borderBottomWidth: 2 * heightPixel,
        borderBottomColor: 'rgb(247,247,247)'
    },
    categoryText: {
        fontFamily: 'Avenir',
        fontSize: 15 * widthPixel,
    },
    radioIcons: {
        width: radioIconSize,
        height: radioIconSize
    },
    radioIconText: {
        fontFamily: 'Avenir',
        fontWeight: '500',
        color: "rgb(0,0,0)",
        fontSize: 15 * widthPixel
    },
    descriptiveText: {
        fontFamily: 'Avenir',
        fontWeight: '500',
        fontStyle: 'italic',
        color: "rgb(150,150,150)",
        fontSize: 13 * widthPixel
    },
    headerText: {
        fontFamily: 'Avenir',
        fontWeight: '700',
        fontSize: 16 * widthPixel,
        color: "rgb(154, 147, 236)"
    }
})