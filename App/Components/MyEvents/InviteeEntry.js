import React, { Component } from 'react'
import { View, Image, Text, Dimensions, StyleSheet, TouchableWithoutFeedback, TouchableOpacity, } from 'react-native'
import { getTopBarColor } from '../../Functions/ColorFuncs';
import { withNavigation } from 'react-navigation';
import { Icon } from 'react-native-elements'


const widthPixel = Dimensions.get('window').width / 375
const heightPixel = Dimensions.get('window').height / 667

const verticalMargins = 13 * heightPixel
const inviteePicSize = 40 * widthPixel
const innerSpace = 15 * widthPixel
export default withNavigation(class InviteeEntry extends Component {
    constructor (props) {
        super(props)
        this.state = {
            invited: this.props.invited,
        }
    }
    render () {
        let inviteePic = this.props.inviteePic
        let inviteeName = this.props.inviteeName
        let inviteeId = this.props.inviteeId
        let invitedStatus = this.props.invitedStatus
        return (
            <View style={{ height: 2 * verticalMargins + inviteePicSize }}>
                <View style={styles.topArea} />
                <View style={{ flexDirection: 'row' }}>
                    {inviteePic == "" ?
                        <View style={styles.inviteePic} />
                        :
                        <TouchableWithoutFeedback onPress={() => {
                            this.props._triggerModalVisible()
                            this.props.navigation.navigate({
                                routeName: 'Profile',
                                params: { userId: inviteeId },
                                key: Math.random() * 10000,
                                // key allows react-native to differentiate between different instances of the same route
                            })
                        }} >
                            <Image
                                style={styles.inviteePic}
                                source={{ uri: `data:image/gif;base64,${inviteePic}` }}
                            />
                        </TouchableWithoutFeedback>
                    }
                    <View style={{ width: innerSpace }} />
                    <View style={{ minWidth: 175 * widthPixel, maxWidth: 175 * widthPixel, flex: 1, justifyContent: 'center' }}>
                        <Text style={styles.nameFont}>
                            {inviteeName}
                        </Text>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        {
                            invitedStatus === 2 ?
                                <View style={{ width: 30 * widthPixel, height: 30 * widthPixel, borderRadius: 15 * widthPixel, backgroundColor: 'rgb(160,160,160)', justifyContent: 'center', alignItems: 'center' }}>
                                    <Icon
                                        name="envelope-open"
                                        type="font-awesome"
                                        color="white"
                                        size={16 * widthPixel}
                                    />
                                </View>
                                :
                                invitedStatus === 1 ?
                                    <TouchableOpacity onPress={() => this.props._onInvite(inviteeId)}>
                                        <View style={{ width: 30 * widthPixel, height: 30 * widthPixel, borderRadius: 15 * widthPixel, backgroundColor: 'rgb(120,200,255)', justifyContent: 'center', alignItems: 'center' }}>
                                            <Icon
                                                name="envelope"
                                                type="font-awesome"
                                                color="white"
                                                size={16 * widthPixel}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                    :
                                    <View style={{ width: 30 * widthPixel, height: 30 * widthPixel, borderRadius: 15 * widthPixel, backgroundColor: 'rgb(160,160,160)', justifyContent: 'center', alignItems: 'center' }}>
                                        <Icon
                                            name="android"
                                            type="font-awesome"
                                            color="white"
                                            size={20 * widthPixel}
                                        />
                                    </View>
                        }

                    </View>
                </View>
                <View style={styles.bottomArea} />
            </View>
        )
    }
})

const styles = StyleSheet.create({
    inviteePic: {
        width: inviteePicSize,
        height: inviteePicSize,
        borderRadius: inviteePicSize / 2
    },
    topArea: {
        height: verticalMargins,
    },
    bottomArea: {
        height: verticalMargins,
    },
    nameFont: {
        fontFamily: 'Avenir',
        fontSize: widthPixel * 15,
    },
})