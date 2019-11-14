import React, { PureComponent } from 'react'
import { Text, View, Image, StyleSheet, Dimensions, TouchableWithoutFeedback, Animated } from 'react-native'
import { Icon } from 'react-native-elements'
import CircleBar from '../CircleBar.js'
import Swipeable from 'react-native-swipeable'

import { dimCalculate, Calculate, getTopBarColor } from '../../Functions/ColorFuncs.js'

const heightPixel = (Dimensions.get('window').height) / (667);
const widthPixel = (Dimensions.get('window').width) / 375;
const borderWidth = 0 * widthPixel;
const borderRadius = 10 * widthPixel

//VERY SIMILAR TO /Profile/PASTEVENTS.JS. Any change here needs to be made there
//Pure component because of the way it needs to work with the flatlist. Changing one doesn't force re-rendering of all of them
export default class EventDetails extends PureComponent {
    constructor (props) {
        super(props)
        this.state = {
            fadeAnim: new Animated.Value(1),
            minHeight: 500 * heightPixel,
            maxHeight: 0,
            heightAnim: new Animated.Value(),
            expanded: true,
            largerExpandedHeight: 999,
            animating: false,
            expandedAnim: new Animated.Value(),
            spinValue: new Animated.Value(0),
            circleSpinValue: new Animated.Value(0)
        }
        this._handleRight = this._animateApply.bind(this)
        this._handleLeft = this._animateDelete.bind(this)
    }
    _renderInvitationMessage (numPeople, maxPeople, invited) {
        text_view_style = {
            position: 'absolute',
            top: -1 * heightPixel,
            left: -5 * widthPixel + 24 * heightPixel,
            alignItems: 'center'
        }
        text_style = {
            fontFamily: "Avenir",
            fontSize: 12 * widthPixel,
            color: Calculate(numPeople, maxPeople),
            fontWeight: '700',
        }

        if (invited) {
            return (
                <View style={text_view_style}>
                    <Icon
                        name={"gift"}
                        type="font-awesome"
                        color={"rgb(255,223,0)"}
                        size={30 * heightPixel}
                    />
                </View>
            )
        }
    }

    componentDidMount () {
        this._mounted = true
    }
    componentWillUnmount () {
        this._mounted = false
    }

    _onRightAction () {
        this._handleRight(this.state.expanded)
    }
    _onLeftAction () {
        this._handleLeft(this.state.expanded)
    }
    _animateDelete (expanded) {
        this._executeAnimation(false, expanded)
    }
    _animateApply (expanded) {
        this._executeAnimation(true, expanded)
    }
    //apply is a boolean
    _executeAnimation (apply, expanded) {
        if (apply) {
            this.props._showModalApplied(this.props.privacySetting==="open")
        }
        Animated.timing(
            this.state.fadeAnim,
            {
                toValue: 0,
                duration: 300
            }).start(() => {
                if (expanded) {
                    this.state.heightAnim.setValue(this.state.maxHeight)
                }
                else {
                    this.state.heightAnim.setValue(this.state.minHeight)
                }
                Animated.timing(
                    this.state.heightAnim,
                    {
                        toValue: 0,
                        duration: 300
                    }
                ).start(() => {
                    if (apply) {
                        this.props._handleRight(this.props.eventId)
                    }
                    else {
                        this.props._handleLeft(this.props.eventId)
                    }
                })
            })
    }

    _setAnimationHeight (event) {
        newHeight = event.nativeEvent.layout.height
        if (newHeight < this.state.minHeight) {
            this.setState({
                minHeight: newHeight,
            })
        }
        else if (newHeight > this.state.maxHeight) {
            this.setState({
                maxHeight: newHeight
            })
        }
    }

    _setExpandedRegionHeight (event) {
        if (this._mounted) {
            if (this.state.largerExpandedHeight == 999) {
                this.setState({
                    largerExpandedHeight: event.nativeEvent.layout.height,
                }, () => {
                    this.state.expandedAnim.setValue(0)
                    this.setState({
                        expanded: false,
                    })

                })
            }
        }
    }

    _expandCard () {
        if (!this.state.animating) {
            this.setState({
                animating: true
            })
            if (this.state.expanded) {
                this.setState({
                    expanded: false,
                }, () => {

                    Animated.spring(
                        this.state.circleSpinValue,
                        {
                            toValue: 0,
                            friction: 4,
                            tension: 8,
                        }
                    ).start()
                    Animated.parallel([
                        Animated.timing(
                            this.state.expandedAnim,
                            {
                                toValue: 0,
                                duration: 200
                            }
                        ),
                        Animated.timing(
                            this.state.spinValue,
                            {
                                toValue: 0,
                                duration: 200
                            }
                        ),
                    ]).start(() => { this.setState({ animating: false }) })
                })
            }
            else {

                Animated.spring(
                    this.state.circleSpinValue,
                    {
                        toValue: 1,
                        friction: 4,
                        tension: 8,
                    }
                ).start()
                Animated.parallel([
                    Animated.timing(
                        this.state.expandedAnim,
                        {
                            toValue: this.state.largerExpandedHeight,
                            duration: 200
                        }
                    ),
                    Animated.timing(
                        this.state.spinValue,
                        {
                            toValue: 1,
                            duration: 200
                        }
                    ),
                ]).start(() => {
                    this.setState({
                        expanded: true,
                        animating: false
                    })
                }
                )
            }
        }
    }
    _renderCard (description, title, time, guests, maxPeople, hostPic, hostId, invited, eventId, anonymous, privacySetting, lockPressPic) {
        return (
            <View style={{
                shadowColor: "#a2a2a2",
                borderRadius: 10 * widthPixel,
                shadowOpacity: 0.5,
                shadowRadius: 8,
                shadowOffset: {
                    height: 2,
                    width: 0
                },
                backgroundColor: "white"
            }}>
                <TouchableWithoutFeedback onPress={this._expandCard.bind(this)}>
                    <View>
                        <View style={[styles.topArea, { height: 15 * heightPixel, borderColor: dimCalculate(guests.length, maxPeople) }]} />
                        {this._renderInvitationMessage(guests.length, maxPeople, invited)}
                        {
                            privacySetting === "private" ?
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
                        <View style={{ top: -2 * heightPixel }}>
                            <View style={[styles.topInfo, { flexDirection: 'row', borderColor: dimCalculate(guests.length, maxPeople) }]}>
                                <View style={{ width: 10 * widthPixel }} />
                                {
                                    !lockPressPic ?
                                        <TouchableWithoutFeedback onPress={() => {
                                            if (!anonymous) {
                                                this.props.navigation.navigate({
                                                    routeName: 'Profile',
                                                    params: { userId: hostId },
                                                    key: Math.random() * 10000,
                                                    // key allows react-native to differentiate between different instances of the same route
                                                })
                                            }
                                        }}>
                                            {hostPic == "" ?
                                                <View style={styles.hostPic} />
                                                :
                                                invited ?
                                                    <Image
                                                        style={[styles.hostPic, { borderWidth: 3 * widthPixel, borderColor: 'rgb(255,223,0)' }]}
                                                        source={{ uri: `data:image/gif;base64,${hostPic}` }}
                                                    />
                                                    :
                                                    <Image
                                                        style={styles.hostPic}
                                                        source={{ uri: `data:image/gif;base64,${hostPic}` }}
                                                    />
                                            }
                                        </TouchableWithoutFeedback>
                                        :
                                        hostPic == "" ?
                                            <View style={styles.hostPic} />
                                            :
                                            invited ?
                                                <Image
                                                    style={[styles.hostPic, { borderWidth: 3 * widthPixel, borderColor: 'rgb(255,223,0)' }]}
                                                    source={{ uri: `data:image/gif;base64,${hostPic}` }}
                                                />
                                                :
                                                <Image
                                                    style={styles.hostPic}
                                                    source={{ uri: `data:image/gif;base64,${hostPic}` }}
                                                />

                                }
                                <View style={{ left: 13 * widthPixel, justifyContent: 'center', minWidth: 200 * widthPixel, maxWidth: 200 * widthPixel }}>
                                    <View style={{ flexDirection: 'column' }}>
                                        <Text style={styles.titleFont}>
                                            {title}
                                        </Text>
                                        <Text style={styles.timeFont}>
                                            {time}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableWithoutFeedback onPress={() =>
                                    this.props.navigation.navigate({
                                        routeName: 'GuestList',
                                        params: { title: title, eventId: eventId, maxPeople: maxPeople, hosting: false },
                                        key: Math.random() * 10000,
                                        // key allows react-native to differentiate between different instances of the same route
                                    })}>
                                    <View style={{
                                        flex: 1
                                    }}>
                                        <Animated.View style={{
                                            transform:
                                                [{
                                                    rotate: this.state.circleSpinValue.interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: ['0deg', '360deg']
                                                    })
                                                }],
                                        }}>
                                            <CircleBar numPeople={guests.length} maxPeople={maxPeople}
                                                radius={widthPixel * 25} />
                                        </Animated.View>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                            <View onLayout={this._setExpandedRegionHeight.bind(this)} style={[styles.emptySpaceBottom]}>
                                <Animated.View style={{ height: this.state.expandedAnim }}>
                                    {
                                        this.state.expanded ?
                                            <View style={{}}>
                                                <View style={{ left: '6.5%', width: '89%' }}>
                                                    <View style={{ height: 15 * heightPixel }} />
                                                    <Text style={{
                                                        fontFamily: 'Avenir',
                                                        fontWeight: '100',
                                                        color: 'rgb(102,102,102)',
                                                        fontSize: widthPixel * 13
                                                    }}>
                                                        {description}
                                                    </Text>
                                                </View>
                                            </View>
                                            : <Text />
                                    }
                                </Animated.View>
                            </View>
                            <View style={{ height: 10 * heightPixel }} />
                            <Animated.View style={{
                                height: 25 * heightPixel,
                                transform:
                                    [{
                                        rotate: this.state.spinValue.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['0deg', '180deg']
                                        })
                                    }]
                            }}>
                                <Icon
                                    name="angle-down"
                                    type="font-awesome"
                                    color={'rgb(200,200,200)'}
                                    size={25 * heightPixel}
                                />
                            </Animated.View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        )
    }
    render () {
        let description = this.props.description;
        let title = this.props.title;
        let time = this.props.time;
        let guests = this.props.guests;
        let maxPeople = this.props.maxPeople;
        let hostPic = this.props.hostPic;
        let hostId = this.props.hostId
        let invited = this.props.invited
        let eventId = this.props.eventId
        let anonymous = this.props.anonymous
        let privacySetting = this.props.privacySetting
        let lockSwiping = this.props.lockSwiping
        let lockPressPic = this.props.lockPressPic

        let swipeRight = [
            <TouchableWithoutFeedback onPress={this._onRightAction.bind(this)}>
                <View style={{
                    height: '100%',
                    width: '100%',
                    borderRadius: 15 * widthPixel,
                    alignItems: 'flex-start'
                }}>
                    <View style={{ height: '100%', flexDirection: 'row' }}>
                        <View style={{ width: 55 * widthPixel }} />
                        <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Icon
                                name="check"
                                type="font-awesome"
                                size={70 * heightPixel}
                                color={"#3CB371"}
                            />
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>,
        ]
        let swipeLeft = [
            <TouchableWithoutFeedback onPress={this._onLeftAction.bind(this)}>
                <View style={{
                    height: '100%',
                    width: '100%',
                    borderRadius: 15 * widthPixel,
                    alignItems: 'flex-end',
                    borderRadius: 10 * widthPixel,
                }}>
                    <View style={{ height: '100%', flexDirection: 'row' }}>
                        <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Icon
                                name="times"
                                type="font-awesome"
                                size={70 * heightPixel}
                                color={"#FA8072"}
                            />
                        </View>
                        <View style={{ width: 55 * widthPixel }} />
                    </View>
                </View>
            </TouchableWithoutFeedback>,
        ]

        //https://www.youtube.com/watch?v=Lt1NGrWEMMQ USE FIREBASE FOR THESE PICTURES
        return (
            <Animated.View onLayout={this._setAnimationHeight.bind(this)}
                style={{
                    height: this.state.heightAnim, opacity: this.state.fadeAnim,
                    left: '3%', width: '94%', flexDirection: 'column', justifyContent: 'center',
                }}>
                <View style={{ height: 15 * heightPixel }} />

                {lockSwiping ?
                    this._renderCard(description, title, time, guests, maxPeople, hostPic, hostId, invited, eventId, anonymous, privacySetting, lockPressPic)
                    :
                    <Swipeable
                        rightButtonWidth={180 * widthPixel}
                        leftButtonWidth={180 * widthPixel}
                        leftButtons={swipeLeft}
                        rightButtons={swipeRight}
                        leftActionActivationDistance={500 * widthPixel}
                        rightActionActivationDistance={500 * widthPixel}
                        onLeftActionRelease={this._onLeftAction.bind(this)}
                        onRightActionRelease={this._onRightAction.bind(this)}
                    >
                        {this._renderCard(description, title, time, guests, maxPeople, hostPic, hostId, invited, eventId, privacySetting, lockPressPic)}
                    </Swipeable>
                }


            </Animated.View>


        )
    }
}
const styles = StyleSheet.create({
    hostPic: {
        width: heightPixel * 50,
        height: heightPixel * 50,
        borderRadius: heightPixel * 25,
    },
    titleFont: {
        fontFamily: 'Avenir',
        fontWeight: '800',
        fontSize: widthPixel * 19
    },
    timeFont: {
        fontFamily: 'Avenir',
        fontWeight: '100',
        fontSize: widthPixel * 16
    },
    topArea: {
        borderLeftWidth: borderWidth,
        borderRightWidth: borderWidth,
        borderTopWidth: borderWidth,
        borderTopLeftRadius: borderRadius,
        borderTopRightRadius: borderRadius,
    },
    topInfo: {
        borderLeftWidth: borderWidth,
        borderRightWidth: borderWidth
    },
    emptySpaceBottom: {
        borderLeftWidth: borderWidth,
        borderRightWidth: borderWidth,
        borderBottomWidth: borderWidth,
        borderBottomLeftRadius: borderRadius,
        borderBottomRightRadius: borderRadius,
    },
    rightSlider: {
        flex: 1,
        left: '10%',
        justifyContent: 'center',
        backgroundColor: 'rgb(60,100,255)'
    },
    leftSlider: {
        flex: 1,
        right: '11%',
        justifyContent: 'center',
        backgroundColor: 'red',
        alignItems: 'flex-end'
    },
});