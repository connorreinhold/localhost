import React, {Component} from 'react'
import {Text, View, StyleSheet, Dimensions} from 'react-native'

const heightPixel = Dimensions.get('window').height/667
const widthPixel = Dimensions.get('window').width/375

export default class Bio extends Component{
    render(){
        let text = this.props.text
        return(
            <View style = {styles.textContainer}>
                <Text style = {styles.text}>
                    {text}
                </Text>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    textContainer: {
        width: 250*widthPixel,
    },
    text: {
        fontFamily: 'Avenir',
        fontSize: 14*widthPixel,
        fontWeight: '400',
        textAlign: 'center'
    }
})