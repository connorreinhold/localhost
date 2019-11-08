import React, { Component } from 'react'
import { View, Image, Text, Dimensions, StyleSheet, TouchableWithoutFeedback} from 'react-native'


const widthPixel = Dimensions.get('window').width / 375
const heightPixel = Dimensions.get('window').height / 667

const verticalMargins = 13 * heightPixel
const guestPicSize = 45 * widthPixel
const innerSpace = 15 * widthPixel
const middleArea = 170 * widthPixel
export default class GuestEntry extends Component {
    constructor (props) {
        super(props)
    }
    render () {
        let guestPic = this.props.guestPic
        let guestName = this.props.guestName
        let guestId = this.props.guestId
        return (
            <View style={{ height: 2*verticalMargins+guestPicSize}}>
                <View style={styles.topArea} />
                <View style={{ flexDirection: 'row' }}>
                    {guestPic == "" ?
                        <View style={styles.guestPic} />
                        :
                        <TouchableWithoutFeedback onPress={() =>
                            this.props.navigation.navigate({
                                routeName: 'Profile',
                                params: { userId: guestId },
                                key: Math.random() * 10000,
                                // key allows react-native to differentiate between different instances of the same route
                            })} >
                            <Image
                                style={styles.guestPic}
                                source={{ uri: `data:image/gif;base64,${guestPic}` }}
                            />
                        </TouchableWithoutFeedback>
                }
                    <View style={{ width: innerSpace }} />
                    <View style={{ width: middleArea, height: '100%', justifyContent: 'center' }}>
                        <Text style={styles.nameFont}>
                            {guestName}
                        </Text>
                        <View style={{ height: 7 * heightPixel }} />
                    </View>
                </View>
                <View style={styles.bottomArea} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    guestPic: {
        width: guestPicSize,
        height: guestPicSize,
        borderRadius: guestPicSize / 2
    },
    topArea: {
        height: verticalMargins,
    },
    bottomArea: {
        height: verticalMargins,
    },
    nameFont: {
        fontFamily: 'Avenir',
        fontSize: widthPixel * 18,
    },
})