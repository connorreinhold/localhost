import React, { Component } from 'react'
import { Text, View, Dimensions, StyleSheet, TouchableOpacity, KeyboardAvoidingView, TextInput, Image } from 'react-native'
import DatePicker from 'react-native-datepicker'
import { Icon } from 'react-native-elements'
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
            date: ""
        }
        this.datePicker = null
    }

    componentDidMount () {
        this.datePicker.onPressDate()
    }

    _renderNextButton () {
        return (
            <View>
                {
                    this.state.date === "" ?
                        <View style={[styles.buttonView, { backgroundColor: 'rgb(200,200,200)' }]}>
                            <Text style={[styles.buttonText]}>
                                Continue
                            </Text>
                        </View>
                        :
                        <TouchableOpacity onPress={this._submitEmail.bind(this)}>
                            <View style={[styles.buttonView, { backgroundColor: getTopBarColor() }]}>
                                <Text style={[styles.buttonText]}>
                                    Continue
                                </Text>
                            </View>
                        </TouchableOpacity>
                }

            </View>
        )
    }

    _submitEmail () {
        this.props.navigation.navigate("SignUpEmail", {
            first_name: this.props.navigation.state.params.first_name,
            last_name: this.props.navigation.state.params.last_name,
            birth_date: this.state.date
        })
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
                    When's your birthday?
                </Text>

                <View style={{ height: 30 * heightPixel }} />

                <View style={{ width: '100%', flexDirection: "row" }}>
                    <View style={{ width: leftMargin }} />
                    <View style={{}}>
                        <Text style={[styles.input_description]}>
                            BIRTHDAY
                        </Text>
                        <View style={{ height: 2 * heightPixel }} />
                        <DatePicker
                            style={{ justifyContent: 'center', alignItems: 'flex-start', width: 250 * widthPixel }}
                            date={this.state.date}
                            ref={(picker) => { this.datePicker = picker; }}
                            mode="date"
                            placeholder=" "
                            format="LL"
                            maxDate="2004-01-01"
                            confirmBtnText="Confirm"
                            cancelBtnText="Cancel"
                            showIcon={false}
                            customStyles={{
                                dateInput: {
                                    borderLeftWidth: 0,
                                    borderRightWidth: 0,
                                    borderTopWidth: 0,
                                    borderBottomColor: 'rgb(150,150,150)',
                                    borderBottomWidth: 1,
                                    alignItems: 'flex-start',
                                },
                                dateText: {
                                    fontFamily: 'Avenir',
                                    fontSize: 17 * widthPixel,
                                },
                                btnTextConfirm: {
                                    color: getTopBarColor(),
                                    fontWeight: '400'
                                },
                            }}
                            onDateChange={(date) => { this.setState({ date: date }) }}
                        />

                        <View style={{ height: 10 * heightPixel }} />
                    </View >

                </View>

                <View style={{ height: 50 * heightPixel }} />
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
        fontSize: 12 * widthPixel
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