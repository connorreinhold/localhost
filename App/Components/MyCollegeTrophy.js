import React, { Component } from 'react'
import { Text, View, Image, StyleSheet, TouchableWithoutFeedback, Dimensions } from 'react-native'
import { Icon } from 'react-native-elements'

const widthPixel = Dimensions.get('window').width / 375
const heightPixel = Dimensions.get('window').height / 667

const trophySize = 50 * widthPixel
export default class Stars extends Component {
    constructor (props) {
        super(props)
    }

    _returnTrophy (college) {
        if (college === "Cornell") {
            return (
                <View style={{ padding: 10 * widthPixel }}>
                    <Icon
                        name="trophy"
                        type="font-awesome"
                        size={trophySize}
                        color={"rgb(179,27,27)"}
                    />
                </View>
            )
        }
        else if (college === "Dartmouth") {
            return (
                <View style={{ padding: 10 * widthPixel }}>
                    <Icon
                        name="trophy"
                        type="font-awesome"
                        size={trophySize}
                        color={"rgb(0,105,62)"}
                    />
                </View>
            )
        }
        else {
            return (
                <View style={{ padding: 10 * widthPixel }}>
                    <Icon
                        name="trophy"
                        type="font-awesome"
                        size={trophySize}
                        color={"rgb(0,0,0)"}
                    />
                </View>
            )
        }
    }
    render () {
        let college = this.props.college
        return (
            <View style={{ flexDirection: 'row' }}>
                {this._returnTrophy(college)}
            </View>
        )
    }
}


