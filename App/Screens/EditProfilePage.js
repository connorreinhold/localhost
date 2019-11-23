import React, { Component } from 'react'
import {
    View,
    Text,
    Dimensions,
    StyleSheet,
    Image,
    FlatList,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    Animated,
    Platform,
    TouchableOpacity,
    TouchableHighlight
} from 'react-native'
import { Icon } from 'react-native-elements'
import { getTopBarColor } from '../Functions/ColorFuncs.js'
import StaticGlobal from '../Functions/StaticGlobal.js'
import * as  ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions'
import getPermission from '../Functions/getPermission';
import { _getAvatar } from '../Functions/AvatarGen'

const heightPixel = Dimensions.get('window').height / 667
const widthPixel = Dimensions.get('window').width / 375

const picture_size = 210 * widthPixel
const picture_margins = 40 * widthPixel
const editViewWidth = 70 * widthPixel
const editViewHeight = 30 * heightPixel
const iconSize = 18 * widthPixel

const options = {
    allowsEditing: true,
};
export default class EditProfilePage extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: '',
            headerTintColor: 'white',
            headerStyle: {
                backgroundColor: getTopBarColor()
            }
        }
    }
    constructor (props) {
        super(props)
        let params = this.props.navigation.state.params
        this.state = {
            items: [
                {
                    type: "pic",
                    number: 0,
                    source: `data:image/gif;base64,${params.source_one}`,
                    hasPicture: params.source_one.length > 0,
                    changed: false
                },
                {
                    type: 'pic',
                    number: 1,
                    source: `data:image/gif;base64,${params.source_two}`,
                    hasPicture: params.source_two.length > 0,
                    changed: false
                },
                {
                    type: 'pic',
                    number: 2,
                    source: `data:image/gif;base64,${params.source_three}`,
                    hasPicture: params.source_three.length > 0,
                    changed: false
                },
                {
                    type: 'pic',
                    number: 3,
                    source: `data:image/gif;base64,${params.source_four}`,
                    hasPicture: params.source_four.length > 0,
                    changed: false
                }
            ],
            modalVisible: false,
            shadowOpacity: new Animated.Value(0),
            currentPicturePressed: -1, //either 0, 1, 2, or 3 representing which picture was pressed
            shadowZIndex: 0,
            bio: params.bio,
            profile_name: params.profile_name

        }
        this._editPicturePressed = this._editPicturePressed.bind(this)
        this._openModal = this._openModal.bind(this)
        this._closeModal = this._closeModal.bind(this)
    }
    _editPicturePressed (number) {
        this.setState({ currentPicturePressed: number }, () => {
            this._openModal()
        })
    }

    _updatePicture (result) {
        this._closeModal()
        // update the picture locally
        let updatedItems = this.state.items
        updatedItems[this.state.currentPicturePressed].source = result.uri
        updatedItems[this.state.currentPicturePressed].hasPicture = true
        updatedItems[this.state.currentPicturePressed].changed = true
        this.setState({
            items: updatedItems
        })
    }
    _selectPhoto = async () => {
        const status = await getPermission(Permissions.CAMERA_ROLL);
        if (status) {
            const result = await ImagePicker.launchImageLibraryAsync(options);
            if (!result.cancelled) {
                this._updatePicture(result)
            }
        }

    };

    _takePhoto = async () => {
        const status = await Permissions.askAsync(Permissions.CAMERA);
        const status2 = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (status && status2) {
            const result = await ImagePicker.launchCameraAsync(options);
            if (!result.cancelled) {
                this._updatePicture(result)
            }
        }
    };

    _openModal () {
        this.setState({
            modalVisible: true,
            shadowZIndex: 3
        })
        Animated.timing(
            this.state.shadowOpacity,
            {
                toValue: 0.3,
                duration: 100,
            }
        ).start()
    }

    _closeModal () {
        this.setState({
            modalVisible: false
        })
        Animated.timing(
            this.state.shadowOpacity,
            {
                toValue: 0,
                duration: 100,
            }
        ).start(() => {
            this.setState({
                shadowZIndex: 0
            })
        })
    }

    _bioChanged (text) {
        this.setState({
            bio: text
        })
    }

    _sendPictureToServer (pictureNumber) {
        if (pictureNumber == 4) {
            // after looping through all the pictures, return to previous page
            this.props.navigation.goBack(null);
            // make the profile page update with new information
            this.props.navigation.state.params._informationUpdated()
            return
        }
        if (this.state.items[pictureNumber].changed) {
            data = new FormData()
            data.append("pictureNumber", pictureNumber + "")
            data.append("token", global.session_id)
            data.append("email", global.email)
            data.append("photo", {
                name: global.email + pictureNumber,
                type: "image/jpeg",
                uri: this.state.items[pictureNumber].source
            });
            if (Platform.OS === "android") {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', StaticGlobal.database_url + '/uploadProfilePicture')

                xhr.setRequestHeader('Content-Type', 'multipart/form-data');
                xhr.send(data);

                console.log('OPENED', xhr.status);

                xhr.onprogress = function () {
                    console.log('LOADING', xhr.status);
                };
                let _sendNextPic = this._sendPictureToServer
                xhr.onload = function () {
                    console.log(xhr.status)
                    _sendNextPic(pictureNumber + 1)
                };
            }
            else {

                console.log('Making request')
                fetch(StaticGlobal.database_url + '/uploadProfilePicture', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'multipart/form-data',
                    },
                    body: data
                }).then(function (response) {
                    console.log(response)
                    return response.json()
                }).then(function (response) {
                    console.log(response)
                    let uploadPictureResponse = response
                    if (!uploadPictureResponse.isSuccess) {
                        console.log("Upload picture failed")
                    }
                    this._sendPictureToServer(pictureNumber + 1)
                }.bind(this))
            }


        }
        else {
            // if this picture wasn't edited, don't send it to the server
            this._sendPictureToServer(pictureNumber + 1)
        }
    }

    _sendDataToServer () {
        fetch(StaticGlobal.database_url + "/updateBio", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: global.session_id,
                email: global.email,
                bio: this.state.bio
            })
        }).then(function (response) {
            this._sendPictureToServer(0)
        }.bind(this))
    }
    _renderItem (item) {
        if (item.type === "pic") {
            return (
                <View>
                    <View style={{ height: 11 * heightPixel }} />
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ width: picture_margins }} />
                        <TouchableOpacity onPress={() => this._editPicturePressed(item.number)}>
                            <View style={{ width: picture_size, height: picture_size }}>
                                <Image
                                    style={styles.picture}
                                    source={
                                        item.hasPicture ? { uri: item.source } :
                                            _getAvatar(this.state.profile_name, item.number + 1)
                                    }
                                    key={item.number}
                                />
                                <View style={styles.edit_view}>
                                    <Icon
                                        name="camera"
                                        type="font-awesome"
                                        color="white"
                                        size={iconSize}
                                    />
                                    <View style={{ width: 3 * widthPixel }} />
                                    <View>
                                        <View style={{ height: 6 * heightPixel }} />
                                        <Text style={styles.edit_text}>
                                            Edit
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ height: 15 * heightPixel }} />
                </View>
            )
        }
    }
    render () {
        return (
            <View style={{ height: '100%' }}>
                <Animated.View
                    visible={this.state.modalVisible}
                    style={{
                        zIndex: this.state.shadowZIndex,
                        position: 'absolute',
                        opacity: this.state.shadowOpacity,
                        top: 0,
                        height: '100%', width: '100%',
                        backgroundColor: 'black'
                    }}
                />
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.modalVisible}>
                    <TouchableWithoutFeedback onPress={() => this._closeModal()}>
                        <View style={{ height: '100%', justifyContent: 'flex-end' }}>
                            <TouchableHighlight onPress={this._selectPhoto}>
                                <View style={{ height: 70 * heightPixel, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderBottomWidth: 1, borderColor: 'rgb(235,235,235)' }}>
                                    <View style={{ width: 25 * widthPixel }} />
                                    <Icon
                                        name="list"
                                        type="font-awesome"
                                        color="rgb(170,170,170)"
                                        size={22 * widthPixel}
                                    />
                                    <View style={{ width: 17 * widthPixel }} />
                                    <Text style={styles.modal_text}>
                                        Select Photo
                                    </Text>
                                </View>
                            </TouchableHighlight>
                            <TouchableHighlight onPress={this._takePhoto}>
                                <View style={{ height: 70 * heightPixel, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderBottomWidth: 1, borderColor: 'rgb(235,235,235)' }}>
                                    <View style={{ width: 25 * widthPixel }} />
                                    <Icon
                                        name="camera"
                                        type="font-awesome"
                                        color="rgb(170,170,170)"
                                        size={22 * widthPixel}
                                    />
                                    <View style={{ width: 17 * widthPixel }} />
                                    <Text style={styles.modal_text}>
                                        Take Photo
                                    </Text>
                                </View>
                            </TouchableHighlight>
                            <View style={{ height: 15 * heightPixel }} />
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
                <View>
                    <KeyboardAvoidingView
                        keyboardVerticalOffset={100 * heightPixel}
                        style={[{ justifyContent: 'flex-end' }]}
                        behavior='position' enabled>

                        <View style={{ height: 10 * heightPixel }} />
                        <Text style={styles.picture_label}> Profile Pictures </Text>
                        <FlatList
                            data={this.state.items}
                            extraData={this.state}
                            renderItem={({ item }) => (
                                this._renderItem.bind(this)(item)
                            )}
                            keyExtractor={item => item.number + ""}
                            showsHorizontalScrollIndicator={false}
                            horizontal={true}
                        />
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View>
                                <View style={{ height: 5 * heightPixel, backgroundColor: 'rgb(200,200,200)' }} />
                                <View style={{ height: 20 * heightPixel }} />
                                <Text style={styles.picture_label}> Bio </Text>
                                <View style={{ height: 15 * heightPixel }} />
                                <View style={{ width: '100%', alignItems: "center" }}>
                                    <TextInput
                                        style={styles.textInput}
                                        onChangeText={(text) => this._bioChanged(text)}
                                        multiline={true}
                                        placeholder={"Add a bio here"}
                                        blurOnSubmit={true}
                                        value={this.state.bio}
                                        autoCorrect={true}
                                    />
                                </View>
                                <View style={{ height: 10 * heightPixel }} />
                                <View style={{ height: 5 * heightPixel, backgroundColor: 'rgb(200,200,200)' }} />
                                <View style={{ height: 20 * heightPixel }} />
                                <TouchableOpacity onPress={this._sendDataToServer.bind(this)}>
                                    <View style={{ width: '100%', alignItems: 'center' }}>
                                        <Text style={{ fontFamily: 'Avenir', fontWeight: '700', fontSize: 19 * widthPixel, color: 'rgb(60,120,255)' }}>
                                            Save
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>

                    </KeyboardAvoidingView>
                </View>
            </View>
        )
    }
}


const styles = StyleSheet.create({
    picture: {
        position: 'absolute',
        left: 150 * widthPixel / 2 - picture_size / 2,
        width: picture_size,
        height: picture_size,
        borderRadius: picture_size / 2,
    },
    edit_view: {
        width: editViewWidth,
        height: editViewHeight,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 5 * widthPixel,
        borderWidth: 1 * widthPixel,
        borderColor: 'white',
        position: 'absolute',
        left: 150 * widthPixel / 2 - editViewWidth / 2,
        top: picture_size - 3 * editViewHeight / 2,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    edit_text: {
        fontFamily: 'Avenir',
        fontWeight: '500',
        fontSize: 16 * widthPixel,
        color: "white",
    },
    modal_text: {
        fontFamily: 'Avenir',
        fontWeight: '500',
        fontSize: 22 * widthPixel,
        color: "rgb(80,80,80)",
    },
    picture_label: {
        fontFamily: 'Avenir',
        fontWeight: '600',
        fontSize: 25 * widthPixel,
    },
    textInput: {
        width: "90%",
        height: 100 * heightPixel,
        fontFamily: 'Avenir',
        fontSize: 17 * widthPixel,
        fontWeight: '200',
    }
})
