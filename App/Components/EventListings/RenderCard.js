import React, { PureComponent } from 'react'
import { Text, View, Image, StyleSheet, TouchableWithoutFeedback, Animated, Dimensions } from 'react-native'
import { Calculate, dimCalculate } from '../../Functions/ColorFuncs.js'
import { Icon } from 'react-native-elements'
import CircleBar from '../CircleBar.js'
import { _getAnonAvatar } from '../../Functions/AvatarGen.js'

const heightPixel = (Dimensions.get('window').height) / (667);
const widthPixel = (Dimensions.get('window').width) / 375;
const borderRadius = 10 * widthPixel

export default function _renderCard (
    description, title, time,
    guests, maxPeople, hostPic,
    hostId, invited, eventId,
    anonymous, privacySetting, lockPressPic,
    _expandCard, _setExpandedRegionHeight,
    circleSpinValue, spinValue,
    initializedExpandedAnim,
    expandedAnim,
    expanded,
    navigation) {
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
            <TouchableWithoutFeedback onPress={_expandCard}>
                <View>
                    <View style={[styles.topArea, { height: 15 * heightPixel, borderColor: dimCalculate(guests.length, maxPeople) }]} />
                    {_renderInvitationMessage(guests.length, maxPeople, invited)}
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
                        <View style={{ flexDirection: 'row', borderColor: dimCalculate(guests.length, maxPeople) }}>
                            <View style={{ width: 10 * widthPixel }} />
                            <TouchableWithoutFeedback onPress={() => {
                                if (!anonymous && !lockPressPic) {
                                    navigation.navigate({
                                        routeName: 'Profile',
                                        params: { userId: hostId },
                                        key: Math.random() * 10000,
                                        // key allows react-native to differentiate between different instances of the same route
                                    })
                                }
                            }}>
                                {!hostPic ?
                                    <Image
                                        style={styles.hostPic}
                                        source={_getAnonAvatar(title)}
                                    />
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
                                navigation.navigate({
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
                                                rotate: circleSpinValue.interpolate({
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
                        <View onLayout={_setExpandedRegionHeight} style={[styles.emptySpaceBottom]}>
                            <Animated.View style={[initializedExpandedAnim ? { height: expandedAnim } : {}]}>
                                {
                                    expanded ?
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
                                    rotate: spinValue.interpolate({
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

function _renderInvitationMessage (numPeople, maxPeople, invited) {
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
        borderTopLeftRadius: borderRadius,
        borderTopRightRadius: borderRadius,
    },
    emptySpaceBottom: {
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