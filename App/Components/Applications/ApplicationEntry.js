import React, { Component } from 'react'
import {
    View, Image, Text, Dimensions, StyleSheet, TouchableWithoutFeedback, Animated
    , TouchableOpacity
} from 'react-native'
import { Icon } from 'react-native-elements'
import StaticGlobal from '../../Functions/StaticGlobal'
import { withNavigation } from 'react-navigation';

const widthPixel = Dimensions.get('window').width / 375
const heightPixel = Dimensions.get('window').height / 667

const verticalMargins = 13 * heightPixel
const applicantPicSize = 45 * widthPixel
const innerSpace = 15 * widthPixel
const middleArea = 170 * widthPixel
export default withNavigation(class ApplicationEntry extends Component {
    constructor (props) {
        super(props)
        this.state = {
            animatedHeight: new Animated.Value(2 * verticalMargins + applicantPicSize),
            animatedOpacity: new Animated.Value(1),
            confirmDecisionOpacity: new Animated.Value(0),
            showConfirmBox: false,
            acceptPressed: false,
            // false means delete was pressed, true means accept was pressed behavior unspecified if neither pressed
        }
    }

    _crossPressed () {
        this.setState({
            showConfirmBox: true,
            acceptPressed: false
        }, () => {
            Animated.timing(
                this.state.confirmDecisionOpacity,
                {
                    toValue: 1,
                    duration: 300
                }).start()
        })
    }

    _checkPressed () {
        this.setState({
            showConfirmBox: true,
            acceptPressed: true
        }, () => {
            Animated.timing(
                this.state.confirmDecisionOpacity,
                {
                    toValue: 1,
                    duration: 300
                }).start()
        })

    }
    _cancelPressed() {
        Animated.timing(
            this.state.confirmDecisionOpacity,
            {
                toValue: 0,
                duration: 300
            }).start(() => {
                this.setState({
                    showConfirmBox: false
                })
            })
    }

    _acceptApplicant() {
        this.props._animateCircleForward()
        Animated.timing(
            this.state.animatedOpacity,
            {
                toValue: 0,
                duration: 300
            }).start(() => {
                Animated.timing(
                    this.state.animatedHeight,
                    {
                        toValue: 0,
                        duration: 300
                    }).start(() => {
                        this.props._postAcceptance(this.props.applicantId)
                    })
            })
    }

    _rejectApplicant() {
        this.props._animateCircleForward()
        Animated.timing(
            this.state.animatedOpacity,
            {
                toValue: 0,
                duration: 300
            }).start(() => {
                Animated.timing(
                    this.state.animatedHeight,
                    {
                        toValue: 0,
                        duration: 300
                    }).start(() => {
                        this.props._postRejection(this.props.applicantId)
                    })
            })
    }

    render () {
        let applicantPic = this.props.applicantPic
        let applicantName = this.props.applicantName
        let applicantId = this.props.applicantId
        return (
            <Animated.View style={{ height: this.state.animatedHeight, opacity: this.state.animatedOpacity, flexDirection: 'column' }}>
                {
                    this.state.showConfirmBox ?
                        <Animated.View style={{ position: 'absolute', zIndex: 5, height: '100%', width: '100%', backgroundColor: 'white', opacity: this.state.confirmDecisionOpacity }}>
                            <View style = {{flexDirection: 'row', height: '100%', alignItems: 'center'}}>
                                <View style = {{width: 20*widthPixel}}/>
                                <Text style = {{fontFamily: "Avenir", fontWeight: '700', fontSize: 16*widthPixel}}>
                                    Please confirm:
                                </Text>
                                <View style = {{width: 20*widthPixel}}/>
                                {
                                    this.state.acceptPressed ?
                                    <TouchableOpacity onPress={this._acceptApplicant.bind(this)}>
                                        <View style={{
                                            borderRadius: 3 * widthPixel,
                                            minWidth: 70 * widthPixel,
                                            minHeight: 27 * heightPixel,
                                            backgroundColor: '#8bbd78',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <Text style={{
                                                color: 'white',
                                                fontFamily: 'Avenir',
                                                fontWeight: '500',
                                                fontSize: 14 * widthPixel,
                                            }}>
                                                Accept
                                    </Text>
                                        </View>
                                    </TouchableOpacity>
                                    :
                                    <TouchableOpacity onPress={this._rejectApplicant.bind(this)}>
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
                                                Reject
                                    </Text>
                                        </View>
                                    </TouchableOpacity>
                                }
                                <View style={{ width: 15 * widthPixel }} />
                                <TouchableOpacity onPress={this._cancelPressed.bind(this)}>
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
                <View style={{ height: verticalMargins }} />
                <View style={{ height: applicantPicSize, flexDirection: 'row' }}>
                    <View style={{ height: '100%', justifyContent: 'center' }}>
                        {applicantPic == "" ?
                            <View style={styles.applicantPic} />
                            :
                            <TouchableWithoutFeedback onPress={() =>
                                this.props.navigation.navigate({
                                    routeName: 'Profile',
                                    params: { userId: applicantId },
                                    key: Math.random() * 10000,
                                    // key allows react-native to differentiate between different instances of the same route
                                })} >
                                <Image
                                    style={styles.applicantPic}
                                    source={{ uri: `data:image/gif;base64,${applicantPic}` }}
                                />
                            </TouchableWithoutFeedback>
                        }
                    </View>
                    <View style={{ width: innerSpace }} />
                    <View style={{ width: middleArea, height: '100%', justifyContent: 'center' }}>
                        <Text style={styles.nameFont}>
                            {applicantName}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={this._crossPressed.bind(this)}>
                        <View style={{ height: '100%', justifyContent: 'center' }}>
                            <Icon
                                name="times"
                                type="font-awesome"
                                size={35 * widthPixel}
                                color={"#FA8072"}
                            />
                        </View>
                    </TouchableOpacity>
                    <View style={{ width: 25 * widthPixel }} />
                    <TouchableOpacity onPress={this._checkPressed.bind(this)}>
                        <View style={{ height: '100%', justifyContent: 'center' }}>
                            <Icon
                                name="check"
                                type="font-awesome"
                                size={35 * widthPixel}
                                color={"#3CB371"}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{ height: verticalMargins }} />
            </Animated.View>
        )
    }
})

const styles = StyleSheet.create({
    applicantPic: {
        width: applicantPicSize,
        height: applicantPicSize,
        borderRadius: applicantPicSize / 2
    },
    nameFont: {
        fontFamily: 'Avenir',
        fontSize: widthPixel * 18,
    },
})