import React, { Component } from 'react'
import { AsyncStorage, Text, View, Dimensions, StyleSheet, TouchableWithoutFeedback, KeyboardAvoidingView, TextInput, Image, FlatList, ActivityIndicator } from 'react-native'
import { Icon } from 'react-native-elements'
import { getTopBarColor } from '../../Functions/ColorFuncs.js'
import StaticGlobal from '../../Functions/StaticGlobal.js'

const heightPixel = Dimensions.get('window').height / 667
const widthPixel = Dimensions.get('window').width / 375

export default class UnverifiedAccount extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            header: null
        }
    }
    constructor (props) {
        super(props)
        this.state = {
            confirmationSent: false,
            isFetching: false,
            isSending: false
        }
        this.secondPass = null
    }
    componentDidMount() {
        this.timer = setInterval(()=> this._onRefresh(), 1000)
    }

    componentWillUnmount () {
        clearInterval(this.timer)
    }

    _resendConfirmationEmail () {
        if (!this.state.isSending) {
            this.setState({
                isSending: true,
            })
            fetch(StaticGlobal.database_url + '/sendConfirmation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    hostLink: StaticGlobal.database_url
                })
            }).then(function(response) {
                return response.json()
            }).then(function (response) {
                let confirmationResponse = response
                if (confirmationResponse.isSuccess) {
                    this.setState({
                        confirmationSent: true,
                        isSending: false
                    })
                }
            }.bind(this));
        }
    }

    _onRefresh () {
        console.log("Called")
        fetch(StaticGlobal.database_url + '/checkEmailConfirmed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: global.email,
                token: global.session_id
            })
        }).then(function(response) {
            return response.json()
        }).then(function (response) {
            let checkResponse = response
            if (checkResponse.isSuccess) {
                let isVerified = checkResponse.value
                if (isVerified) {
                    AsyncStorage.setItem('token', global.session_id, () => {
                        AsyncStorage.setItem('email', global.email, () => {
                            this.props.navigation.navigate("LoggedInVerified")
                        })
                    });
                }
                this.setState({ isFetching: false })
            }
        }.bind(this));
    }

    render () {
        return (
            <View style = {{height: '100%', width: '100%'}}>
                <FlatList
                    style={{position: 'absolute', width: '100%', height: '100%' }}
                    showsVerticalScrollIndicator={false}
                    refreshing={this.state.isFetching}
                    onRefresh={this._onRefresh.bind(this)}
                    ListHeaderComponent={
                        <View style={{ width: '100%', height: '100%', alignItems: 'center' }}>
                        <View style={{ height: 100 * heightPixel }} />
                            <View style={{ width: '80%', alignItems: 'center' }}>
                                <Text style={{ fontFamily: "Avenir", color: 'black', fontSize: 18 * heightPixel, }}>
                                    Please verify your account.
                            </Text>
                                <View style={{ height: 30 * heightPixel }} />
                                {
                                    this.state.confirmationSent ?
                                        <Text style={{ fontStyle: 'italic', fontFamily: "Avenir", fontSize: 15 * heightPixel }}>
                                            Confirmation sent
                                        </Text>
                                        :
                                        this.state.isSending ? 
                                        <ActivityIndicator size="large" color="#888888" />
                                        :
                                        <Text style={{ textAlign: "center", fontFamily: "Avenir", color: 'black', fontSize: 15 * heightPixel }}>
                                            {"Click "}
                                            <TouchableWithoutFeedback onPress={this._resendConfirmationEmail.bind(this)}>
                                                <Text style={{ color: 'blue' }}>
                                                    here
                                    </Text>
                                            </TouchableWithoutFeedback>
                                            {" to resend a confirmation email to " + global.email}
                                        </Text>
                                }
                            </View>
                        </View>
                    }
                />
            </View>

        )
    }
}