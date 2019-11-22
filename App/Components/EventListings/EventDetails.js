import React, { PureComponent } from 'react'
import { Text, View, Image, StyleSheet, Dimensions, TouchableOpacity, TouchableWithoutFeedback, Animated } from 'react-native'
import { Icon } from 'react-native-elements'
import Swipeable from 'react-native-swipeable'
import _renderCard from './RenderCard'

const heightPixel = (Dimensions.get('window').height) / (667);
const widthPixel = (Dimensions.get('window').width) / 375;

//VERY SIMILAR TO /Profile/PASTEVENTS.JS. Any change here needs to be made there
//Pure component because of the way it needs to work with the flatlist. Changing one doesn't force re-rendering of all of them
export default class EventDetails extends PureComponent {
    constructor (props) {
        super(props)
        this.state = {
            fadeAnim: new Animated.Value(1),
            minHeight: 500 * heightPixel,
            maxHeight: 0,
            expanded: true,
            largerExpandedHeight: 999,
            animating: false,
            expandedAnim: new Animated.Value(),
            heightAnim: new Animated.Value(),
            spinValue: new Animated.Value(0),
            circleSpinValue: new Animated.Value(0),
            initializedHeightAnim: false,
            initializedExpandedAnim: false,
        }
        this._handleRight = this._animateApply.bind(this)
        this._handleLeft = this._animateDelete.bind(this)
        this._expandCard = this._expandCard.bind(this)
        this._setExpandedRegionHeight = this._setExpandedRegionHeight.bind(this)
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
            this.props._showModalApplied(this.props.privacySetting === "open")
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
                        if (apply) {
                            this.props._handleRight(this.props.eventId)
                        }
                        else {
                            this.props._handleLeft(this.props.eventId)
                        }
                    })
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
                        initializedExpandedAnim: true,
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
            <TouchableOpacity onPress={this._onRightAction.bind(this)}>
                <View style={{
                    height: '100%',
                    width: '100%',
                    borderRadius: 15 * widthPixel,
                    alignItems: 'flex-start'
                }}>
                    <View style={{ height: '100%', flexDirection: 'row' }}>
                        {privacySetting === "open" ?
                            <View style={{ height: '100%', flexDirection: 'row' }}>
                                <View style={{ width: 53 * widthPixel }} />
                                <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 50 * widthPixel, fontWeight: '700', color: 'rgb(90, 219, 143)', fontFamily: 'Avenir' }}>
                                        join
                                    </Text>
                                </View>
                            </View>
                            :
                            <View style={{ height: '100%', flexDirection: 'row' }}>
                                <View style={{ width: 33 * widthPixel }} />
                                <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 50 * widthPixel, fontWeight: '700', color: 'rgb(120, 200, 255)', fontFamily: 'Avenir' }}>
                                        apply
                                    </Text>
                                </View>
                            </View>

                        }

                    </View>
                </View>
            </TouchableOpacity>,
        ]
        let swipeLeft = [
            <TouchableOpacity onPress={this._onLeftAction.bind(this)}>
                <View style={{
                    height: '100%',
                    width: '100%',
                    borderRadius: 15 * widthPixel,
                    alignItems: 'flex-end',
                    borderRadius: 10 * widthPixel,
                }}>
                    <View style={{ height: '100%', flexDirection: 'row' }}>
                        <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 50 * widthPixel, fontWeight: '700', color: "#FA8072", fontFamily: 'Avenir' }}>
                                nah
                            </Text>
                        </View>
                        <View style={{ width: 55 * widthPixel }} />
                    </View>
                </View>
            </TouchableOpacity>,
        ]

        //https://www.youtube.com/watch?v=Lt1NGrWEMMQ USE FIREBASE FOR THESE PICTURES
        return (
            <Animated.View onLayout={this._setAnimationHeight.bind(this)}
                style={[{
                    opacity: this.state.fadeAnim,
                    left: '3%', width: '94%', flexDirection: 'column', justifyContent: 'center',
                }, this.state.initializedHeightAnim ? { height: this.state.heightAnim } : {}]}>
                <View style={{ height: 15 * heightPixel }} />

                {lockSwiping ?
                    _renderCard(
                        description, title, time,
                        guests, maxPeople, hostPic,
                        hostId, invited, eventId,
                        anonymous, privacySetting, lockPressPic,
                        this._expandCard, this._setExpandedRegionHeight,
                        this.state.circleSpinValue, this.state.spinValue,
                        this.state.initializedExpandedAnim,
                        this.state.expandedAnim,
                        this.state.expanded,
                        this.props.navigation)
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
                        {_renderCard(
                            description, title, time,
                            guests, maxPeople, hostPic,
                            hostId, invited, eventId,
                            anonymous, privacySetting, lockPressPic,
                            this._expandCard, this._setExpandedRegionHeight,
                            this.state.circleSpinValue, this.state.spinValue,
                            this.state.initializedExpandedAnim,
                            this.state.expandedAnim,
                            this.state.expanded,
                            this.props.navigation
                        )}
                    </Swipeable>
                }


            </Animated.View>


        )
    }
}