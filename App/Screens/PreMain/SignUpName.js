import React, { Component } from 'react'
import { Text, View, Dimensions, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, KeyboardAvoidingView, TextInput, Image } from 'react-native'
import { getTopBarColor } from '../../Functions/ColorFuncs.js'

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
            first_name: "",
            last_name: ""
        }
        this.lastNameInput = null
    }

    _renderNextButton () {
        if (this.state.first_name == "" || this.state.last_name == "")
            return (
                <View style={[styles.buttonView, { backgroundColor: 'rgb(200,200,200)' }]}>
                    <Text style={[styles.buttonText]}>
                        Sign Up
                    </Text>
                </View>
            )
        else
            return (

                <TouchableOpacity onPress={
                    this._submitName.bind(this)
                }>
                    <View style={[styles.buttonView, { backgroundColor: getTopBarColor() }]}>
                        <Text style={[styles.buttonText]}>
                            Sign Up
                        </Text>
                    </View>
                </TouchableOpacity>
            )
    }

    _submitName () {
        if (!(this.state.first_name == "" || this.state.last_name == "")) {
            this.props.navigation.navigate("SignUpBirth", {
                first_name: this.state.first_name,
                last_name: this.state.last_name
            })
        }
    }

    render () {
        return (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ height: 75 * heightPixel }} />
                <Text style={styles.Name}>
                    What's your name?
                </Text>
                <View style={{ height: 30 * heightPixel }} />
                <View style={{ width: '100%', flexDirection: "row" }}>
                    <View style={{ width: leftMargin }} />
                    <View>
                        <Text style={styles.input_description}>
                            FIRST NAME
                        </Text>
                        <View style={{ height: 7 * heightPixel }} />
                        <TextInput
                            autoFocus={true}
                            style={styles.textInput}
                            onChangeText={(text) => this.setState({ first_name: text })}
                            returnKeyType={"next"}
                            autoCorrect={false}
                            onSubmitEditing={() => {
                                this.lastNameInput.focus()
                            }}
                            multiline={false}
                            value={this.state.first_name}
                            autoCorrect={false}
                        />
                        <View style={{ height: 10 * heightPixel }} />
                        <Text style={styles.input_description}>
                            LAST NAME
                        </Text>
                        <View style={{ height: 7 * heightPixel }} />
                        <TextInput
                            style={styles.textInput}
                            onChangeText={(text) => this.setState({ last_name: text })}
                            multiline={false}
                            autoCorrect={false}
                            value={this.state.last_name}
                            autoCorrect={false}
                            ref={input => {
                                this.lastNameInput = input;
                            }}
                        />
                        <View style={{ height: 15 * heightPixel }} />
                        <View style={{ width: 275 * widthPixel }}>
                            <Text style={styles.termsText}>
                                By continuing, you acknowledge that you have read the <Text style={{ color: 'blue' }}>Privacy Policy </Text>and agree to the <Text style={{ color: 'blue' }}>Terms of Services</Text>
                            </Text>
                        </View>
                        <View style={{ height: 40 * heightPixel }} />
                        <View style={{ width: 275 * widthPixel, }}>
                            <Text style={styles.haveAccountText}>
                                {"Already have an account?  "}
                                <TouchableWithoutFeedback onPress={() =>
                                    this.props.navigation.navigate("LoginPage")
                                }>
                                    <Text style={{ color: 'blue' }}>
                                        Sign in
                                    </Text>
                                </TouchableWithoutFeedback>
                            </Text>
                        </View>

                    </View>

                </View>

                <View style={{ height: 35 * heightPixel }} />
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
    haveAccountText: {
        fontSize: 10 * widthPixel,
        fontFamily: "Avenir",
        fontSize: 15 * widthPixel
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