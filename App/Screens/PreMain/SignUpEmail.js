import React, {Component} from 'react'
import {Text,View, Dimensions, StyleSheet, TouchableOpacity, KeyboardAvoidingView, TextInput, Image} from 'react-native'
import {Icon} from 'react-native-elements'
import {getTopBarColor} from '../../Functions/ColorFuncs.js'
import StaticGlobal from '../../Functions/StaticGlobal.js'

const heightPixel = Dimensions.get('window').height/667
const widthPixel = Dimensions.get('window').width/375

const leftMargin = 60*widthPixel
const rightMargin = 60*widthPixel

export default class SignUpName extends Component{

    static navigationOptions = ({navigation}) => {
        return{
            header: null
        }
    }
    constructor(props){
        super(props)
        this.state={
            email:"",
            emailExistsOpacity: 0,
            buttonClickable: false
        }
    }

    _renderNextButton(){
        if(this.state.buttonClickable)
        return (
            <TouchableOpacity onPress = {this._submitEmail.bind(this)}>
                <View style={[styles.buttonView, { backgroundColor: getTopBarColor() }]}>
                    <Text style={[styles.buttonText]}>
                        Continue
                    </Text>
                </View>
            </TouchableOpacity>
        )
        else
        return (
            <View style={[styles.buttonView, { backgroundColor: 'rgb(200,200,200)' }]}>
                <Text style={[styles.buttonText]}>
                    Continue
                    </Text>
            </View>
        )
    }

    _submitEmail(){
        if(!(this.state.email.indexOf("@")==-1||this.state.email.indexOf("@")==0)){
            fetch(StaticGlobal.database_url+'/checkUserExists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: this.state.email,
                }),
            }).then(function(response){
                let emailResponse = JSON.parse(response._bodyInit);
                if(emailResponse.isSuccess){
                    if(emailResponse.value==true){
                        this.setState({
                            emailExistsOpacity: 100
                        })
                    }
                    else{
                        this.props.navigation.navigate("SignUpPass", 
                        {
                            first_name: this.props.navigation.state.params.first_name, 
                            last_name: this.props.navigation.state.params.last_name,
                            birth_date: this.props.navigation.state.params.birth_date,
                            email: this.state.email
                        }) 
                    }
                }
            }.bind(this));
        }
    }


    render(){
        return(
            <View  style = {{justifyContent: 'center', alignItems: 'center'}}>
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
                <Text style = {styles.Name}>
                    What's your college email?
                </Text>
                
                <View style = {{height: 30*heightPixel}}/>
                
                <View style = {{width : '100%', flexDirection: "row"}}>
                    <View style = {{width:leftMargin}}/>
                    <View>
                        <Text style = {styles.input_description}>
                            Email Address
                        </Text>
                        <View style = {{height: 7*heightPixel}}/>
                        <TextInput
                            style = {styles.textInput}
                            autoFocus = {true}
                            onChangeText={(text) => {
                                this.setState({email: text}, ()=>{
                                    if(this.state.email.indexOf("@")==-1||this.state.email.indexOf("@")==0){
                                        this.setState({
                                            buttonClickable: false
                                        })
                                    }else{
                                        this.setState({
                                            buttonClickable: true,
                                        })
                                    }
                                })
                            }
                            }
                            multiline = {false}
                            value = {this.state.first_name}
                            autoCorrect = {false}
                            autoCapitalize = {'none'}
                        />
                        <View style  = {{height: 10*heightPixel}}/>
                        <View style = {{width: 275*widthPixel}}/>
                    </View>
                </View>
                <Text style = {{fontFamily: 'Avenir', fontWeight: '400', fontSize: 13*widthPixel, color: 'red', opacity: this.state.emailExistsOpacity}}>
                    This email is already in use
                </Text>
                <View style = {{height: 40*heightPixel}}/>
                {this._renderNextButton()}

            </View>

        )
    }
}

const styles = StyleSheet.create({
    Name: {
        fontFamily: "Avenir",
        fontWeight: '400',
        fontSize: 20*widthPixel
    },
    input_description:{
        color: 'rgb(150,150,150)',
        fontFamily: "Avenir",
        fontWeight: '700',
        fontSize: 11*widthPixel
    },
    textInput: {
        borderBottomWidth: 1*widthPixel,
        borderColor: 'rgb(150,150,150)',
        width: 375*widthPixel - leftMargin - rightMargin,
        fontFamily: 'Avenir',
        fontSize: 15*widthPixel,
        fontWeight: '500'
    },
    termsText: {
        fontSize: 10*widthPixel,
        fontFamily: "Avenir",
        fontSize: 13*widthPixel
    },
    buttonView:{
        width: 200*widthPixel,
        borderRadius: 20*widthPixel,
        height: 40*heightPixel,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonText: {
        color: 'white',
        fontFamily: 'Avenir',
        fontWeight: '700',
        fontSize: 14*widthPixel
    }

})