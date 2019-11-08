import React, { Component } from 'react'
import {
    FlatList, TextInput, Text, Image, View, Platform,
    StyleSheet, Dimensions, Animated, TouchableWithoutFeedback, TouchableOpacity, Modal, KeyboardAvoidingView
} from 'react-native'
import { Icon } from 'react-native-elements'
import DatePicker from 'react-native-datepicker'
import { Header } from 'react-navigation'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Constants, Location, Permissions } from 'expo'
import CircleBar, { _calculateNumPeople, _calculateAngle } from '../Components/CircleBar.js'
import { getTopBarColor } from '../Functions/ColorFuncs.js'
import StaticGlobal from '../Functions/StaticGlobal.js'
import { parseDate } from '../Functions/TimeFuncs'
import getPermission from '../Functions/getPermission';

const heightPixel = (Dimensions.get('window').height - Header.HEIGHT) / 667
const widthPixel = Dimensions.get('window').width / 375

const topBarHeight = Header.HEIGHT

const creatorPicMargins = 15 * heightPixel
const pictureSize = 60 * heightPixel
const secondMargin = 22 * heightPixel
const thirdMargin = 25 * heightPixel
const fourthMargin = 14 * heightPixel

const textLeftMargin = 15 * widthPixel

const titleHeight = 60 * heightPixel
const timeHeight = 50 * heightPixel
const locationHeight = 55 * heightPixel
const descriptionHeight = 150 * heightPixel

const radioButtonWidth = 100 * widthPixel
const radioButtonHeight = 50 * heightPixel
const radioIconSize = 24 * widthPixel

const circleRadius = 60 * widthPixel
const circleAreaHeight = 140 * widthPixel
const circleAreaLabelHeight = 30 * heightPixel
const AnimatedCircle = Animated.createAnimatedComponent(CircleBar)

const locationOfGooglePlace = creatorPicMargins * 2 + pictureSize + titleHeight + circleAreaHeight + circleAreaLabelHeight + timeHeight
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
            googlePlaceVisible: false,
            googleInputAnimationTop: new Animated.Value(locationOfGooglePlace),
            flatlistOpacity: new Animated.Value(1),
            locationLat: 0,
            locationLng: 0,
            numRadioSelected: 1, //will alternate between 1 and 2 to say which radio button is selected (1-left)
            toAngle: Math.PI / 18,
            currentAngle: new Animated.Value(Math.PI / 18),
            currentAngleVal: Math.PI / 18,
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
                    numRadioSelected: privacySetting,
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
            numRadioSelected: 1
        })
    }

    _onSecondPress () {
        this.setState({
            numRadioSelected: 2
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
                privacySetting: this.state.numRadioSelected
            })
        }).then(function (response) {
            let createEventResponse = JSON.parse(response._bodyInit);
            if (createEventResponse.isSuccess) {
                this.props.navigation.state.params._onEventChange()
                this.props.navigation.goBack(null);
            }
        }.bind(this));
    }

    _circleAreaPressed (event) {
        let centerYLoc = 2 * creatorPicMargins + pictureSize + titleHeight +
            10 * heightPixel + circleRadius + (topBarHeight + 20 * heightPixel) -
            this.state.scrollYOffset
        //adding the 20 pixels at the end I think has something to do with header. In reality it's junk code though.
        let centerXLoc = 375 / 2 * widthPixel
        let yDist = event.nativeEvent.pageY - centerYLoc
        let xDist = event.nativeEvent.pageX - centerXLoc
        if (xDist === 0 && yDist < 0) {
            toAngle = 0
        }
        else if (xDist > 0 && yDist < 0) {
            toAngle = Math.atan(Math.abs(xDist) / Math.abs(yDist))
        }
        else if (xDist > 0 && yDist === 0) {
            toAngle = Math.PI / 2 + Math.atan(Math.abs(yDist) / Math.abs(xDist))
        }
        else if (xDist > 0 && yDist > 0) {
            toAngle = Math.PI / 2 + Math.atan(Math.abs(yDist) / Math.abs(xDist))
        }
        else if (xDist === 0 && yDist > 0) {
            toAngle = Math.PI
        }
        else if (xDist < 0 && yDist > 0) {
            toAngle = Math.PI + Math.atan(Math.abs(xDist) / Math.abs(yDist))
        }
        else if (xDist < 0 && yDist === 0) {
            toAngle = 3 * Math.PI / 2
        }
        else if (xDist < 0 && yDist < 0) {
            toAngle = 3 * Math.PI / 2 + Math.atan(Math.abs(yDist) / Math.abs(xDist))
        }
        else {
            toAngle = 0
        }

        this.setState({
            toAngle: toAngle
        }, () => {
            animationLength = 200 + 50 * Math.abs(this.state.currentAngleVal - this.state.toAngle)
            Animated.timing(
                this.state.currentAngle, {
                    toValue: this.state.toAngle,
                    duration: animationLength
                }).start(() => {
                    this.setState({
                        currentAngleVal: this.state.toAngle
                    })
                })
        })
    }

    _setGooglePlacePickerInvisible () {
        this.state.googleInputAnimationTop.setValue(this.state.scrollYOffset)
        this.setState({
            googlePlaceVisible: false
        }, () => {
            Animated.parallel(
                [
                    Animated.spring(
                        this.state.googleInputAnimationTop,
                        {
                            friction: 7,
                            toValue: locationOfGooglePlace,
                            duration: 300
                        }
                    ),
                    Animated.timing(
                        this.state.flatlistOpacity,
                        {
                            toValue: 1,
                            duration: 300
                        }
                    )
                ]
            ).start()
        })
    }

    _setGooglePlacePickerVisible () {
        this.setState({
            keyboardAvoidingEnabled: false
        })
        Animated.parallel(
            [
                Animated.timing(
                    this.state.googleInputAnimationTop,
                    {
                        toValue: this.state.scrollYOffset,
                        duration: 200
                    }
                ),
                Animated.timing(
                    this.state.flatlistOpacity,
                    {
                        toValue: 0,
                        duration: 200
                    }
                )
            ]
        ).start(() => {
            this.setState({ googlePlaceVisible: true })
        })
    }
    _renderItem (item) {
        var endDate = new Date();
        if (item.id === "Top_part") {
            let backgroundColor1 = 'white'
            let backgroundColor2 = 'white'

            let icon1Color = 'rgb(200,200,200)'
            let icon2Color = 'rgb(200,200,200)'

            if (this.state.numRadioSelected === 1) {
                backgroundColor1 = getTopBarColor()
                icon1Color = 'white'
            }
            else if (this.state.numRadioSelected === 2) {
                backgroundColor2 = getTopBarColor()
                icon2Color = 'white'
            }
            return (
                <View style={styles.background}>
                    <Animated.View style={[styles.categoryTextArea, { zIndex: 3, position: 'absolute', top: this.state.googleInputAnimationTop, height: locationHeight }]}>
                        <View style={{ width: textLeftMargin }} />
                        <TouchableOpacity onPress={
                            this._setGooglePlacePickerVisible.bind(this)
                        }>
                            <View style={{ height: '100%', justifyContent: 'center', width: 375 * widthPixel - 2 * textLeftMargin }}>
                                {
                                    this.state.locationText === ""
                                        ?
                                        <Text style={{
                                            color: 'rgb(170,170,170)',
                                            fontFamily: 'Avenir',
                                            fontSize: 15 * widthPixel,
                                        }}>
                                            Location
                                        </Text>
                                        :
                                        <Text style={{
                                            color: 'black',
                                            fontWeight: '100',
                                            fontFamily: 'Avenir',
                                            fontSize: 15 * widthPixel,
                                        }}>
                                            {this.state.locationText}
                                        </Text>
                                }
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                    <Animated.View style={[styles.background, { opacity: this.state.flatlistOpacity }]}>
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
                        <View
                            onStartShouldSetResponder={() => { return true }}
                            onResponderGrant={(event) => { this._circleAreaPressed.bind(this)(event) }}
                            style={{ height: circleAreaHeight, alignItems: 'center', width: '100%' }}>
                            <View style={{ height: 10 * heightPixel }} />
                            <AnimatedCircle radius={circleRadius} end_angle={this.state.currentAngle} />
                        </View>
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
                                        Select a date
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

                        <View style={{ height: locationHeight }} />
                        <View style={[styles.categoryTextArea, { height: descriptionHeight }]}>
                            <View style={{ width: textLeftMargin }} />
                            <View style={{ width: 375 * widthPixel - 2 * textLeftMargin }}>
                                <TextInput
                                    multiline={true}
                                    blurOnSubmit={true}
                                    onFocus={() => this.setState({ keyboardAvoidingEnabled: true })}
                                    style={[styles.categoryText, { color: 'black' }]}
                                    onChangeText={(descriptionText) => this.setState({ descriptionText })}
                                    value={this.state.descriptionText}
                                    placeholder="Add Description"
                                    placeholderTextColor="rgb(170,170,170)"
                                />
                            </View>
                        </View>
                        <View style={{ height: thirdMargin }} />
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableWithoutFeedback onPress={this._onFirstPress.bind(this)}>
                                <View style={[styles.leftRadioButton, { backgroundColor: backgroundColor1 }]}>
                                    <Icon
                                        name="globe"
                                        type="font-awesome"
                                        size={radioIconSize}
                                        color={icon1Color}
                                    />
                                    <View style={{ height: 2 * heightPixel }} />
                                    <Text style={[styles.radioIconText, { color: icon1Color }]}>
                                        Public
                          </Text>
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={(event) => this._onSecondPress.bind(this)(event)}>
                                <View style={[styles.rightRadioButton, { backgroundColor: backgroundColor2 }]}>
                                    <Icon
                                        name='envelope'
                                        type='font-awesome'
                                        size={radioIconSize * 4 / 5}
                                        color={icon2Color}
                                    />
                                    <View style={{ height: 2 * heightPixel }} />
                                    <Text style={[styles.radioIconText, { color: icon2Color }]}>
                                        Private
                          </Text>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                        <View style={{ height: 20 * heightPixel }} />
                        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end' }}>
                            {
                                this.state.titleText != "" && this.state.dateDisplayText != "" &&
                                    true//this.state.locationText != "" && this.state.descriptionText != ""
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
                    </Animated.View>
                </View >
            )
        }
    }

    render () {
        return (
            <View style={{ height: '100%', backgroundColor: 'rgb(247,247,247)' }}>
                {this.state.googlePlaceVisible
                    ?
                    <View style={{ zIndex: 5, width: '100%', height: '100%', flex: 1, backgroundColor: 'rgb(247,247,247)', position: 'absolute' }}>
                        <GooglePlacesAutocomplete
                            placeholder='Location'
                            autoFocus={true}
                            returnKeyType={'search'}
                            enablePoweredByContainer={false}
                            listViewDisplayed='auto'
                            fetchDetails={true}
                            renderDescription={row => row.description}
                            onPress={(data, details = null) => {
                                this.setState({
                                    locationText: data.description,
                                    locationLat: details.geometry.location.lat,
                                    locationLng: details.geometry.location.lng,
                                })
                                this._setGooglePlacePickerInvisible()
                            }}
                            getDefaultValue={() => this.state.locationText}
                            query={{
                                // available options: https://developers.google.com/places/web-service/autocomplete
                                key: 'AIzaSyAg6TS22q4qq_hLYjYyAt4lKcsP3LG7U50',
                                language: 'en', // language of the results
                                types: ['establishment', 'address'], // default: 'geocode'
                                location: "" + global.myLatitude + ',' + global.myLongitude,
                                radius: '15000',
                                strictbounds: true,
                            }}
                            textInputProps={{
                                clearButtonMode: 'never'
                            }}
                            styles={{
                                textInputContainer: {
                                    backgroundColor: 'rgba(0,0,0,0)',
                                    borderTopWidth: 0,
                                    borderBottomWidth: 0,
                                    height: locationHeight,
                                },
                                textInput: {
                                    marginLeft: 0,
                                    marginRight: 0,
                                    marginTop: 0,
                                    height: locationHeight,
                                    color: 'black',
                                    fontWeight: '100',
                                    fontFamily: 'Avenir',
                                    fontSize: 15 * widthPixel,
                                    paddingTop: 0,
                                    paddingBottom: 0,
                                    paddingLeft: textLeftMargin,
                                },
                                predefinedPlacesDescription: {
                                    color: '#1faadb'
                                },
                            }}
                            nearbyPlacesAPI='GooglePlacesSearch'
                            GooglePlacesSearchQuery={{
                                rankby: 'distance',
                            }}
                            filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']}
                            debounce={200}
                        />
                        <TouchableWithoutFeedback onPress={this._setGooglePlacePickerInvisible.bind(this)}>
                            <View style={{ position: 'absolute', right: 20 * widthPixel, height: locationHeight, width: 15 * widthPixel, justifyContent: 'center', alignItems: 'center' }}>
                                <View style={{ width: 20 * widthPixel, height: 20 * widthPixel, justifyContent: 'center', alignItems: 'center', borderRadius: 10 * widthPixel, backgroundColor: 'rgb(200,200,200)' }}>
                                    <Icon
                                        name="angle-down"
                                        type="font-awesome"
                                        size={15 * widthPixel}
                                        color={'white'}
                                    />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                    : <View />
                }
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
    leftRadioButton: {
        width: radioButtonWidth,
        height: radioButtonHeight,
        borderTopLeftRadius: radioButtonHeight / 2,
        borderTopRightRadius: 1, //this is the biggest hackaround I HAVE NO IDEA WHY THIS FIXES
        borderBottomLeftRadius: radioButtonHeight / 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightRadioButton: {
        width: radioButtonWidth,
        height: radioButtonHeight,
        borderTopRightRadius: radioButtonHeight / 2,
        borderBottomRightRadius: radioButtonHeight / 2,
        justifyContent: 'center',
        alignItems: 'center'
    },
    radioIcons: {
        width: radioIconSize,
        height: radioIconSize
    },
    radioIconText: {
        fontFamily: 'Avenir',
        fontWeight: '500',
        fontSize: 13 * widthPixel
    }
})