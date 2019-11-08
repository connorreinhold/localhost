import React, { Component } from 'react'
import {
    FlatList, TextInput, Text, Image, View, Platform, Modal,
    StyleSheet, Dimensions, TouchableOpacity, AsyncStorage
} from 'react-native'
import { Icon } from 'react-native-elements'
import { Header, Navigation } from 'react-navigation'
import CircleBar, { _calculateNumPeople, _calculateAngle } from '../Components/CircleBar.js'
import { getTopBarColor } from '../Functions/ColorFuncs.js'
import StaticGlobal from '../Functions/StaticGlobal.js'

const heightPixel = (Dimensions.get('window').height - Header.HEIGHT) / 667
const widthPixel = Dimensions.get('window').width / 375

const topBarHeight = Header.HEIGHT //NEEDS TO BE CHECKED. THIS IS JUST AN ESTIMATE. CONSTANTS PAGE??

export default class Settings extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            title: "",
            headerTintColor: 'white',
            headerStyle: {
                backgroundColor: getTopBarColor()
            },
        }
    }

    constructor (props) {
        super(props)
        this.state = {
            page_items: [
                {
                    id: "Settings"
                },
            ],
            logoutModalVisible: false
        }
    }

    _logoutPressed () {
        AsyncStorage.getItem('token', (err, token) => {
            AsyncStorage.getItem('email', (err, email) => {
                if (token != null && email != null) {
                    AsyncStorage.multiRemove(['token', 'email'], () => {
                        global._setLoggedIn(false)
                    });
                }
                else{
                    global._setLoggedIn(false)
                }
            });
        });
    }

    _editProfilePagePressed () {
        this.props.navigation.navigate("EditProfilePage",
            {
                source_one: this.props.navigation.state.params.source_one,
                source_two: this.props.navigation.state.params.source_two,
                source_three: this.props.navigation.state.params.source_three,
                source_four: this.props.navigation.state.params.source_four,
                bio: this.props.navigation.state.params.bio,
                _informationUpdated: this.props.navigation.state.params._informationUpdated

            })
    }

    _renderItem (item) {
        return (
            <View style={{ justifyContent: 'center', backgroundColor: 'rgb(200,200,200)' }}>
                <TouchableOpacity onPress={()=>this.setState({logoutModalVisible: true})}>
                    <View style={{ backgroundColor: 'white', height: 60 * heightPixel, flexDirection: 'row', width: '100%' }}>
                        <View style={{ width: '5%' }} />
                        <View style={{ height: '100%', justifyContent: 'center', width: '90%' }}>
                            <Text style={{ fontFamily: "Avenir", fontSize: 14 * widthPixel }}>
                                Logout
                        </Text>
                        </View>
                        <View style={{ height: '100%', justifyContent: 'center' }}>
                            <Icon
                                name="angle-right"
                                type="font-awesome"
                                color={'rgb(200,200,200)'}
                                size={25 * widthPixel}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={{ width: '100%', borderBottomWidth: 1, borderBottomColor: "rgb(240,240,240)" }} />
                <TouchableOpacity onPress={this._editProfilePagePressed.bind(this)}>
                    <View style={{ backgroundColor: 'white', height: 60 * heightPixel, flexDirection: 'row', width: '100%' }}>
                        <View style={{ width: '5%' }} />
                        <View style={{ height: '100%', justifyContent: 'center', width: '90%' }}>
                            <Text style={{ fontFamily: "Avenir", fontSize: 14 * widthPixel }}>
                                Edit my profile
                        </Text>
                        </View>
                        <View style={{ height: '100%', justifyContent: 'center' }}>
                            <Icon
                                name="angle-right"
                                type="font-awesome"
                                color={'rgb(200,200,200)'}
                                size={25 * widthPixel}
                            />
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={{ width: '100%', borderBottomWidth: 1, borderBottomColor: "rgb(240,240,240)" }} />
            </View >
        )

    }

    render () {
        return (
            <View style={{ height: '100%', backgroundColor: 'rgb(247,247,247)' }}>
                <Modal
                    style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}
                    animationType="slide"
                    transparent={true}
                    visible={this.state.logoutModalVisible}>
                    <View style={{
                        width: 300 * widthPixel,
                        height: 130 * heightPixel,
                        top: 200*heightPixel,
                        shadowColor: "#a2a2a2",
                            borderRadius: 10 * widthPixel,
                            shadowOpacity: 0.5,
                            shadowRadius: 8,
                            shadowOffset: {
                                height: 2,
                                width: 0
                            },
                        left: 37.5*widthPixel,
                        backgroundColor: 'white'
                    }}>
                        <Text style={{
                            position: 'absolute',
                            top: '15%',
                            left: '5%',
                            fontSize: 15 * widthPixel,
                            fontWeight: '300',
                            fontFamily: 'Avenir'
                        }}>
                            Are you sure you want to logout?
                        </Text>
                        <View style={{ position: 'absolute', bottom: '12%', right: '12%', flexDirection: 'row' }}>
                            <TouchableOpacity onPress={this._logoutPressed.bind(this)}>
                                <View style={{
                                    borderRadius: 3 * widthPixel,
                                    minWidth: 70 * widthPixel,
                                    minHeight: 40 * heightPixel,
                                    backgroundColor: 'rgb(0,180,180)',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Text style={{
                                        color: 'white',
                                        fontFamily: 'Avenir',
                                        fontWeight: '500',
                                        fontSize: 14 * widthPixel,
                                    }}>
                                        Confirm
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <View style={{ width: 15 * widthPixel }} />
                            <TouchableOpacity onPress={()=>this.setState({logoutModalVisible: false})}>
                                <View style={{
                                    borderRadius: 3 * widthPixel,
                                    borderWidth: 1 * heightPixel,
                                    borderColor: 'rgb(150,150,150)',
                                    minWidth: 70 * widthPixel,
                                    minHeight: 40 * heightPixel,
                                    backgroundColor: 'white',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Text style={{
                                        color: 'rgb(150,150,150)',
                                        fontFamily: 'Avenir',
                                        fontWeight: '500',
                                        fontSize: 14 * widthPixel,
                                    }}>
                                        Cancel
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <FlatList
                    ref={ref => this.flatlist = ref}
                    style={{ width: '100%' }}
                    data={this.state.page_items}
                    renderItem={({ item }) => (
                        this._renderItem(item)
                    )}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        )
    }
}