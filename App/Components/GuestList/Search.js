import React, {Component} from 'react'
import {TextInput, View, Dimensions, StyleSheet} from 'react-native'

const heightPixel = Dimensions.get("window").height/667
const widthPixel = Dimensions.get('window').width/375
export default class Search extends Component{
    constructor(props){
        super(props)
        this.state={
            text: ""
        }
    }
    render(){
        return(
            <View>
                <View style={{height: 15*heightPixel}}/>
                <View style = {styles.searchBar}>
                    <View style = {{width: 10*widthPixel}}/>
                    <TextInput
                        multiline = {false}
                        style = {styles.searchText}
                        onChangeText={(text) => this.setState({text})}
                        value={this.state.text}
                        placeholder="Search Members"
                        placeholderTextColor="rgb(160,160,160)"
                    />
                </View>
            </View>

        )
    }
}
const styles = StyleSheet.create({
    searchBar: {
        backgroundColor: 'rgb(240,240,240)',
        borderRadius: 10*widthPixel,
        height: 30*heightPixel,
        width: '100%',
        flexDirection: 'row',
    },
    searchText: {
        fontFamily: 'Avenir',
        fontSize: 13*widthPixel,
        color: 'rgb(170,170,170)'
    }
})