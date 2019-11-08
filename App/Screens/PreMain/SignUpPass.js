import React, { Component } from 'react'
import { AsyncStorage, Text, View, Dimensions, StyleSheet, TouchableOpacity, KeyboardAvoidingView, TextInput, Image } from 'react-native'
import {Icon} from 'react-native-elements'
import { getTopBarColor } from '../../Functions/ColorFuncs.js'
import StaticGlobal from '../../Functions/StaticGlobal.js'

const heightPixel = Dimensions.get('window').height / 667
const widthPixel = Dimensions.get('window').width / 375

const leftMargin = 60 * widthPixel
const rightMargin = 60 * widthPixel

export default class SignUpName extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            header: null
        }
    }
    constructor (props) {
        super(props)
        this.state = {
            pass1: "",
            pass2: "",
            passwordsValid: false,
        }
        this.secondPass = null
    }

    _renderNextButton () {
        if (this.state.passwordsValid) {

            return (
                <TouchableOpacity onPress={this._createAccount.bind(this)}>
                    <View style={[styles.buttonView, { backgroundColor: getTopBarColor() }]}>
                        <Text style={[styles.buttonText]}>
                            Create Account
                        </Text>
                    </View>
                </TouchableOpacity>
            )
        }
        else
            return (
                <View style={[styles.buttonView, { backgroundColor: 'rgb(200,200,200)' }]}>
                    <Text style={[styles.buttonText]}>
                        Create Account
                    </Text>
                </View>
            )
    }
    _createAccount () {
        let first_name = this.props.navigation.state.params.first_name
        let last_name = this.props.navigation.state.params.last_name
        let birth_date = this.props.navigation.state.params.birth_date
        let email = this.props.navigation.state.params.email
        let password = this.state.pass2
        
        fetch(StaticGlobal.database_url + '/createUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName: first_name,
                lastName: last_name,
                email: email,
                password: password
            })
        }).then(function (response) {
            let passwordResponse = JSON.parse(response._bodyInit);
            if (passwordResponse.isSuccess) {
                global.session_id = passwordResponse.value
                global.email = email
                this.props.navigation.navigate("LoggedInUnverified")
                fetch(StaticGlobal.database_url + '/sendConfirmation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        hostLink: StaticGlobal.database_url
                    })
                }).then(function (response) {
                    let confirmationResponse = JSON.parse(response._bodyInit);
                    if (confirmationResponse.isSuccess) {
                    }
                }.bind(this));
            }
        }.bind(this));
        
    }

    render () {
        return (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ height: 35 * heightPixel }} />
                <View style={{ width: '90%', alignItems: 'flex-start', height: 30 * heightPixel }}>
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <Icon
                            name="angle-left"
                            type="font-awesome"
                            color={getTopBarColor()}
                            size={25 * heightPixel}
                        />
                    </TouchableOpacity>
                </View>
                <View style={{ height: 40 * heightPixel }} />
                <Text style={styles.Name}>
                    Your password
                </Text>
                <View style={{ height: 30 * heightPixel }} />
                <View style={{ width: '100%', flexDirection: "row" }}>
                    <View style={{ width: leftMargin }} />
                    <View>
                        <Text style={styles.input_description}>
                            Password
                        </Text>
                        <View style={{ height: 7 * heightPixel }} />
                        <TextInput
                            style={styles.textInput}
                            onChangeText={(text) => this.setState({ pass1: text })}
                            multiline={false}
                            autoFocus={true}
                            value={this.state.first_name}
                            autoCorrect={false}
                            onSubmitEditing={() => {
                                this.secondPass.focus()
                            }}
                            autoCapitalize={'none'}
                            secureTextEntry={true}

                        />

                        <View style={{ height: 10 * heightPixel }} />
                        <Text style={styles.input_description}>
                            Confirm Password
                            </Text>
                        <View style={{ height: 7 * heightPixel }} />
                        <TextInput
                            style={styles.textInput}
                            onChangeText={(text) => {
                                this.setState(
                                    { pass2: text }, () => {
                                        if (this.state.pass1 == "" || this.state.pass2 == "" || this.state.pass1 != this.state.pass2) {
                                            this.setState({
                                                passwordsValid: false
                                            })
                                        } else {
                                            this.setState({
                                                passwordsValid: true
                                            })
                                        }
                                    })
                            }

                            }
                            ref={input => {
                                this.secondPass = input;
                            }}
                            multiline={false}
                            value={this.state.last_name}
                            autoCorrect={false}
                            autoCapitalize={'none'}
                            secureTextEntry={true}

                        />

                        <View style={{ height: 15 * heightPixel }} />
                        <View style={{ width: 275 * widthPixel }}>
                        </View>

                    </View>

                </View>

                <View style={{ height: 40 * heightPixel }} />
                {this._renderNextButton()}

            </View>

        )
    }
}

const styles = StyleSheet.create({
    Name: {
        fontFamily: "Avenir",
        fontWeight: '400',
        fontSize: 20 * widthPixel
    },
    input_description: {
        color: 'rgb(150,150,150)',
        fontFamily: "Avenir",
        fontWeight: '700',
        fontSize: 11 * widthPixel
    },
    textInput: {
        borderBottomWidth: 1 * widthPixel,
        borderColor: 'rgb(150,150,150)',
        width: 375 * widthPixel - leftMargin - rightMargin,
        fontFamily: 'Avenir',
        fontSize: 15 * widthPixel,
        fontWeight: '500'
    },
    termsText: {
        fontSize: 10 * widthPixel,
        fontFamily: "Avenir",
        fontSize: 13 * widthPixel
    },
    buttonView: {
        width: 200 * widthPixel,
        borderRadius: 20 * widthPixel,
        height: 40 * heightPixel,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonText: {
        color: 'white',
        fontFamily: 'Avenir',
        fontWeight: '700',
        fontSize: 14 * widthPixel
    }

})