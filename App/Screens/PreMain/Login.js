import React, { Component } from 'react'
import { AsyncStorage, Text, TouchableOpacity, TextInput, View, StyleSheet, Dimensions, KeyboardAvoidingView } from 'react-native'
import { Icon } from 'react-native-elements'

import { getTopBarColor } from '../../Functions/ColorFuncs.js'
import StaticGlobal from '../../Functions/StaticGlobal.js'

const heightPixel = Dimensions.get('window').height / 667
const widthPixel = Dimensions.get('window').width / 375

const leftMargin = 60 * widthPixel
const rightMargin = 60 * widthPixel
export default class Login extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            header: null
        }
    }
    constructor (props) {
        super(props)
        this.state = {
            username: "",
            password: "",
            incorrectPasswordOpacity: 0,
            pushToken: ""
        }
        this.passInput = null;
    }
    _renderLoginButton () {
        if (this.state.username === "" || this.state.password === "") {
            return (
                <View style={[styles.buttonView, { backgroundColor: 'rgb(200,200,200)' }]}>
                    <Text style={styles.buttonText}>
                        Log In
                    </Text>
                </View>
            )
        }
        else {
            return (
                <TouchableOpacity onPress={this._submitLogin.bind(this)}>
                    <View style={[styles.buttonView, { backgroundColor: getTopBarColor() }]}>
                        <Text style={styles.buttonText}>
                            Log In
                        </Text>
                    </View>
                </TouchableOpacity>
            )
        }
    }

    _checkVerification (email, token) {
        global.session_id = token
        global.email = email
        fetch(StaticGlobal.database_url + '/checkEmailConfirmed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                token: token
            })
        }).then(function (response) {
            let checkResponse = JSON.parse(response._bodyInit);
            if (checkResponse.isSuccess) {
                let isVerified = checkResponse.value
                if (isVerified) {
                    AsyncStorage.setItem('token', token, () => {
                        AsyncStorage.setItem('email', email, () => {
                            global._setLoggedIn(true)
                        })
                    });
                } else {
                    this.props.navigation.navigate("LoggedInUnverified")
                }
            }
        }.bind(this));
    }

    _submitLogin () {
        if (this.state.username === "" || this.state.password === "") {
        }
        else {
            fetch(StaticGlobal.database_url + '/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: this.state.username,
                    password: this.state.password
                }),
            }).then(function (response) {
                let loginResponse = JSON.parse(response._bodyInit);
                if (loginResponse.isSuccess) {
                    this._checkVerification(this.state.username, loginResponse.value)
                } else {
                    this.setState({
                        incorrectPasswordOpacity: 100
                    })
                }
            }.bind(this));
        }

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
                <Text style={styles.login}>
                    Log in
                </Text>
                <View style={{ height: 30 * heightPixel }} />
                <View style={{ width: '100%', flexDirection: 'row' }}>
                    <View style={{ width: leftMargin }} />
                    <View>
                        <Text style={styles.input_description}>
                            EMAIL
                        </Text>
                        <View style={{ height: 7 * heightPixel }} />
                        <TextInput
                            style={styles.textInput}
                            onChangeText={(text) => this.setState({ username: text })}
                            returnKeyType={"next"}
                            blurOnSubmit={false}
                            autoFocus={true}
                            onSubmitEditing={() => {
                                this.passInput.focus()
                            }}
                            multiline={false}
                            value={this.state.username}
                            autoCorrect={false}
                            autoCapitalize={'none'}
                        />
                        <View style={{ height: 10 * heightPixel }} />
                        <Text style={styles.input_description}>
                            PASSWORD
                        </Text>
                        <View style={{ height: 7 * heightPixel }} />
                        <TextInput
                            style={styles.textInput}
                            onChangeText={(text) => this.setState({ password: text })}
                            returnKeyType={"done"}
                            multiline={false}
                            ref={input => {
                                this.passInput = input;
                            }}
                            onSubmitEditing={() => {
                                // specify the key of the ref, as done in the previous section.
                                this._submitLogin()
                            }}
                            value={this.state.password}
                            autoCorrect={false}
                            autoCapitalize={'none'}
                            secureTextEntry={true}
                        />
                    </View>
                </View>
                <View style={{ height: 14 * heightPixel }} />
                <Text style={{ fontFamily: "Avenir", color: 'red', fontWeight: '400', fontSize: 13 * widthPixel, opacity: this.state.incorrectPasswordOpacity }}>
                    Incorrect Email/Password
                </Text>
                <View style={{ height: 10 * heightPixel }} />
                <Text style={styles.forgotPasswordText}>
                    Forgot password?
                </Text>

                <View style={{ height: 40 * heightPixel }} />
                {this._renderLoginButton()}

            </View>
        )
    }
}
const styles = StyleSheet.create({
    login: {
        fontFamily: "Avenir",
        fontWeight: '400',
        fontSize: 27 * widthPixel
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
    forgotPasswordText: {
        color: 'rgb(60,100,255)',
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